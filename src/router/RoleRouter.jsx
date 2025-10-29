// src/router/RoleRoute.jsx
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../services/AuthService";
// import { deleteToken, isTokenExpired } from "../services/AuthService";

/**
 * Componente que protege rutas según rol
 * @param {object} user - Usuario logueado
 * @param {string[]} roles - Roles permitidos (ej: ["ADMIN", "TH"])
 * @param {ReactNode} children - Componente a renderizar si el rol es permitido
 */
export default function RoleRoute({ user, roles, children }) {

  const token = localStorage.getItem("token");
  // Si no hay usuario logueado, redirige al login
  if (!user || !token || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.rol)) return <Navigate to="/" replace />;
  // Si el usuario tiene rol permitido, renderiza el componente
  return children;
}
