import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/login";
import SignUpPage from "./pages/signup";
import DashboardPage from "./pages/dashboard";
import IndexPage from "./pages/index";
import DocsPage from "./pages/docs";
import PrivateRoute from "./components/PrivateRoute";
import CompaniesPage from "./pages/companies";
import TripsPage from "./pages/trips";
import IntegrationsPage from "./pages/integrations";
import FinancePage from "./pages/finance";
import { SeatManagement } from "./components/Trips/SeatManagement";
import { AppLayout } from "./layouts/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/companies",
        element: <CompaniesPage />,
      },
      {
        path: "/trips",
        children: [
          {
            path: "",
            element: <TripsPage />,
          },
          {
            path: "seats/:tripId",
            element: <SeatManagement />,
          },
        ],
      },
      {
        path: "/integrations",
        element: <IntegrationsPage />,
      },
      {
        path: "/finance",
        element: <FinancePage />,
      },
      {
        path: "/docs",
        element: <DocsPage />,
      },
    ],
  },
]);
