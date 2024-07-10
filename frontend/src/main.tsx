import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import { AuthLayout } from "./routes/auth/layout";
import { LoginPage } from "./routes/auth/page";
import { SignUpPage } from "./routes/auth/signup/page";
import { AnimalDetailsPage } from "./routes/dashboard/animals/[id]/page";
import { AnimalsPage } from "./routes/dashboard/animals/page";
import { EventsPage } from "./routes/dashboard/events/page";
import { DashboardLayout } from "./routes/dashboard/layout";
import { DashboardPage } from "./routes/dashboard/page";
import { SettingsPage } from "./routes/dashboard/settings/page";
import { UserDetailsPage } from "./routes/dashboard/users/[id]/page";
import { UsersPage } from "./routes/dashboard/users/page";
import { RootLayout } from "./routes/layout";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/", element: <LoginPage /> },
          { path: "/signup", element: <SignUpPage /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/animals", element: <AnimalsPage /> },
          { path: "/events", element: <EventsPage /> },
          { path: "/users", element: <UsersPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/animals/:id", element: <AnimalDetailsPage /> },
          { path: "/users/:id", element: <UserDetailsPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
