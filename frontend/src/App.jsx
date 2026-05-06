import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./components/Root";
import Home from "./components/Home";
import Register from "./components/Register";
import Signin from "./components/Signin";
import Portfolio from "./components/Portfolio";
import Stocks from "./components/Stocks";
import Transactions from "./components/Transactions";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

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
          path: "transactions",
          element: (
            <ProtectedRoute allowedRoles={["trader"]}>
              <Transactions />
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
              <Profile />
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