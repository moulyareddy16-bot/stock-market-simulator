import { Link } from "react-router-dom";

function Home() {
  return (
    <div>

      {/* 🔥 FULL SCREEN HERO */}
      <section className="h-[calc(100vh-64px)] flex flex-col justify-center items-center text-center 
      bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] px-6">

        <h1 className="text-6xl font-bold">
          Master Trading <br />
          <span className="text-emerald-400">Without Risk</span>
        </h1>

        <p className="mt-6 text-slate-400 max-w-xl">
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
      <div className="h-[1px] bg-slate-800 mx-10"></div>

      {/* IMAGE SECTION */}
      <section className="py-16 px-6 md:px-16 grid md:grid-cols-2 gap-10 items-center">

        <img
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"
          alt="stocks"
          className="rounded-lg h-64 w-full object-cover border border-slate-800"
        />

        <div>
          <h2 className="text-2xl font-semibold">
            Realistic Trading Experience
          </h2>
          <p className="text-slate-400 mt-3">
            Simulate buying and selling stocks with live-like price movements.
          </p>
        </div>

      </section>

      {/* GRAPH SECTION */}
      <section className="py-16 px-6">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Market Trend Simulation
        </h2>

        <div className="bg-[#020617] border border-slate-800 rounded-lg p-6 max-w-3xl mx-auto">

          <div className="flex items-end gap-1 h-40">
            {[20,40,35,60,55,70,65,80,75,90].map((h,i)=>(
              <div
                key={i}
                className="bg-emerald-400 w-full"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-6 py-16 px-6 md:px-16">

        <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800">
          <h3 className="text-lg font-semibold text-emerald-400">📊 Analyze</h3>
          <p className="text-slate-400 mt-2 text-sm">
            Study stock trends and make informed decisions.
          </p>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800">
          <h3 className="text-lg font-semibold text-emerald-400">💼 Invest</h3>
          <p className="text-slate-400 mt-2 text-sm">
            Build your virtual portfolio with strategies.
          </p>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800">
          <h3 className="text-lg font-semibold text-emerald-400">📈 Grow</h3>
          <p className="text-slate-400 mt-2 text-sm">
            Improve trading skills over time.
          </p>
        </div>

      </section>

      {/* SECOND IMAGE */}
      <section className="py-16 px-6 md:px-16 grid md:grid-cols-2 gap-10 items-center">

        <div>
          <h2 className="text-2xl font-semibold">
            Learn Before You Invest
          </h2>
          <p className="text-slate-400 mt-3">
            Understand stock market basics, risk management, and portfolio building.
          </p>
        </div>

        <img
          src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"
          alt="analysis"
          className="rounded-lg h-64 w-full object-cover border border-slate-800"
        />

      </section>

      {/* CTA */}
      <section className="text-center py-16">
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