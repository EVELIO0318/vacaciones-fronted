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
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
// import { GetAsignacionesByEmpleado } from "../../services/VacacionesService";
import { CargarDiasEmpleado } from "../../services/DashboardService";

export default function AsignacionesModal({ open, onClose, empleado }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!open || !empleado) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await CargarDiasEmpleado(empleado.IDempleado);
        
        setData(res.data.days || []);
      } catch (err) {
        setError("No se pudieron cargar las asignaciones.", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, empleado]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {empleado ? `Asignaciones de ${empleado.Nombre}` : "Asignaciones"}
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
            No hay asignaciones registradas para este empleado.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Periodo</TableCell>
                  <TableCell>Días Asignados</TableCell>
                  <TableCell>Días Tomados</TableCell>
                  <TableCell>Días Restantes</TableCell>
                  <TableCell>Fecha de Asignación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {row.periodo_inicio} - {row.periodo_fin}
                    </TableCell>
                    <TableCell>{row.dias_asignados}</TableCell>
                    <TableCell>{row.dias_tomados}</TableCell>
                    <TableCell>{row.dias_restantes}</TableCell>
                    <TableCell>
                      {format(new Date(row.fecha_asignacion), "dd/MM/yyyy", {
                        locale: es,
                      })}
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
