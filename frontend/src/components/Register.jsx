import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "trader", // ✅ fixed role
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
      alert(err.response?.data?.message || "Registration Failed");
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
          className="w-full mb-6 p-2 rounded bg-[#1e293b] text-white outline-none"
          required
        />

        {/* Hidden Role */}
        <input type="hidden" name="role" value="trader" />

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