import axios from "axios";

const getToken = localStorage.getItem("token");

export async function GetPuestos() {
  try {
    const puestos = await axios.get(
      "http://localhost:3000/api/puestos/Allpuestos",
      {
        headers: {
          "x-token": getToken,
        },
      }
    );

    return puestos;
  } catch (error) {
    console.error("Error al obtener las Filiales:", error);
    throw error;
  }
}
export async function CreatePuesto({ nombre }) {
  try {
    const puestoCreated = await axios.post(
      "http://localhost:3000/api/puestos/SaveP",
      { nombre },
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    console.log(puestoCreated);
    return puestoCreated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function UpdatePuesto(data) {
  try {
    const filialUpdated = await axios.put(
      "http://localhost:3000/api/puestos/UpdateP",
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
export async function DeletePuesto(IDpuesto) {
  try {
    const filialDisabled = await axios.post(
      "http://localhost:3000/api/puestos/DeleteP",
      { IDpuesto },
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
