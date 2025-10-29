// src/router/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../services/AuthService";
// import { deleteToken, isTokenExpired } from "../services/AuthService";

/**
 * Componente que protege rutas privadas
 * @param {object} user - Usuario logueado
 * @param {ReactNode} children - Componente a renderizar si está logueado
 */
export default function PrivateRoute({ user, children }) {
  const token = localStorage.getItem("token");
  // Si no hay usuario logueado, redirige al login
  if (!user || !token || isTokenExpired()){
    return <Navigate to="/login" replace />;
  } 

  // Si hay usuario, renderiza el componente
  return children;
}
