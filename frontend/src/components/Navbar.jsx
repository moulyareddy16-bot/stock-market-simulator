import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { token, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 
    bg-[#020617]/80 backdrop-blur-md border-b border-slate-800">

      <NavLink to="/" className="text-2xl font-bold text-emerald-400">
        StockSim
      </NavLink>

      <div className="flex gap-3 items-center">

        {!token ? (
          <>
            <NavLink to="/signin">Login</NavLink>
            <NavLink to="/register">Get Started</NavLink>
          </>
        ) : (
          <button
            onClick={logout}
            className="px-4 py-1 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
