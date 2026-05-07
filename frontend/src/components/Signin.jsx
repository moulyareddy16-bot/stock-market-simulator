import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../service/api";
import Home from "./Home";

const authImage =
  "https://img.etimg.com/thumb/width-1200,height-900,imgsize-87918,resizemode-75,msid-113755821/wealth/invest/stocks-to-buy-look-for-stocks-with-improved-earnings-quality-5-stocks-with-up-to-28-upside-potential.jpg";

function Signin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);
      const user = res.data.payload;
      const role = user?.role;

      if (!role) {
        alert("Login failed: Role not found");
        return;
      }

      localStorage.setItem("role", role);
      localStorage.setItem("username", user.username);

      alert("Login Successful");

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "stockmanager") {
        navigate("/manager", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="relative min-h-screen">
      <Home />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
        <div className="relative grid w-full max-w-3xl overflow-hidden rounded-2xl bg-[#6b746f] shadow-2xl md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute right-4 top-4 z-20 rounded-full px-3 py-1 text-lg font-bold leading-none text-slate-500 transition hover:bg-slate-100 md:text-white md:hover:bg-white/20"
            aria-label="Close sign in"
          >
            X
          </button>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-[500px] flex-col justify-center px-8 py-12 text-slate-950 md:px-14"
          >
            <h2 className="text-center text-3xl font-extrabold tracking-wide text-slate-950">
              LOGIN
            </h2>

            <p className="mb-10 mt-2 text-[15px] text-center text-xs bg-[#6b746f]">
              Welcome back to StockSim
            </p>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="mb-5 w-full  rounded-lg bg-[#f1efff] px-4 py-3 text-lg text-slate-900 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500"
            />

            <div className="relative mb-8">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-[#f1efff] px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-violet-100 hover:text-violet-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
                    <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 5 9 8a8.8 8.8 0 0 1-2 3.6" />
                    <path d="M6.6 6.6C4.4 8 3 10.3 3 12c0 3 4 8 9 8 1.2 0 2.4-.3 3.5-.8" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="mx-auto block rounded-lg bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-700"
            >
              Login Now
            </button>

            <p className="mt-10 text-center text-sm text-white">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-red-500 hover:text-violet-700"
              >
                Register
              </Link>
            </p>
          </form>

          <div className="relative hidden min-h-[500px] overflow-hidden bg-violet-600 md:block">
            <div className="absolute -right-16 -top-14 h-44 w-44 rounded-full border-[18px] border-white/10"></div>
            <div className="absolute bottom-[-80px] left-8 h-56 w-56 rounded-full border-[22px] border-white/10"></div>
            <img
              src={authImage}
              alt="StockSim user"
              className="relative z-10 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
