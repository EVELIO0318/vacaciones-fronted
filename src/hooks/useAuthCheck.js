// src/hooks/useAuthCheck.js
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteToken, isTokenExpired } from "../services/AuthService";

/**
 * Hook que valida el token en cada navegación.
 * Si el token es inválido o expirado, borra el token y redirige al login.
 * 
 * @param {object} user - Usuario actual
 * @param {function} setUser - Función para actualizar el estado de usuario
 */
export function useAuthCheck(user, setUser) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired()) {
      deleteToken();
      setUser(null);
      // Redirige al login, reemplazando la navegación actual
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate, setUser]);
}
