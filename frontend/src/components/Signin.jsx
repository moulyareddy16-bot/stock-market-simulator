import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Signin() {
  const navigate = useNavigate();

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

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ Extract role from your backend structure
      const role = res.data.payload.role;

      // ✅ Store token + role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);

      alert("Login Successful");

      // ✅ Role-based navigation
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "stockmanager") {
        navigate("/manager");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err.response?.data || err.message);
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
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 p-2 rounded bg-[#1e293b] text-white outline-none"
          required
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
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

        {/* Redirect */}
        <p className="text-sm text-slate-400 mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-400">
            Register
          </Link>
        </p>

      </form>
    </div>
  );
}

export default Signin;