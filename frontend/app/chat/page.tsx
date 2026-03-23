"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Database, Plus, Paperclip, Loader2, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "Hi! I'm your **EcoDynamix Intelligence Assistant**. I am currently connected to the **Global Species Population Database**. What would you like to know about environmental trends, population dynamics, or conservation status?",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
          content: "Failed to connect to the backend server. Please make sure the EcoDynamix Engine (FastAPI) is running on port 8000.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen flex flex-col text-zinc-100 bg-[#09090b] overflow-hidden">
      {/* Enhanced Full-Width Header */}
      <header className="px-6 py-4 md:px-12 border-b border-[#27272a]/50 flex items-center justify-between h-24 shrink-0 bg-[#09090b]/80 backdrop-blur-xl z-50">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            EcoDynamix Knowledge Base
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <p className="text-[10px] md:text-xs text-zinc-400 font-medium uppercase tracking-widest">Neural RAG Engine Active</p>
          </div>
        </div>

        {/* Floating Context Badge */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-2xl bg-zinc-900/50 border border-[#27272a] shadow-inner">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Active Context</span>
            <span className="text-xs font-semibold text-emerald-400">LPD_2024_public</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-10 w-full mb-12">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 md:gap-8 ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-105 duration-300 ${
                msg.role === "assistant" 
                  ? "bg-gradient-to-br from-emerald-500 to-blue-600 text-white ring-2 ring-emerald-500/20" 
                  : "bg-zinc-800 border border-zinc-700 text-zinc-300"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-5 h-5 md:w-6 md:h-6" /> : <User className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              
              <div className={`px-5 py-4 md:px-8 md:py-6 rounded-[2.5rem] max-w-[90%] md:max-w-[75%] shadow-2xl relative ${
                msg.role === "assistant"
                  ? "glass-panel text-zinc-200 rounded-tl-none border-l-2 border-emerald-500/30"
                  : "bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border border-emerald-500/20 text-emerald-50 rounded-tr-none"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-sm md:prose-base selection:bg-emerald-500/30">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex gap-4 md:gap-8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shrink-0 animate-pulse ring-2 ring-emerald-500/20">
                <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="px-5 py-4 md:px-8 md:py-5 rounded-[2.5rem] rounded-tl-none glass-panel flex items-center gap-4 bg-zinc-900/50">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span className="text-xs md:text-sm text-zinc-400 font-medium tracking-wide">Synthesizing ecological data...</span>
              </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area - Part of Flex Column */}
      <div className="w-full p-4 md:p-8 shrink-0 bg-[#09090b] border-t border-[#27272a]/30">
        <div className="max-w-4xl mx-auto w-full relative">
           <div className="glass-panel rounded-[2rem] flex items-end p-2 border border-[#27272a] focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-500 shadow-xl">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Inquire about species population dynamics..."
                className="flex-1 max-h-48 min-h-[56px] bg-transparent border-0 focus:ring-0 resize-none p-4 text-zinc-100 placeholder:text-zinc-600 outline-none text-sm md:text-lg leading-relaxed scrollbar-hide"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-4 m-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 transition-all shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
