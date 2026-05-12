// frontend/src/components/ai/AIChatPanel.jsx

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../service/api.js"

// ── CONSTANTS ─────────────────────────────────────────────────────────
const MAX_CHARS = 1000;

const QUICK_PROMPTS = [
  { label: "📊 Portfolio Risk", text: "Analyze my current portfolio risk and concentration." },
  { label: "📈 Buy Signals", text: "What are the best buy signals in my holdings right now?" },
  { label: "📰 Market News", text: "Give me the latest news affecting my portfolio stocks." },
  { label: "🔀 Diversify", text: "How can I better diversify my portfolio?" },
  { label: "⚠️ Risk Alerts", text: "Are there any high-risk positions I should exit?" },
  { label: "📉 RSI Analysis", text: "Explain the RSI levels for my top holdings." },
];

// ── INLINE RENDERER — handles **bold**, `code`, $TICKER ───────────────
function renderInline(text, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\$[A-Z]{1,5})/g);
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="bg-slate-800 border border-white/10 px-1.5 py-0.5 rounded text-emerald-300 text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (/^\$[A-Z]{1,5}$/.test(part)) {
          return (
            <span
              key={i}
              onClick={() => window.open(`https://www.tradingview.com/symbols/${part.slice(1)}/`, '_blank')}
              className="cursor-pointer hover:bg-emerald-500/40 inline-flex items-center px-2 py-0.5 mx-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold tracking-wider transition-colors"
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ── MARKDOWN-LIKE CONTENT PARSER ──────────────────────────────────────
function parseContent(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      output.push(<div key={i} className="h-1.5" />);
      i++; continue;
    }

    // ## Heading
    if (line.startsWith("## ")) {
      output.push(
        <p key={i} className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 mb-1 border-b border-white/10 pb-1">
          {renderInline(line.slice(3), "h" + i)}
        </p>
      );
      i++; continue;
    }

    // # Heading
    if (line.startsWith("# ")) {
      output.push(
        <p key={i} className="text-white font-black text-sm mt-2 mb-1">
          {renderInline(line.slice(2), "h" + i)}
        </p>
      );
      i++; continue;
    }

    // Horizontal rule
    if (/^[-═]{3,}$/.test(line.trim())) {
      output.push(<hr key={i} className="border-white/10 my-1" />);
      i++; continue;
    }

    // Numbered list — collect consecutive items
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^(\d+)\.\s+(.+)/);
        if (m) {
          items.push(
            <li key={i} className="flex gap-2 items-start">
              <span className="text-emerald-400 font-bold text-xs mt-0.5 flex-shrink-0 w-4">{m[1]}.</span>
              <span className="text-slate-200">{renderInline(m[2], i)}</span>
            </li>
          );
        }
        i++;
      }
      output.push(<ol key={"ol" + i} className="space-y-1.5 my-1">{items}</ol>);
      continue;
    }

    // Bullet list — collect consecutive items
    if (/^[-•▸]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-•▸]\s/.test(lines[i])) {
        const content = lines[i].replace(/^[-•▸]\s+/, "");
        items.push(
          <li key={i} className="flex gap-2 items-start">
            <span className="text-emerald-400 mt-1 flex-shrink-0 text-xs">▸</span>
            <span className="text-slate-200">{renderInline(content, i)}</span>
          </li>
        );
        i++;
      }
      output.push(<ul key={"ul" + i} className="space-y-1.5 my-1">{items}</ul>);
      continue;
    }

    // Normal paragraph
    output.push(
      <p key={i} className="leading-relaxed text-slate-200">
        {renderInline(line, i)}
      </p>
    );
    i++;
  }

  return output;
}

// ── TYPING INDICATOR ──────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-black text-black flex-shrink-0">
        AI
      </div>
      <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm px-5 py-3.5 bg-slate-900/80 border border-white/5">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <span className="text-slate-500 text-xs">Alpha-Insight is thinking…</span>
      </div>
    </div>
  );
}

