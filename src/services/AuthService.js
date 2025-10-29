import jwt_decode from "jwt-decode";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

export async function loginUser(username,password) {
  const credentials={
    username,
    password
  }
  try {
    const response = await axios.post(`${API_URL}/empleados/login`, credentials);
    const { token } = response.data;

    if (token) {
      localStorage.setItem("token", token);
      const user= jwt_decode(token);
      return {token,user}
    } else {
      throw new Error("No se recibió token del servidor.");
    }
  } catch (error) {

    if (error.response) {
      const backensMsg = error.response?.data?.message;
      console.log(error)
      throw backensMsg || "Error en las credenciales.";
    }else if(error.request){
      throw "No se puede conectar con el servidor. Intente más tarde.";
    }else{
      throw "Ocurrió un error inesperado, contacte a TIC";
    }
  }
}


export function getToken() {
  return localStorage.getItem("token");
}


/**
 * Decodifica un token JWT y devuelve los datos del usuario
 * @param {string} token - Token JWT recibido del backend
 * @returns {object|null} - { id, name, role } o null si es inválido
 */
export function getUserFromToken(token) {
  try {
    const decoded = jwt_decode(token);
    
    return {
      IDempleado: decoded.id,
      username: decoded.username,
      rol: decoded.rol,
    };
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
}


export function isTokenExpired() {
  const token = getToken("token");
  if (!token) return true;
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    // console.log("Token exp:", decoded.exp, "Ahora:", currentTime);
    return decoded.exp < currentTime; // true si está expirado
  } catch (error) {
    console.error("Error al verificar expiración:", error);
    return true;
  }
}


export function deleteToken(){
  localStorage.removeItem("token");
}

 export function handleLogout ()  {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
