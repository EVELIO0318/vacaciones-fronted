import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  GetSolicitudesByEmpleado,
  DeleteSolicitud,
} from "../../services/VacacionesService";

export default function SolicitudesModal({
  open,
  onClose,
  empleado,
  onSnackbar,
  onEditSolicitud,
  onUpdateParent,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  // 🔹 Cargar solicitudes por empleado
  const load = async () => {
    if (!empleado) return;

    setLoading(true);
    setError("");
    try {
      const res = await GetSolicitudesByEmpleado(empleado.IDempleado);
      setData(res.data.solicitudes || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, empleado]);

  // 🔹 Eliminar solicitud
  const handleDelete = async (sol) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar solicitud?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-popup-zindex",
      },
      backdrop: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await DeleteSolicitud(sol.IDsolicitud);
      onSnackbar({
        open: true,
        severity: "success",
        message: "Solicitud eliminada correctamente.",
      });
      load(); // recargar tabla
      if (typeof onUpdateParent === "function") {
        onUpdateParent();
      }
    } catch (err) {
      console.error(err);
      onSnackbar({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Error al eliminar solicitud.",
      });
    }
  };

  // 🔹 Editar (placeholder)
  const handleEdit = (sol) => {
    if (onEditSolicitud) {
      onEditSolicitud(sol); // pasa la solicitud al padre
      onClose(); // cierra este modal
    }
  };

  // 🔹 Abrir PDF
  const handleOpenPDF = (sol) => {
    try {
      if (!sol.pdf_solicitud) {
        Swal.fire({
          title: "Sin documento",
          text: "Esta solicitud no tiene PDF adjunto.",
          icon: "info",
          didOpen: (popup) => {
            popup.style.zIndex = 2000;
          },
        });
        return;
      }

      const fileName = sol.pdf_solicitud;
      const baseUrl = `http://localhost:3000/uploads/${fileName}`; //cambiar al pasar al server por la IP
      console.log(baseUrl);

      window.open(baseUrl, "_blank");
    } catch (err) {
      console.error("Error abriendo PDF:", err);
      Swal.fire({
        title: "Error",
        text: "No se pudo abrir el archivo PDF.",
        icon: "error",
        didOpen: (popup) => {
          popup.style.zIndex = 2000;
        },
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {empleado ? `Solicitudes de ${empleado.Nombre}` : "Solicitudes"}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : data.length === 0 ? (
          <Typography align="center" sx={{ py: 2 }}>
            No hay solicitudes registradas para este empleado.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Días</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell>Formato</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={row.IDsolicitud}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      {format(new Date(row.fecha_inicio), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(row.fecha_fin), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>{row.dias_calculados}</TableCell>
                    <TableCell>
                      {format(new Date(row.fecha_creacion), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver PDF">
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => handleOpenPDF(row)}
                        >
                          <PictureAsPdfIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Editar">
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleEdit(row)}
                          >
                            <EditIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(row)}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