// ── MESSAGE BUBBLE ────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex group items-end gap-2 ${isUser ? "justify-end flex-row-reverse" : "justify-start"}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${isUser
          ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
          : "bg-gradient-to-br from-emerald-500 to-teal-600 text-black"
        }`}>
        {isUser ? "You" : "AI"}
      </div>

      <div className={`max-w-[80%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Bubble */}
        <div className={`rounded-2xl px-5 py-3.5 border text-sm space-y-1.5 ${isUser
            ? "bg-gradient-to-br from-emerald-600/20 to-teal-700/10 border-emerald-500/30 text-emerald-50 rounded-tr-sm"
            : "bg-slate-900/80 border-white/5 text-slate-200 rounded-tl-sm"
          }`}>
          {isUser
            ? <p className="leading-relaxed">{msg.content}</p>
            : parseContent(msg.content)
          }
        </div>

        {/* Footer */}
        <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? "justify-end" : "justify-start"}`}>
          {msg.time && (
            <span className="text-slate-600 text-[10px]">{msg.time}</span>
          )}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-slate-600 hover:text-emerald-400 text-[10px] transition-colors"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
function AIChatPanel() {
  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "**Alpha-Insight Engine online.**\n\nI'm your institutional-grade AI trading assistant. I have access to:\n- **Your portfolio** — holdings, quantities, investment amounts\n- **Live market data** — real-time prices, daily change % (Finnhub)\n- **RSI(14)** — momentum indicators (Alpha Vantage)\n- **Recent news** — last 7 days of company headlines\n\nAsk me anything about your trades, risk, signals, or strategy.",
      time: getTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send a message (accepts optional override text for quick prompts)
  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText ?? input).trim();
      if (!text || loading) return;

      setShowQuickPrompts(false);
      setMessages((prev) => [...prev, { role: "user", content: text, time: getTime() }]);
      setInput("");
      setCharCount(0);
      setLoading(true);

      try {
        const res = await api.post("/ai/chat", { message: text });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res?.data?.response || "AI engine could not generate a response.",
            time: getTime(),
          },
        ]);
      } catch (err) {
        const is429 = err?.response?.status === 429;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: is429
              ? "⚠️ **Rate limit reached.** Please wait 1 minute before sending another message."
              : "⚠️ **AI engine temporarily unavailable.** Please check backend and try again.",
            time: getTime(),
          },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, loading]
  );

  // Clear chat — also wipes server-side memory
  const clearChat = async () => {
    try {
      await api.delete("/ai/chat/clear");
    } catch {
      // Best-effort — clear UI regardless
    }
    setMessages([
      {
        role: "assistant",
        content: "**Conversation memory cleared.**\n\nAlpha-Insight Engine ready for a fresh session. What would you like to analyze?",
        time: getTime(),
      },
    ]);
    setShowQuickPrompts(true);
    setInput("");
    setCharCount(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setInput(val);
      setCharCount(val.length);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isNearLimit = charCount > MAX_CHARS * 0.8;

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 h-[750px] flex flex-col overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-slate-950/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-black font-black text-sm">AI</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black leading-none mb-1">
              Conversational AI
            </p>
            <h2 className="text-lg font-black text-white leading-none">
              Alpha-Insight Chat
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Gemini Live
          </span>
          <button
            onClick={clearChat}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── DATA SOURCES BADGE ROW ─────────────────────────── */}
      <div className="flex gap-2 px-5 pt-3 flex-wrap flex-shrink-0">
        {["Gemini AI", "Finnhub Quotes", "AV RSI", "Company News"].map((src) => (
          <span
            key={src}
            className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 text-[10px] font-semibold"
          >
            {src}
          </span>
        ))}
      </div>

      {/* ── CHAT BODY ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-0">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── QUICK PROMPTS ───────────────────────────────────── */}
      {showQuickPrompts && messages.length <= 1 && !loading && (
        <div className="px-5 pb-2 flex gap-2 flex-wrap flex-shrink-0">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p.text)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 text-xs font-medium hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all disabled:opacity-40"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT AREA ──────────────────────────────────────── */}
      <div className="border-t border-white/5 px-5 pt-4 pb-5 bg-slate-950/60 flex-shrink-0">
        <div className="flex gap-3 items-end">
          {/* Textarea wrapper */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about market trends, RSI, portfolio risk, news… (Enter to send)"
              className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm outline-none focus:border-emerald-500/40 resize-none leading-relaxed transition-colors placeholder-slate-500 max-h-36 overflow-y-auto"
              style={{ minHeight: "52px" }}
            />
            {/* Char counter — only show when close to limit */}
            {charCount > 0 && (
              <span className={`absolute bottom-3 right-4 text-[10px] font-mono ${isNearLimit ? "text-amber-400" : "text-slate-600"}`}>
                {charCount}/{MAX_CHARS}
              </span>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-13 h-[52px] px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-sm uppercase tracking-wider hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:150ms]" />
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>

        {/* Hint */}
        <p className="text-slate-600 text-[10px] mt-2 px-1">
          Press <kbd className="bg-slate-800 border border-white/10 px-1 py-0.5 rounded text-slate-400">Enter</kbd> to send · <kbd className="bg-slate-800 border border-white/10 px-1 py-0.5 rounded text-slate-400">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

export default AIChatPanel;