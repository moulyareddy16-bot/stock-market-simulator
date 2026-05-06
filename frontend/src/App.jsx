import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./components/Root";
import Home from "./components/Home";
import Register from "./components/Register";
import Signin from "./components/Signin";
import Portfolio from "./components/Portfolio";
import Stocks from "./components/Stocks";
import Transactions from "./components/Transactions";
import Profile from "./components/Profile";

function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        // 🏠 Home
        {
          index: true,
          element: <Home />,
        },

        // 🔐 Auth
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "signin",
          element: <Signin />,
        },

        // 📊 Dashboard Pages (no protection for now)
        {
          path: "dashboard",
          element: <Portfolio />,
        },
        {
          path: "stocks",
          element: <Stocks />,
        },
        {
          path: "transactions",
          element: <Transactions />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
      ],
    },
  ]);

  return <RouterProvider router={routerObj} />;
}

export default App;