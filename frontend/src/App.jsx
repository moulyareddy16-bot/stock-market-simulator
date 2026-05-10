import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import Root from "./components/Root";
import Home from "./components/Home";
import Register from "./components/Register";
import Signin from "./components/Signin";
import Portfolio from "./components/Portfolio";
import Stocks from "./components/Stocks";
import Transactions from "./components/Transactions";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import StockDetails from "./components/StockDetails";
import AdminDashboard from "./components/AdminDashboard";
import AiSuggestions from "./components/AiSuggestions";
import Leaderboard from "./components/Leaderboard";
import AICommandCenter from "./components/ai/AICommandCenter";

function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        // Home
        { index: true, element: <Home /> },

        // Auth
        { path: "register", element: <Register /> },
        { path: "signin", element: <Signin /> },

        // 🟢 Trader Routes
        {
          path: "dashboard",
          element: (
            <ProtectedRoute allowedRoles={["trader"]}>
              <Navigate to="/portfolio" replace />
            </ProtectedRoute>
          ),
        },
        {
          path: "portfolio",
          element: (
            <ProtectedRoute allowedRoles={["trader"]}>
              <Portfolio />
            </ProtectedRoute>
          ),
        },
        {
          path: "stocks",
          element: (
            <ProtectedRoute allowedRoles={["trader", "stockmanager"]}>
              <Stocks />
            </ProtectedRoute>
          ),
        },
        {
          path: "/stocks/:stockSymbol",
          element: (
            <ProtectedRoute allowedRoles={["trader", "stockmanager"]}>
              <StockDetails />
            </ProtectedRoute>
          ),
        },
        {
          path: "transactions",
          element: (
            <ProtectedRoute allowedRoles={["trader"]}>
              <Transactions />
            </ProtectedRoute>
          ),
        },
        {
          path: "ai-suggestions",
          element: (
            <ProtectedRoute allowedRoles={["trader"]}>
              <AiSuggestions />
            </ProtectedRoute>
          ),
        },
        {
          path: "ai",
          element: (
            <ProtectedRoute allowedRoles={["trader"]}>
              <AICommandCenter />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute allowedRoles={["trader", "admin"]}>
              <Profile />
            </ProtectedRoute>
          ),
        },

        // 🔴 Admin Route
        {
          path: "admin",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "leaderboard",
          element: (
            <ProtectedRoute allowedRoles={["trader", "admin"]}>
              <Leaderboard />
            </ProtectedRoute>
          ),
        },

        // 🔵 Manager Route
        {
          path: "manager",
          element: (
            <ProtectedRoute allowedRoles={["stockmanager"]}>
              <Stocks />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={routerObj} />;
}

export default App;
