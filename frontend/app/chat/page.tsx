"use client";

import { useState } from "react";
import { Send, Bot, User, Database, Plus, Paperclip, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "Hi! I'm your local Portable RAG Assistant. I am currently connected to the **Wildlife Population Database**. What would you like to know about global species decline or regional trends?",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/chat?message=${encodeURIComponent(currentInput)}`, {
        method: "POST",
      });
      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Error: No reply received.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to connect to the backend server. Please make sure the FastAPI server is running on port 8000.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex text-zinc-100">
      {/* Sidebar Context Manager */}
      <div className="w-80 border-r border-[#27272a] p-6 hidden lg:flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-100 mb-4">
            <Database className="w-5 h-5 text-emerald-400" />
            Active Context
          </h2>
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">LPD_2024_public</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>
            <p className="text-xs text-zinc-400">Local Vector DB (Chroma)</p>
          </div>
        </div>

        {/* <button className="flex items-center justify-center gap-2 p-3 mt-auto rounded-xl glass-panel text-sm font-medium hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border border-dashed border-[#3f3f46]">
          <Plus className="w-4 h-4" />
          Add Document Context
        </button> */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col w-full h-screen">
        <header className="px-6 py-4 md:px-10 border-b border-[#27272a]/50 flex items-center h-20 shrink-0 bg-[#09090b]/50 backdrop-blur-md">
          <div>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Wildlife Knowledge Base
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-0.5">Chatting with Local ChromaDB RAG</p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6 w-full pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 md:gap-4 ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant" 
                    ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-zinc-800 border border-zinc-700 text-zinc-300"
                }`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 md:w-5 md:h-5" /> : <User className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                
                <div className={`px-4 py-3 md:px-5 md:py-3.5 rounded-2xl max-w-[85%] md:max-w-[80%] text-sm md:text-base ${
                  msg.role === "assistant"
                    ? "glass-panel text-zinc-200"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-50"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-sm md:prose-base">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
               <div className="flex gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="px-4 py-3 md:px-5 md:py-3.5 rounded-2xl glass-panel flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-xs md:text-sm text-zinc-400">Querying Local Vector DB...</span>
                </div>
               </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-[#09090b] border-t border-[#27272a]/30 shrink-0">
          <div className="max-w-4xl mx-auto w-full relative glass-panel rounded-2xl flex items-end p-2 border border-[#27272a] focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all shadow-xl">
            {/* <button className="p-3 text-zinc-400 hover:text-emerald-400 transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
            </button> */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about the wildlife dataset..."
              className="flex-1 max-h-48 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none p-3 text-zinc-100 placeholder:text-zinc-500 outline-none text-sm md:text-base leading-relaxed"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 m-1 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors shrink-0 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-3 max-w-4xl mx-auto">
            <p className="text-[10px] md:text-xs text-zinc-500">AI models can make mistakes. All responses are derived from Local ChromaDB embeddings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
