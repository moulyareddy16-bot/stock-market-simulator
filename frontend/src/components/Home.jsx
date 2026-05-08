import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "trader") {
      navigate("/portfolio", { replace: true });
    } else if (role === "admin") {
      navigate("/admin", { replace: true });
    } else if (role === "stockmanager") {
      navigate("/manager", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="bg-[#020617] text-white">

      {/* 🔥 HERO */}
      <section className="h-[calc(100vh-64px)] flex flex-col justify-center items-center text-center 
      bg-linear-to-b from-[#020617] via-[#0f172a] to-[#020617] px-6">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Master Trading <br />
          <span className="text-emerald-400">Without Risk</span>
        </h1>

       <p className="mt-6 text-slate-400 max-w-xl overflow-hidden whitespace-nowrap border-r-4 border-orange-500 animate-typewriter">
  Practice stock trading using virtual money and learn market strategies safely.
</p>


        <Link
          to="/register"
          className="mt-8 px-8 py-3 bg-emerald-500 text-black rounded-lg hover:bg-emerald-600 transition"
        >
          Get Started
        </Link>

      </section>

      {/* DIVIDER */}
      <div className="h-px bg-slate-800 mx-10"></div>
      {/* 🖼️ IMAGE SECTION (Text LEFT | Image RIGHT) */}
<section className="py-16 px-6 md:px-16 flex flex-col md:flex-row-reverse gap-10 items-center">

  {/* IMAGE (RIGHT) */}
  <img
    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"
    alt="stocks"
    className="rounded-lg h-64 w-full md:w-1/2 object-cover border border-slate-800 hover:scale-105 transition"
  />

  {/* TEXT (LEFT) */}
  <div className="md:w-1/2">
    <h2 className="text-2xl font-semibold">
      Realistic Trading Experience
    </h2>
    <p className="text-slate-400 mt-3">
      Simulate buying and selling stocks with live-like price movements.
    </p>
  </div>

</section>
      {/* DIVIDER */}
      <div className="h-px bg-slate-800 mx-10"></div>

      {/* 📊 MARKET TREND (Chart LEFT | Text RIGHT) */}
      <section className="py-16 px-6 md:px-16 grid md:grid-cols-2 gap-10 items-center">

        <div className="bg-[#030820] border border-slate-800 rounded-lg p-6">
          <div className="flex items-end gap-2 h-48">
            {[20,40,35,60,55,70,65,80,75,90].map((h,i)=>(
              <div
                key={i}
                className="bg-emerald-400 w-full rounded-md hover:bg-emerald-500 transition"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">
            Market Trend Simulation
          </h2>

          <p className="text-slate-400 mt-3">
            Visualize stock price movements and understand how the market behaves 
            in real-time scenarios.
          </p>

          <p className="text-slate-500 mt-2 text-sm">
            Track ups and downs, analyze patterns, and improve your trading decisions.
          </p>
        </div>

      </section>

      {/* DIVIDER */}
      <div className="h-px bg-slate-800 mx-10"></div>

      {/* 🖼️ SECOND SECTION (Text LEFT | Image RIGHT) */}
      <section className="py-16 px-6 md:px-16 flex flex-col md:flex-row-reverse gap-10 items-center">

        <img
          src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"
          alt="analysis"
          className="rounded-lg h-64 w-full md:w-1/2 object-cover border border-slate-800 hover:scale-105 transition"
        />

        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold">
            Learn Before You Invest
          </h2>
          <p className="text-slate-400 mt-3">
            Understand stock market basics, risk management, and portfolio building.
          </p>
        </div>

      </section>

      {/* 🚀 CTA */}
      <section className="text-center py-16">

        <h2 className="text-2xl font-semibold mb-4">
          Start Your Trading Journey Today
        </h2>

        <Link
          to="/register"
          className="px-6 py-3 bg-emerald-500 text-black rounded-lg hover:bg-emerald-600 transition"
        >
          Start Trading Now
        </Link>

      </section>

    </div>
  );
}

export default Home;
