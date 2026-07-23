import { useRoutes } from "react-router-dom";
import EmailEditor from "./components/EmailEditor";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoutes";
// import ProtectedRoute from "./routes/ProtectedRoute";
import "antd/dist/reset.css";
function App() {
  const route = useRoutes([
    {
      path: "/",
      element: <Login />,
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
      path: "/app",
      element: <AppLayout />,
    },
  ]);

  return <>{route}</>;
}

export default App;