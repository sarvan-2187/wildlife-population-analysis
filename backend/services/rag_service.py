import os
import json
import re
import chromadb
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DASHBOARD_DATA_PATH = os.path.join(BASE_DIR, "data", "dashboard_data.json")
SPECIES_MAPPING_PATH = os.path.join(BASE_DIR, "data", "species_mapping.json")
CHROMA_DB_DIR = os.path.join(BASE_DIR, "data", "chroma_db")

# Initialize ChromaDB persistent client
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

# Get or create a collection for wildlife facts
collection = chroma_client.get_or_create_collection(name="wildlife_knowledge")

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None


def _normalize_species_key(value: str) -> str:
    return (value or "").strip().replace(" ", "_").replace("-", "_").lower()


def _load_species_mapping() -> dict[str, str]:
    if not os.path.exists(SPECIES_MAPPING_PATH):
        return {}
    try:
        with open(SPECIES_MAPPING_PATH, "r") as f:
            data = json.load(f)
        return {_normalize_species_key(k): v for k, v in data.items()}
    except Exception:
        return {}


SPECIES_COMMON_NAME_MAP = _load_species_mapping()

def _initialize_vector_db():
    if not os.path.exists(DASHBOARD_DATA_PATH):
        return

    # Check if we already populated the db (simplified check, maybe force update?)
    if collection.count() > 300: # Assuming if > 300, we already have species
        return

    with open(DASHBOARD_DATA_PATH, "r") as f:
        data = json.load(f)

    documents = []
    ids = []

    # 1. Summary Facts
    summary = data.get("summary", {})
    documents.append(f"Global Fact: The overall decline rate of tracked species is {summary.get('global_decline_rate')}.")
    ids.append("summary_decline")
    
    # 2. Regional Facts
    regional_data = data.get("regional_data", {})
    for country, info in regional_data.items():
        growth = info.get("growth_rate", 0)
        status = info.get("status", "Stable")
        marine_status = info.get("marine_status", "No Data")
        
        doc = f"Regional Fact: {country} is {status}. General growth: {growth*100:.2f}%. Marine health: {marine_status}."
        documents.append(doc)
        ids.append(f"region_{country.replace(' ', '_')}")

    # 3. Species-Specific Facts (AI ENRICHMENT)
    species_data = data.get("species_data", [])
    for s in species_data:
        b_name = s.get("binomial")
        c_name = s.get("name")
        status = s.get("status")
        growth = s.get("growth")
        system = s.get("system")
        region = s.get("region")
        
        doc = f"Species Fact: {c_name} (Scientific name: {b_name}) is a {system} species in the {region} region. It is currently {status} with a growth rate of {growth}%."
        documents.append(doc)
        ids.append(f"species_{b_name.replace(' ', '_')}")

    # Insert into ChromaDB in batches
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        collection.upsert(
            documents=documents[i:i+batch_size],
            ids=ids[i:i+batch_size]
        )

# Call this once on startup
_initialize_vector_db()

def get_rag_response(query: str) -> str:
    """Queries the ChromaDB collection and returns a synthesized answer via Groq."""
    _initialize_vector_db()
    
    # Retrieve top relevant facts
    results = collection.query(
        query_texts=[query],
        n_results=5,
        include=["documents", "distances"]
    )

    retrieved_facts = results["documents"][0] if results["documents"] else []
    context = "\n".join(retrieved_facts)

    if not groq_client:
        # Fallback to simple retrieval if no Groq API Key
        if not retrieved_facts:
            return "No relevant facts found for that query."
        return f"**Found {len(retrieved_facts)} relevant facts in DB (Groq offline):**\n\n" + "\n".join([f"- {d}" for d in retrieved_facts])

    # Synthesize with Groq
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are a Wildlife Conservation Analyst. Use the following retrieved facts to answer the user's question accurately. If the facts are missing common/general names for species mentioned by their scientific name, you may use your internal specialized knowledge to provide those names, but clearly distinguish between data retrieved from the database and your general knowledge. For all population statistics, trends, and growth rates, you MUST strictly prioritize the provided context data.\n\nContext:\n{context}"
                },
                {
                    "role": "user",
                    "content": query,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Error connecting to Groq: {str(e)}\n\n**Retrieved Facts:**\n{context}"


def _extract_common_name_from_docs(species_name: str, docs: list[str]) -> str:
    """Extract common name from species facts in retrieved docs."""
    if not docs:
        return "Unknown"

    candidates = {
        species_name,
        species_name.replace("_", " "),
        species_name.replace(" ", "_"),
    }
    normalized = {c.lower().strip() for c in candidates}

    for doc in docs:
        # Expected format:
        # Species Fact: <common_name> (Scientific name: <binomial>) is a ...
        match = re.search(r"^Species Fact:\s*(.*?)\s*\(Scientific name:\s*(.*?)\)", doc)
        if not match:
            continue

        common_name = match.group(1).strip()
        scientific_name = match.group(2).strip().lower()

        if scientific_name in normalized or scientific_name.replace("_", " ") in normalized:
            return common_name

    return "Unknown"


def get_species_common_name(species_name: str) -> str:
    """Resolve a species scientific/binomial name to common/general name via Groq + retrieval."""
    _initialize_vector_db()

    query_name = species_name.replace("-", "_").strip()
    query_name_key = _normalize_species_key(query_name)
    query_name_spaced = query_name.replace("_", " ")

    # Deterministic mapping first (reload to pick up script updates immediately).
    mapped = _load_species_mapping().get(query_name_key)
    if mapped:
        return mapped

    retrieval_query = f"Scientific name: {query_name_spaced}"

    results = collection.query(
        query_texts=[retrieval_query],
        n_results=5,
        include=["documents", "distances"],
    )
    docs = results.get("documents", [[]])[0] if results.get("documents") else []

    # Deterministic fallback from indexed facts.
    extracted = _extract_common_name_from_docs(query_name, docs)
    if not groq_client:
        return extracted

    context = "\n".join(docs)
    prompt = (
        "Return ONLY the most accepted English common/general name for the provided scientific binomial. "
        "You may use standard biological knowledge if retrieval context is sparse. "
        "If genuinely unknown, return exactly 'Unknown'. "
        "No explanations, no markdown, no extra punctuation."
    )

    try:
        completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": (
                        f"Scientific name: {query_name_spaced}\n"
                        f"Alt format: {query_name}\n"
                        f"Retrieved context:\n{context}\n\n"
                        "Return only the common/general name."
                    ),
                },
            ],
            model="llama-3.3-70b-versatile",
        )
        value = (completion.choices[0].message.content or "").strip().strip('"').strip("'")
        if value:
            return value.splitlines()[0].strip()
        return extracted
    except Exception:
        return extracted
