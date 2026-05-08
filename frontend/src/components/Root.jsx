import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  // Auth pages should not have sidebar/navbar sometimes, 
  // but for now, we'll just toggle the sidebar based on role and path.
  const isAuthPage = ["/signin", "/register"].includes(location.pathname);
  const showSidebar = role && !isAuthPage && location.pathname !== "/";

  useEffect(() => {
    const navEntry = window.performance.getEntriesByType("navigation")[0];
    if (navEntry?.type === "reload" && role === "trader" && location.pathname === "/") {
      navigate("/portfolio", { replace: true });
    }
  }, [navigate, role, location.pathname]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Navbar />
      
      <div className="flex pt-16">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 transition-all duration-300 ${showSidebar ? "ml-20 lg:ml-64" : ""}`}>
          <div className="p-6 lg:p-10 max-w-(--breakpoint-2xl) mx-auto">
            <Outlet />
          </div>
          {!showSidebar && <Footer />}
        </main>
      </div>

      {showSidebar && (
        <div className="ml-20 lg:ml-64 border-t border-slate-800">
          <Footer />
        </div>
      )}
    </div>
  );
}

export default Root;
