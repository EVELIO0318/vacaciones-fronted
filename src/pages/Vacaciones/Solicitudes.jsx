import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Snackbar,
  Tooltip,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import {
  GetVacaciones,
  SaveSolicitud,
  UpdateSolicitud,
  DeleteSolicitud,
} from "../../services/VacacionesService";
import AsignacionesModal from "./AsignacionesModal";
import SolicitudesModal from "./SolicitudesModal";
import SolicitudFormModal from "./SolicitudFormModal";

export function Solicitudes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const [openAsignaciones, setOpenAsignaciones] = useState(false);
  const [openSolicitudes, setOpenSolicitudes] = useState(false);
  const [openFormSolicitud, setOpenFormSolicitud] = useState(false);

  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null); // para editar

  // carga inicial y función reutilizable para recargar después de guardar
  const loadVacaciones = async () => {
    setLoading(true);
    try {
      const res = await GetVacaciones();
      const data = res?.data || res?.Vacaciones || res || [];
      const indexed = Array.isArray(data)
        ? data.map((r, i) => ({ ...r, index: i + 1 }))
        : []; // seguridad
      setRows(indexed);
    } catch (err) {
      setError(err?.message || "Error al cargar vacaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacaciones();
  }, []);

  useEffect(() => {
    const lower = searchText.toLowerCase();
    setFilteredRows(
      rows.filter(
        (r) =>
          (r.Nombre && r.Nombre.toLowerCase().includes(lower)) ||
          (r.nombre_filial && r.nombre_filial.toLowerCase().includes(lower)) ||
          (r.nombre_puesto && r.nombre_puesto.toLowerCase().includes(lower)) ||
          String(r.IDempleado).includes(lower)
      )
    );
  }, [searchText, rows]);

  const handleVerAsignaciones = (row) => {
    setSelectedEmpleado(row);
    setOpenAsignaciones(true);
  };

  const handleVerSolicitudes = (row) => {
    setSelectedEmpleado(row);
    setOpenSolicitudes(true);
  };

  const handleNuevaSolicitud = () => {
    setSolicitudSeleccionada(null); // importante: limpiar para modo creación
    setOpenFormSolicitud(true);
  };

  // función que se pasa al modal (onSave) — manejamos creación y edición aquí
  const handleGuardarSolicitud = async (formData, setSaving) => {
    if (!solicitudSeleccionada && !formData.get("pdf_solicitud")) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Debe seleccionar un archivo PDF para la nueva solicitud.",
      });
      return; // salir de la función
    }
    try {
      if (solicitudSeleccionada) {
        // Modo edición
        await UpdateSolicitud(solicitudSeleccionada.IDsolicitud, formData);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Solicitud actualizada correctamente",
        });
      } else {
        // Modo creación
        await SaveSolicitud(formData);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Solicitud guardada correctamente",
        });
      }

      // cerrar modal y recargar lista (si quieres evitar recarga total, podrías insertar la nueva fila)
      setOpenFormSolicitud(false);
      setSolicitudSeleccionada(null);

      if (solicitudSeleccionada) {
        setOpenSolicitudes(true);
      }

      await loadVacaciones();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        severity: "error",
        message:
          error?.response?.data?.message || "Error al guardar la solicitud",
      });
    } finally {
      // siempre desactivar spinner
      if (typeof setSaving === "function") setSaving(false);
    }
  };

  // columnas (fix: valueFormatter recibe params, usamos params.value)
  const columns = [
    { field: "index", headerName: "#", width: 60 },
    { field: "Nombre", headerName: "Empleado", flex: 1, minWidth: 200 },
    {
      field: "nombre_filial",
      headerName: "Filial",
      flex: 1,
      minWidth: 180,
      renderCell: (p) => p.value || "Sin datos",
    },
    {
      field: "fecha_ingreso",
      headerName: "Ingreso",
      minWidth: 120,
      valueFormatter: (params) =>
        params ? format(parseISO(params), "dd/MM/yyyy", { locale: es }) : "",
    },
    {
      field: "nombre_puesto",
      headerName: "Puesto",
      flex: 1,
      minWidth: 180,
      renderCell: (p) => p.value || "Sin datos",
    },
    {
      field: "total_asignados",
      headerName: "Asignados",
      width: 120,
      valueFormatter: (params) => {
        // Si el valor es null, undefined o vacío, mostrar 0
        return params || params === 0 ? params : "Sin Asignar";
      },
    },
    {
      field: "total_tomados",
      headerName: "Tomados",
      width: 120,
      valueFormatter: (params) => {
        // Si el valor es null, undefined o vacío, mostrar 0
        return params || params === 0 ? params : "Sin Asignar";
      },
    },
    {
      field: "total_restantes",
      headerName: "Restantes",
      width: 120,
      valueFormatter: (params) => {
        // Si el valor es null, undefined o vacío, mostrar 0
        return params || params === 0 ? params : "Sin Asignar";
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{ height: "100%", alignItems: "center" }}
        >
          <Tooltip title="Ver asignaciones de vacaciones">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleVerAsignaciones(params.row)}
              sx={{ minWidth: 36, height: 36, borderRadius: "10px", p: 0.5 }}
            >
              <AssignmentIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Ver solicitudes">
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleVerSolicitudes(params.row)}
              sx={{ minWidth: 36, height: 36, borderRadius: "10px", p: 0.5 }}
            >
              <VisibilityIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h4">Gestión de Vacaciones</Typography>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Buscar empleado..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNuevaSolicitud}
          >
            Nueva Solicitud
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(r) => r.IDempleado}
            pageSizeOptions={[5, 10, 20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            sx={{
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#020202ff",
                color: "#000000ff",
                fontWeight: "bold",
                fontSize: "0.95rem",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#fafafa",
              },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#e3f2fd" },
              "& .MuiDataGrid-cellContent": { fontSize: "0.9rem" },
            }}
          />
        </Box>
      )}

      {/* MODALES */}
      <AsignacionesModal
        open={openAsignaciones}
        onClose={() => setOpenAsignaciones(false)}
        empleado={selectedEmpleado}
      />

      <SolicitudesModal
        open={openSolicitudes}
        onClose={() => setOpenSolicitudes(false)}
        empleado={selectedEmpleado}
        onSnackbar={setSnackbar}
        // Pasar función para editar desde dentro del modal (si quieres)
        onEditSolicitud={(sol) => {
          setSolicitudSeleccionada(sol);
          setOpenFormSolicitud(true);
          setOpenSolicitudes(false);
        }}
        onUpdateParent={loadVacaciones}
      />

      <SolicitudFormModal
        open={openFormSolicitud}
        onClose={() => {
          setOpenFormSolicitud(false);
          if (solicitudSeleccionada) {
            setOpenSolicitudes(true);
          }
          setSolicitudSeleccionada(null);
          setSelectedEmpleado(null);
        }}
        onSave={handleGuardarSolicitud}
        initialData={solicitudSeleccionada}
        empleados={rows}
        onSnackbar={setSnackbar}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
