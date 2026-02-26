import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Only logged-in admins can access
export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div style={centeredStyle}>Loading…</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}

// Redirect to /admin if already logged in
export function PublicRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div style={centeredStyle}>Loading…</div>;
  if (user && isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

const centeredStyle = {
  display: "flex", alignItems: "center", justifyContent: "center",
  height: "100vh", fontSize: 16, color: "#64748b",
};
