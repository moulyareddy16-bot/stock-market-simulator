import Footer from "./Footer";
import Navbar from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Root() {
  const navigate = useNavigate();

  useEffect(() => {
    const navEntry = window.performance.getEntriesByType("navigation")[0];
    const role = localStorage.getItem("role");

    // On a fresh visit show Home. If a logged-in trader refreshes,
    // take them back to the portfolio dashboard.
    if (navEntry?.type === "reload" && role === "trader") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 mt-16 mb-16">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Root;
