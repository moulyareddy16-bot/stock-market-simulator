import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    { name: "Portfolio", path: "/portfolio", icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
    { name: "Market", path: "/stocks", icon: <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5" /> },
    { name: "History", path: "/transactions", icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { 
  name: "Leaderboard", 
  path: "/leaderboard",
  icon: (
    <path d="M8 21h8M12 17v4M7 4h10l-1 7a4 4 0 0 1-4 3 4 4 0 0 1-4-3L7 4z" />
  )
},
    { name: "Profile", path: "/profile", icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-20 lg:w-64 bg-[#020617] border-r border-slate-800 transition-all duration-300 z-40 overflow-y-auto">
      <div className="flex flex-col h-full py-6">
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                {item.icon}
              </svg>
              <span className="hidden lg:block font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-500/20 to-transparent border border-emerald-500/10 hidden lg:block">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Pro Tip</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Check out trending stocks to maximize your virtual gains!
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
