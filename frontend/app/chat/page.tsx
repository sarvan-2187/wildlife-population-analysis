"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Database, Loader2, Send, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { API_ENDPOINTS } from "../../lib/api-config";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Welcome to **EcoDynamix Intelligence Assistant**. Ask about population decline, species behavior, conservation urgency, or regional risk and I will synthesize data-backed insights.",
  },
];

const starterPrompts = [
  "Which regions show converging decline across terrestrial and marine systems?",
  "Summarize species currently in sustained recovery and where this is happening.",
  "Explain high-risk indicators policymakers should monitor in the next five years.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_ENDPOINTS.CHAT}?message=${encodeURIComponent(message)}`, {
        method: "POST",
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No reply received from the inference engine.",
        },
      ]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection to backend failed. Start the EcoDynamix FastAPI engine on port 8000 and try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 pt-5 md:pt-6 pb-2 md:pb-3 min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-1.5rem)] flex flex-col gap-5">
      <header className="glass-panel rounded-3xl p-6 md:p-8 shrink-0">
        <p className="section-heading">Neural Knowledge Layer</p>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl text-[#e9fff8] font-bold">EcoDynamix Research Copilot</h1>
            <p className="mt-3 text-[#9ebcb4] max-w-3xl">
              Ask high-context ecological questions and receive grounded answers combining dataset retrieval with model-informed explanation.
            </p>
          </div>
          <div className="glass-chip rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#bde6db] inline-flex items-center gap-2">
            <Database className="w-4 h-4" />
            Dataset: LPD 2024 + Integrated Predictions
          </div>
        </div>
      </header>

      <section className="grid lg:grid-cols-[1.4fr_3fr] gap-5 flex-1 min-h-0 overflow-hidden">
        <aside className="glass-panel rounded-3xl p-5 h-fit lg:h-full lg:overflow-y-auto">
          <h2 className="text-lg text-[#e7fff7]">Starter prompts</h2>
          <p className="text-sm text-[#8ea8a1] mt-1">Use one-click prompts to speed up analysis.</p>
          <div className="mt-4 space-y-3">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="w-full text-left rounded-xl px-3 py-3 bg-[#0d1f2b] border border-[#31505d] text-[#cee9e2] text-sm hover:bg-[#112a38] transition"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl p-3 bg-[#0d1d27] border border-[#304b58] text-sm text-[#9cb9b1]">
            <p className="inline-flex items-center gap-2 text-[#d4f6ed] font-medium">
              <Sparkles className="w-4 h-4" />
              Retrieval + reasoning mode active
            </p>
            <p className="mt-2">Responses are designed for mixed audiences: researchers, operators, and policy teams.</p>
          </div>
        </aside>

        <article className="glass-panel rounded-3xl p-4 md:p-5 flex flex-col h-full min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5">
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-[#143344] border border-[#4f9b8a] text-[#94edd5]"
                      : "bg-[#162334] border border-[#4a6176] text-[#9cc6f1]"
                  }`}
                >
                  {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[88%] ${
                    msg.role === "assistant"
                      ? "bg-[#0e202b] border border-[#33515d] text-[#d4f1e8]"
                      : "bg-[#17273a] border border-[#435d74] text-[#d5e8ff]"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:text-[#d4f1e8]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#143344] border border-[#4f9b8a] text-[#94edd5] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl px-4 py-3 text-sm bg-[#0e202b] border border-[#33515d] text-[#cde9e0] inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing ecological context...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 border-t border-[#304c57] pt-4">
            <div className="rounded-2xl bg-[#0b1b26] border border-[#34505b] p-2 flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder="Ask a question about species decline, regions, or model forecasts..."
                className="flex-1 bg-transparent border-0 outline-none resize-none text-[#e6fff8] placeholder:text-[#76918b] p-3 min-h-14 max-h-52"
                rows={1}
              />
              <button
                onClick={() => void sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="rounded-xl px-4 py-3 bg-primary text-primary-foreground hover:brightness-105 disabled:opacity-45 disabled:hover:brightness-100 transition inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
