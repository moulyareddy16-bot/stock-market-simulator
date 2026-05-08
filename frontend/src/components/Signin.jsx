import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Signin() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔥 from context

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      // 🔥 IMPORTANT: use context login instead of localStorage directly
      login(res.data.token);

      alert("Login Successful");

      // 👉 role-based navigation (you already used this earlier)
      const role = res.data.user.role;

      if (role === "trader") navigate("/portfolio");
      else if (role === "admin") navigate("/profile");
      else if (role === "stockmanager") navigate("/stock");

    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">

      <form
        onSubmit={handleSubmit}
        className="bg-[#020617] p-8 rounded-lg border border-slate-800 w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Sign In
        </h2>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-4 p-2 rounded bg-[#1e293b] text-white outline-none"
          required
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-6 p-2 rounded bg-[#1e293b] text-white outline-none"
          required
        />

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-emerald-500 text-black rounded hover:bg-emerald-600 transition"
        >
          Login
        </button>

        <p className="text-sm text-slate-400 mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-emerald-400">
            Register
          </Link>
        </p>

      </form>
    </div>
  );
}

export default Signin;