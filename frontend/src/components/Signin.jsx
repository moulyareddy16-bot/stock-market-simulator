import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../service/api";

function Signin() {

  const navigate = useNavigate();

  // =========================================
  // FORM STATE
  // =========================================
  const [form, setForm] = useState({

    email: "",
    password: ""

  });


  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================
  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value

    });

  };


  // =========================================
  // HANDLE LOGIN
  // =========================================
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // login API call
      const res = await api.post(

        "/auth/login",

        form

      );


      console.log(
        "LOGIN RESPONSE:",
        res.data
      );


      // get user data
      const user =
        res.data.payload;


      // get role
      const role =
        user?.role;


      // role validation
      if (!role) {

        alert(
          "Login failed: Role not found"
        );

        return;

      }


      // store user info for UI
      localStorage.setItem(
        "role",
        role
      );

      localStorage.setItem(
        "username",
        user.username
      );


      // success message
      alert("Login Successful");


      // =====================================
      // ROLE BASED NAVIGATION
      // =====================================

      // ADMIN
      if (role === "admin") {

        navigate("/admin");

      }

      // STOCK MANAGER
      else if (
        role === "stockmanager"
      ) {

        navigate("/manager");

      }

      // TRADER
      else {

        navigate("/dashboard");

      }

    } catch (err) {

      console.error(

        "Login Error:",

        err.response?.data ||

        err.message

      );


      alert(

        err.response?.data?.message ||

        "Login Failed"

      );

    }

  };


  return (

    <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">

      {/* LOGIN CARD */}
      <form

        onSubmit={handleSubmit}

        className="w-96 rounded-2xl border border-slate-800 bg-[#020617] p-8 shadow-2xl"

      >

        {/* TITLE */}
        <h2 className="mb-6 text-center text-3xl font-bold text-white">

          Sign In

        </h2>


        {/* EMAIL */}
        <input

          type="email"

          name="email"

          placeholder="Email"

          value={form.email}

          onChange={handleChange}

          required

          className="mb-4 w-full rounded-lg bg-[#1e293b] p-3 text-white outline-none transition focus:ring-2 focus:ring-emerald-500"

        />


        {/* PASSWORD */}
        <input

          type="password"

          name="password"

          placeholder="Password"

          value={form.password}

          onChange={handleChange}

          required

          className="mb-6 w-full rounded-lg bg-[#1e293b] p-3 text-white outline-none transition focus:ring-2 focus:ring-emerald-500"

        />


        {/* LOGIN BUTTON */}
        <button

          type="submit"

          className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-black transition hover:bg-emerald-600"

        >

          Login

        </button>


        {/* REGISTER REDIRECT */}
        <p className="mt-5 text-center text-sm text-slate-400">

          Don&apos;t have an account?{" "}

          <Link

            to="/register"

            className="font-medium text-emerald-400 hover:text-emerald-300"

          >

            Register

          </Link>

        </p>

      </form>

    </div>

  );

}

export default Signin;