// frontend/src/components/ai/AIChatPanel.jsx

import { useEffect, useRef, useState } from "react";
import api from "../../service/api";

function AIChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Alpha-Insight Engine online. Ask about portfolio risk, market sentiment, swing trades, RSI signals, or diversification strategy.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const question = input;
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(
        "/api/ai/chat",
        {
          message: question,
        },
        {
          withCredentials: true,
        }
      );

      const aiReply = {
        role: "assistant",
        content:
          res?.data?.payload?.reply ||
          "AI engine could not generate a response.",
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "AI engine temporarily unavailable. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation memory cleared. Alpha-Insight Engine ready.",
      },
    ]);
  };

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 h-[750px] flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between bg-slate-950/40">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black mb-2">
            Conversational AI
          </p>

          <h2 className="text-2xl font-black text-white">
            Alpha-Insight Chat
          </h2>
        </div>

        <button
          onClick={clearChat}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition"
        >
          Clear
        </button>
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 border ${
                msg.role === "user"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-100"
                  : "bg-slate-900/60 border-white/5 text-slate-200"
              }`}
            >
              <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[1.5rem] px-5 py-4 bg-slate-900/60 border border-white/5 text-slate-400">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-white/5 p-5 bg-slate-950/40">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Ask AI about market trends, RSI, portfolio risk..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            className="flex-1 bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500/30"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-7 py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest hover:scale-105 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChatPanel;