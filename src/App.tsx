import { useRoutes } from "react-router-dom";
import EmailEditor from "./components/EmailEditor";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import EmailDetails from "./pages/EmailDetails";
import UserManagement from "./pages/UserManagement";
import PropertyManagement from "./pages/PropertyManagement";
import ProtectedRoute from "./routes/ProtectedRoutes";
import { PROPERTY_MANAGER_ROLES, USER_MANAGER_ROLES } from "./app-constant";

// import ProtectedRoute from "./routes/ProtectedRoute";
import "antd/dist/reset.css";
function App() {
  const route = useRoutes([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/template",
      element: (
        <ProtectedRoute>
          <EmailEditor />
        </ProtectedRoute>
      ),
    },
    {
      path: "/email-details",
      element: (
        <ProtectedRoute>
          <EmailDetails />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user-management",
      element: (
        <ProtectedRoute allowedRoles={USER_MANAGER_ROLES}>
          <UserManagement />
        </ProtectedRoute>
      ),
    },
    {
      path: "/property-management",
      element: (
        <ProtectedRoute allowedRoles={PROPERTY_MANAGER_ROLES}>
          <PropertyManagement />
        </ProtectedRoute>
      ),
    },
    {
      path: "/app",
      element: <AppLayout />,
    },
  ]);

  return <>{route}</>;
}

export default App;