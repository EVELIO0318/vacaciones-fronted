import axios from "axios";

const getToken = localStorage.getItem("token");

export async function GetFeriados() {
  try {
    const feriados = await axios.get(
      "http://localhost:3000/api/feriados/Allferiados",
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    return feriados;
  } catch (error) {
    console.error("Error al obtener los Feriados:", error);
    throw error;
  }
}

export async function CreateFeriado(datos) {
  try {
    const feriadocreated = await axios.post(
      "http://localhost:3000/api/feriados/guardarFeriado",
      datos,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );

    console.log(feriadocreated);
    return feriadocreated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function UpdateFeriado(data) {
  try {
    const feriadocreated = await axios.put(
      "http://localhost:3000/api/feriados/ActualizarFeriado",
      data,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );

    return feriadocreated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function DeleteFeriado(IDferiado) {
  try {
    const feriadoDeleted = await axios.delete(
      "http://localhost:3000/api/feriados/EliminarFeriado",
      {
        headers: {
          "x-token": getToken,
        },
        data: {IDferiado},
      }
    );

    return feriadoDeleted;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
