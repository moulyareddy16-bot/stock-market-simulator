import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AIChatPanel from "./ai/AIChatPanel";

function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = sessionStorage.getItem("role");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Auth pages should not have sidebar/navbar sometimes, 
  // but for now, we'll just toggle the sidebar based on role and path.
  const isAuthPage = ["/signin", "/register"].includes(location.pathname);
  const showSidebar = role === "trader" && !isAuthPage && location.pathname !== "/";

  // Don't show floating chat on auth pages, landing page, admin/manager routes, or the main AI page
  const showFloatingChat = role === "trader" && !isAuthPage && location.pathname !== "/" && location.pathname !== "/ai";

  useEffect(() => {
    const navEntry = window.performance.getEntriesByType("navigation")[0];
    if (navEntry?.type === "reload" && role === "trader" && location.pathname === "/") {
      navigate("/portfolio", { replace: true });
    }
  }, [navigate, role, location.pathname]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col relative">
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

      {/* GLOBAL FLOATING CHAT WIDGET */}
      {showFloatingChat && (
        <div className="fixed bottom-6 right-6 z-50">
          {!isChatOpen ? (
            <button
              onClick={() => setIsChatOpen(true)}
              className="relative group hover:scale-110 transition-all duration-300 flex items-center justify-center w-14 h-14"
            >
              <div 
                className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 text-black text-xs font-black flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                style={{ clipPath: "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)" }}
              >
                AI
              </div>
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-[#020617]"></span>
              </span>
            </button>
          ) : (
            <div className="shadow-2xl animate-fade-in-up origin-bottom-right transition-all">
              <AIChatPanel isFloating={true} onClose={() => setIsChatOpen(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Root;
