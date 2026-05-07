import { NavLink, useNavigate } from "react-router-dom";
import api from "../service/api";
import myImage from '../assets/logo.jpeg'

function Navbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout Error:", error.response?.data || error.message);
    } finally {
      localStorage.removeItem("role");
      localStorage.removeItem("username");

      navigate("/signin");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 
    bg-[#020617]/80 backdrop-blur-md border-b border-slate-800">

      {/* LOGO */}
     <NavLink
to="/"
className="text-2xl font-bold text-emerald-400"
>

   <img
      src={myImage}
      alt="Logo"
      className="h-10"
   />

</NavLink>

      {/* RIGHT SIDE */}
      <div className="flex gap-3 items-center">

        {/* IF NOT LOGGED IN */}
        {!role ? (
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
