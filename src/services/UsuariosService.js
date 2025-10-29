import axios from "axios";

const getToken = localStorage.getItem("token");

export async function GetEmpleados() {
  try {
    const empleados = await axios.get(
      "http://localhost:3000/api/empleados/AllUser",
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    return empleados;
  } catch (error) {
    console.error("Error al obtener las Filiales:", error);
    throw error;
  }
}
export async function CreateEmpleado(params) {
  const datosEmpleado = {
    Identidad: params.identidad,
    Nombre: params.nombre,
    filial: params.filial_id,
    fechaI: params.fecha_ingreso,
    puesto: params.puesto_id,
    jefe_inmediato: params.jefe_inmediato,
    username: params.username,
    rol: params.rol_sistema,
  };
  try {
    const empleadoCreated = await axios.post(
      "http://localhost:3000/api/empleados/SaveUser",
      datosEmpleado,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    console.log(empleadoCreated);
    return empleadoCreated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function GetJefes() {
  try {
    const Jefes = await axios.get(
      "http://localhost:3000/api/empleados/GetBosses",
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    return Jefes;
  } catch (error) {
    console.error("Error al obtener los Jefes:", error);
    throw error;
  }
}
export async function UpdateEmpleado(params) {
  const datosParseados = {
    IDempleado: params.IDempleado,
    Identidad: params.identidad,
    Nombre: params.nombre,
    filial: params.filial_id,
    fechaI: params.fecha_ingreso,
    puesto: params.puesto_id,
    jefe_inmediato: params.jefe_inmediato,
    username: params.username,
    rol: params.rol_sistema,
  };
  try {
    const userUpdated = await axios.put(
      "http://localhost:3000/api/empleados/EditUser",
      datosParseados,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );

    return userUpdated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function DeleteEmpleado(IDempleado) {
  try {
    const userDeleted = await axios.put(
      "http://localhost:3000/api/empleados/DeleteUser",
      { IDempleado },
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    console.log(userDeleted);
    return userDeleted;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function ResetPasswordEmpleado(IDempleado, NewPass) {
  try {
    const passwordUpdated = await axios.put(
      "http://localhost:3000/api/empleados/EditPassword",
      { IDempleado, password: NewPass },
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    return passwordUpdated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
