import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auth pages should not have sidebar/navbar sometimes, 
  // but for now, we'll just toggle the sidebar based on role and path.
  const isAuthPage = ["/signin", "/register"].includes(location.pathname);
  const showSidebar = role === "trader" && !isAuthPage && location.pathname !== "/";

  useEffect(() => {
    const navEntry = window.performance.getEntriesByType("navigation")[0];
    if (navEntry?.type === "reload" && role === "trader" && location.pathname === "/") {
      navigate("/portfolio", { replace: true });
    }
  }, [navigate, role, location.pathname]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {showSidebar && <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />}
        
        <main className={`flex-1 flex flex-col transition-all duration-300 ${showSidebar ? (isSidebarCollapsed ? "ml-20" : "ml-20 lg:ml-64") : ""}`}>
          <div className={`flex-1 ${location.pathname.startsWith("/admin") ? "" : "p-6 lg:px-14 py-10 w-full"}`}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default Root;
