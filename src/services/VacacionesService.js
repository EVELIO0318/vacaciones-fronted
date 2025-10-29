import axios from "axios";
import jwtDecode from "jwt-decode";

const getToken = localStorage.getItem("token");
const IDjefe = jwtDecode(getToken);

export async function GetVacaciones() {
  try {
    const empleadosHolidays = await axios.get(
      "http://localhost:3000/api/vacaciones/EmployersByBoss",
      {
        params: { IDjefe: IDjefe.id },
        headers: {
          "x-token": getToken,
        },
      }
    );
    return empleadosHolidays;
  } catch (error) {
    console.error("Error al obtener los empleados:", error);
    throw error;
  }
}

export async function DeleteSolicitud(IDsolicitud) {
  try {
    const SolicitudDeleted = await axios.delete(
      "http://localhost:3000/api/solicitud/DeleteSolicitud",
      {
        headers: {
          "x-token": getToken,
        },
        data: { IDsolicitud },
      }
    );

    return SolicitudDeleted;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function GetSolicitudesByEmpleado(IDempleado) {
  try {
    const empleadosHolidays = await axios.get(
      "http://localhost:3000/api/solicitud/solicitudesByUser",
      {
        params: { IDempleado: IDempleado },
        headers: {
          "x-token": getToken,
        },
      }
    );
    return empleadosHolidays;
  } catch (error) {
    console.error("Error al obtener los empleados:", error);
    throw error;
  }
}

export async function SaveSolicitud(datos) {
  datos.append("jefe_id", IDjefe.id);

  try {
    const solicitudCreated = await axios.post(
      "http://localhost:3000/api/solicitud/saveSolicitud",
      datos,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );
    console.log(solicitudCreated);
    return solicitudCreated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function UpdateSolicitud(IDsolicitud, datos) {
  //   console.log(IDsolicitud);
  //   for (let [key, value] of datos.entries()) {
  //     console.log(key, value);
  //   }
  datos.append("IDsolicitud", IDsolicitud);

  try {
    const solicitudUpdated = await axios.put(
      "http://localhost:3000/api/solicitud/UpdateSolicitud",
      datos,
      {
        headers: {
          "x-token": getToken,
        },
      }
    );

    return solicitudUpdated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
