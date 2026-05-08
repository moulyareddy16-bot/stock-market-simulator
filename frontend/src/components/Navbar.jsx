<<<<<<< HEAD
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { token, logout } = useAuth();
=======
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
>>>>>>> c1eaa7c4ac9c594c91cd1bea77498ac0bb1c16a8

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 
    bg-[#020617]/80 backdrop-blur-md border-b border-slate-800">

<<<<<<< HEAD
      <NavLink to="/" className="text-2xl font-bold text-emerald-400">
        StockSim
      </NavLink>
=======
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
>>>>>>> c1eaa7c4ac9c594c91cd1bea77498ac0bb1c16a8

      <div className="flex gap-3 items-center">

<<<<<<< HEAD
        {!token ? (
=======
        {/* IF NOT LOGGED IN */}
        {!role ? (
>>>>>>> c1eaa7c4ac9c594c91cd1bea77498ac0bb1c16a8
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
