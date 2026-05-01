"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import api from "../../src/services/api";
import Navbar from "../../components/Navbar";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am the Smart Hospital AI Doctor. I can help you with preliminary health advice, suggest specialists, and answer medical questions. How can I help you today?",
      isBot: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage = { id: Date.now(), text: input, isBot: false, time: now };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/rag/chat/", { query: userMessage.text });
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response || response.data.answer || "I received your message, but the response format was unexpected.",
        isBot: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const backendError = error.response?.data?.error || error.response?.data?.detail;
      const errorMessage = {
        id: Date.now() + 1,
        text: backendError 
          ? `Backend Error: ${backendError}` 
          : "Sorry, I am having trouble connecting to the server right now. Please ensure the backend is running.",
        isBot: true,
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="flex-grow flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 h-[calc(100vh-64px)]">
        {/* Chat Header */}
        <div className="bg-white dark:bg-dark-card rounded-t-2xl border border-b-0 border-slate-200 dark:border-dark-border p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-500" />
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-full flex items-center justify-center shadow-md shadow-primary-500/20">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                AI Doctor Assistant
                <Sparkles size={14} className="text-amber-400" />
              </h1>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow bg-white dark:bg-dark-card border-x border-slate-200 dark:border-dark-border overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"} animate-fadeInUp`}>
              <div className={`flex max-w-[80%] gap-3 ${msg.isBot ? "flex-row" : "flex-row-reverse"}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-auto mb-1 ${
                  msg.isBot
                    ? "bg-gradient-to-br from-primary-400 to-primary-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {msg.isBot ? <Bot size={14} /> : <User size={14} />}
                </div>

                {/* Message Bubble */}
                <div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.isBot
                      ? msg.isError
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-bl-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                      : "bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-sm shadow-md shadow-primary-500/20"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-1 ${msg.isBot ? "text-left" : "text-right"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fadeInUp">
              <div className="flex max-w-[80%] gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center mt-auto mb-1">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2 text-slate-500">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm ml-1">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white dark:bg-dark-card rounded-b-2xl border border-t-0 border-slate-200 dark:border-dark-border p-4 shadow-sm">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health concern here..."
              className="flex-grow input-field"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 transition-all flex items-center justify-center shadow-md shadow-primary-500/20"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-2">
            AI responses are for guidance only and do not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
