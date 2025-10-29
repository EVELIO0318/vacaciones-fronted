import axios from "axios";

const API_URL = "http://localhost:3000/api/notificaciones";
const getToken=localStorage.getItem("token");

export async function getNotificaciones(){
    try {
        const res= await axios.get(`${API_URL}/Allnotificaciones`,{
            headers:{
                "x-token": getToken,
            },
        });
        return res.data
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        throw error;
    }

}


export async function ReadNotifications() {
    try {
        // console.log(getToken)
        const result=await axios.put(`${API_URL}/ReadNotifications`,{},
            {
            headers:{
                "x-token": getToken,
            },
        });
        return result
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        throw error;
    }
}


export async function CargarDiasEmpleado(IDempleado){
    try{
        const vacaciones= await axios.get("http://localhost:3000/api/vacaciones/getDays",{
            params:{IDempleado:IDempleado},
            headers:{
                "x-token": getToken,
            }
        });
        
    return vacaciones;
        
    }catch(error){
        console.error("Error al obtener los dias del empleado:", error);
        throw error;
    }
}

