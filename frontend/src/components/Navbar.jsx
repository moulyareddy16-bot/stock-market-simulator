import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 
    bg-[#020617]/80 backdrop-blur-md border-b border-slate-800">

      <NavLink to="/" className="text-2xl font-bold text-emerald-400">
        StockSim
      </NavLink>

      <div className="flex gap-3">
        <NavLink
          to="/signin"
          className="px-4 py-1 border border-emerald-400 text-emerald-400 rounded hover:bg-emerald-400 hover:text-black transition"
        >
          Login
        </NavLink>

        <NavLink
          to="/register"
          className="px-4 py-1 bg-emerald-500 text-black rounded hover:bg-emerald-600 transition"
        >
          Get Started
        </NavLink>
      </div>

    </nav>
  );
}

export default Navbar;