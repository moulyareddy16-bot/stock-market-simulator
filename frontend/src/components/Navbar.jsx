import { NavLink, useNavigate } from "react-router-dom";
import myImage from '../assets/logo.jpeg'

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // if stored

    navigate("/signin");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 
    bg-[#020617]/80 backdrop-blur-md border-b border-slate-800">

      {/* LOGO */}
      <NavLink to="/" className="text-2xl font-bold text-emerald-400">
        <a href={myImage} target="_blank" rel="noreferrer">
     SimStock
    </a>
      </NavLink>

      {/* RIGHT SIDE */}
      <div className="flex gap-3 items-center">

        {/* IF NOT LOGGED IN */}
        {!token ? (
          <>
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
          </>
        ) : (
          /* IF LOGGED IN */
          <button
            onClick={handleLogout}
            className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;