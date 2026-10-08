import { useRoutes } from "react-router-dom";
import EmailEditor from "./components/EmailEditor";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import EmailDetails from "./pages/EmailDetails";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./routes/ProtectedRoutes";
import { USER_MANAGER_ROLES } from "./app-constant";
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
      path: "/app",
      element: <AppLayout />,
    },
  ]);

  return <>{route}</>;
}

export default App;