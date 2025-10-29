import axios from "axios";

const getToken = localStorage.getItem("token");

export async function GetFiliales() {
  try {
    const filiales = await axios.get(
      "http://localhost:3000/api/filiales/AllFiliales",
      {
        headers: {
          "x-token": getToken,
        },
      }
    );

    return filiales;
  } catch (error) {
    console.error("Error al obtener las Filiales:", error);
    throw error;
  }
}

export async function CreateFilial(datos) {
  try {
    const filialCreated = await axios.post(
      "http://localhost:3000/api/filiales/saveFilial",
      datos,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    return filialCreated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function UpdateFilial(data) {
  try {
    const filialUpdated = await axios.put(
      "http://localhost:3000/api/filiales/UpdateFilial",
      data,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    return filialUpdated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function DeleteFilial(IDfilial) {
  try {
    const filialDisabled = await axios.put(
      "http://localhost:3000/api/filiales/DeleteFilial",
      { IDfilial },
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    return filialDisabled;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
