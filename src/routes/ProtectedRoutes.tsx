import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const parsedUser = JSON.parse(user);

  // ❌ Block anyone without a recognized staff role — SUPER_ADMIN sees
  // everything, ADMIN sees all properties (no create/source-edit), and
  // PROPERTY_OPERATOR is scoped to their own property (enforced by the
  // backend; the frontend also hides the buttons they can't use — see
  // CustomTemplateEditor.tsx).
  const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "PROPERTY_OPERATOR"];
  if (!ALLOWED_ROLES.includes(parsedUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;