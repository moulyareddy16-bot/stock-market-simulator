import Footer from "./Footer";
import Navbar from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Root() {
  const navigate = useNavigate();

  useEffect(() => {
    const navEntry = window.performance.getEntriesByType("navigation")[0];

    // check if page was refreshed
    if (navEntry && navEntry.type === "reload") {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto mt-16 mb-16">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Root;