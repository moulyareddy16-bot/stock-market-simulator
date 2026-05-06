import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "trader", // default
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      console.log(res.data);
      alert("Registered Successfully");

      navigate("/signin");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">

      <form
        onSubmit={handleSubmit}
        className="bg-[#020617] p-8 rounded-lg border border-slate-800 w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full mb-4 p-2 rounded bg-[#1e293b] text-white outline-none"
          required
        />

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
          className="w-full mb-4 p-2 rounded bg-[#1e293b] text-white outline-none"
          required
        />

        {/* Role (Radio Buttons) */}
        <div className="mb-6">
          <p className="text-slate-300 mb-2">Select Role</p>

          <div className="flex gap-6">

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="trader"
                checked={form.role === "trader"}
                onChange={handleChange}
                className="accent-emerald-400"
              />
              Trader
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={form.role === "admin"}
                onChange={handleChange}
                className="accent-emerald-400"
              />
              Admin
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="stockmanager"
                checked={form.role === "stockmanager"}
                onChange={handleChange}
                className="accent-emerald-400"
              />
              Stock Manager
            </label>

          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-emerald-500 text-black rounded hover:bg-emerald-600 transition"
        >
          Register
        </button>

        <p className="text-sm text-slate-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-emerald-400">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}

export default Register;