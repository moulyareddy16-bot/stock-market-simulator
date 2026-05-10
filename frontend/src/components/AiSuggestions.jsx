import { useEffect, useRef, useState } from "react";

function AiSuggestions() {

  // ==============================
  // MAIN AI DATA
  // ==============================

  const [data, setData] = useState({
    summary: "",
    marketSentiment: "NEUTRAL",
    traderScore: 0,
    riskWarning: "",
    portfolioHealth: {
      diversificationScore: 0,
      concentrationRisk: "LOW",
    },
    suggestions: [],
  });

  // ==============================
  // CHAT STATES
  // ==============================

  const [chatOpen, setChatOpen] =
    useState(false);

  const [chatInput, setChatInput] =
    useState("");

  const [chatLoading, setChatLoading] =
    useState(false);

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "Alpha-Insight AI initialized. Ask about your portfolio, risk, or market opportunities.",
      },
    ]);

  const [loading, setLoading] =
    useState(true);

  const chatEndRef = useRef(null);

  // ==============================
  // AUTO SCROLL CHAT
  // ==============================

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // ==============================
  // FETCH AI ANALYSIS
  // ==============================

  useEffect(() => {

    const fetchAI = async () => {

      try {

        const response =
          await fetch(
            "http://localhost:5000/api/ai/suggestions",
            {
              credentials: "include",
            }
          );

        const resData =
          await response.json();

        if (resData?.payload) {
          setData(resData.payload);
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

    fetchAI();

  }, []);

  // ==============================
  // AI CHAT
  // ==============================

  const sendMessage = async () => {

    if (!chatInput.trim()) return;

    const userMessage = {
      role: "user",
      content: chatInput,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setChatLoading(true);

    const currentInput = chatInput;

    setChatInput("");

    try {

      const response =
        await fetch(
          "http://localhost:5000/api/ai/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              message: currentInput,
            }),
          }
        );

      const resData =
        await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            resData.response ||
            "AI unavailable.",
        },
      ]);

    } catch (err) {

      console.log(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "AI communication failed.",
        },
      ]);

    } finally {

      setChatLoading(false);
    }
  };

  // ==============================
  // LOADING SCREEN
  // ==============================

  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-2xl font-black tracking-widest uppercase">
            Initializing Alpha Insight Engine
          </h1>
        </div>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (

    <div className="min-h-screen bg-[#050816] text-white pb-40">

      {/* ================================= */}
      {/* HERO */}
      {/* ================================= */}

      <section className="relative overflow-hidden border-b border-slate-800">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),transparent_30%)]" />

        <div className="relative z-10 p-8 lg:p-14">

          <div className="flex flex-wrap items-center gap-3 mb-6">

            <div className="px-4 py-1 bg-emerald-500/20 border border-emerald-500/20 rounded-full text-xs uppercase font-black tracking-widest text-emerald-400">
              Alpha Insight Engine
            </div>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 font-black">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI LIVE
            </div>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight max-w-5xl">
            Institutional Grade
            <span className="text-emerald-400">
              {" "}Portfolio Intelligence
            </span>
          </h1>

          <p className="mt-8 text-slate-300 max-w-3xl text-lg leading-relaxed font-medium">
            {data.summary}
          </p>

        </div>
      </section>

      {/* ================================= */}
      {/* DASHBOARD */}
      {/* ================================= */}

      <div className="p-6 lg:p-10 space-y-8">

        {/* ============================= */}
        {/* METRICS */}
        {/* ============================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* SCORE */}

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7">

            <p className="text-xs uppercase tracking-widest font-black text-slate-500">
              Trader Score
            </p>

            <h2 className="text-6xl font-black mt-4 text-white">
              {data.traderScore}
            </h2>

            <p className="text-emerald-400 mt-2 text-sm font-bold">
              AI confidence calibrated
            </p>

          </div>

          {/* SENTIMENT */}

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7">

            <p className="text-xs uppercase tracking-widest font-black text-slate-500">
              Market Sentiment
            </p>

            <h2 className={`text-5xl font-black mt-4 ${
              data.marketSentiment === "BULLISH"
                ? "text-emerald-400"
                : data.marketSentiment === "BEARISH"
                ? "text-red-400"
                : "text-yellow-400"
            }`}>
              {data.marketSentiment}
            </h2>

            <p className="text-slate-400 mt-2 text-sm">
              Based on technical + sentiment fusion
            </p>

          </div>

          {/* DIVERSIFICATION */}

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7">

            <p className="text-xs uppercase tracking-widest font-black text-slate-500">
              Diversification
            </p>

            <h2 className="text-6xl font-black mt-4 text-white">
              {Math.floor(
                data?.portfolioHealth?.diversificationScore || 0
              )}
            </h2>

            <p className="text-slate-400 mt-2 text-sm">
              Portfolio distribution health
            </p>

          </div>

          {/* RISK */}

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7">

            <p className="text-xs uppercase tracking-widest font-black text-slate-500">
              Concentration Risk
            </p>

            <h2 className={`text-5xl font-black mt-4 ${
              data?.portfolioHealth?.concentrationRisk === "HIGH"
                ? "text-red-400"
                : data?.portfolioHealth?.concentrationRisk === "MEDIUM"
                ? "text-yellow-400"
                : "text-emerald-400"
            }`}>
              {data?.portfolioHealth?.concentrationRisk}
            </h2>

            <p className="text-slate-400 mt-2 text-sm">
              Exposure concentration analysis
            </p>

          </div>
        </div>

        {/* ============================= */}
        {/* RISK WARNING */}
        {/* ============================= */}

        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8">

          <div className="flex items-start gap-5">

            <div className="text-4xl">
              ⚠️
            </div>

            <div>

              <h3 className="text-xl font-black text-red-400 uppercase tracking-widest mb-2">
                AI Risk Warning
              </h3>

              <p className="text-slate-300 leading-relaxed">
                {data.riskWarning ||
                  "Current market volatility remains elevated. Monitor overbought assets and avoid emotional trades."}
              </p>

            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* SIGNALS */}
        {/* ============================= */}

        <div>

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-black uppercase tracking-widest">
              AI Trade Signals
            </h2>

            <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
              Real-Time Strategic Intelligence
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {data?.suggestions?.map((s, i) => (

              <div
                key={i}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300"
              >

                <div className="flex items-center justify-between mb-6">

                  <div className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-black ${
                    s.type === "BUY"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : s.type === "SELL"
                      ? "bg-red-500/20 text-red-400"
                      : s.type === "HOLD"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {s.type}
                  </div>

                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Impact: {s.impact}
                  </div>

                </div>

                <h3 className="text-3xl font-black mb-4">
                  {s.title}
                </h3>

                <p className="text-slate-300 leading-relaxed">
                  {s.description}
                </p>

              </div>
            ))}

          </div>
        </div>

      </div>

      {/* ================================= */}
      {/* FLOATING AI CHAT */}
      {/* ================================= */}

      <div className="fixed bottom-6 right-6 z-50">

        {/* CHAT WINDOW */}

        {chatOpen && (

          <div className="w-[380px] h-[620px] bg-[#0b1020] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

            {/* HEADER */}

            <div className="p-5 border-b border-slate-800 flex items-center justify-between">

              <div>

                <h2 className="font-black text-lg">
                  Alpha AI
                </h2>

                <p className="text-xs uppercase tracking-widest text-emerald-400 font-black">
                  Live Trading Assistant
                </p>

              </div>

              <button
                onClick={() =>
                  setChatOpen(false)
                }
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {messages.map((m, i) => (

                <div
                  key={i}
                  className={`flex ${
                    m.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-500 text-black font-semibold"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {m.content}
                  </div>

                </div>
              ))}

              {chatLoading && (

                <div className="bg-slate-800 px-5 py-4 rounded-2xl w-fit text-sm text-slate-400">
                  Alpha AI analyzing market conditions...
                </div>
              )}

              <div ref={chatEndRef} />

            </div>

            {/* INPUT */}

            <div className="p-4 border-t border-slate-800 flex gap-3">

              <input
                type="text"
                value={chatInput}
                onChange={(e) =>
                  setChatInput(e.target.value)
                }
                placeholder="Ask about your portfolio..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 rounded-2xl transition"
              >
                ↑
              </button>

            </div>
          </div>
        )}

        {/* FLOAT BUTTON */}

        {!chatOpen && (

          <button
            onClick={() =>
              setChatOpen(true)
            }
            className="w-20 h-20 rounded-full bg-emerald-500 hover:scale-110 transition-all duration-300 text-black text-4xl shadow-2xl shadow-emerald-500/30"
          >
            🤖
          </button>
        )}
      </div>
    </div>
  );
}

export default AiSuggestions;