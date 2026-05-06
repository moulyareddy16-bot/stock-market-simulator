import Footer from "./Footer";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function Root() {
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