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
  Chip,
  TextField,
} from "@mui/material";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyIcon from "@mui/icons-material/VpnKey";
import { DataGrid } from "@mui/x-data-grid";
import { parseISO } from "date-fns";

import EmpleadoModal from "./UsuariosModal";
import {
  GetEmpleados,
  CreateEmpleado,
  UpdateEmpleado,
  DeleteEmpleado,
  ResetPasswordEmpleado,
} from "../../services/UsuariosService";
import { GetFiliales } from "../../services/FilialesService";
import { GetPuestos } from "../../services/PuestosService";
import { GetJefes } from "../../services/UsuariosService";
import ChangePasswordModal from "./UsuariosModalPass";

export function UsuariosPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [filiales, setFiliales] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [jefes, setJefes] = useState([]);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);

  // Cargar empleados
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const dataFiliales = await GetFiliales();

        const dataPuestos = await GetPuestos();

        const dataJefes = await GetJefes();

        setPuestos(dataPuestos.data.Puestos);
        setFiliales(dataFiliales.data.Filiales);
        setJefes(dataJefes.data.bosses);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      }
    };
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetEmpleados();
        const dataRaw = res?.data?.usuarios ?? res?.usuarios ?? res;
        if (mounted) setRows(Array.isArray(dataRaw) ? dataRaw : []);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    load();
    return () => (mounted = false);
  }, []);

  // Búsqueda
  useEffect(() => {
    const lower = debouncedSearch.toLowerCase();
    setFilteredRows(
      rows.filter(
        (r) =>
          r.empleado?.toLowerCase().includes(lower) ||
          r.filial?.toLowerCase().includes(lower) ||
          r.puesto?.toLowerCase().includes(lower) ||
          String(r.IDempleado).includes(lower)
      )
    );
  }, [debouncedSearch, rows]);

  //buscador
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300); // 300ms de espera después de la última tecla

    return () => clearTimeout(handler); // limpiar el timeout si el usuario sigue escribiendo
  }, [searchText]);

  const openCreateModal = () => {
    setEditingData({});
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleEdit = (row) => {
    const empleadoConFecha = {
      ...row,
      fecha_ingreso: row.fecha_ingreso ? parseISO(row.fecha_ingreso) : null,
    };
    setEditingData(empleadoConFecha);
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleDelete = async (row) => {
    const id = row.IDempleado;
    if (!id) return;
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este empleado se desactivará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await DeleteEmpleado(id);
        setRows((prev) =>
          prev.map((r) => (r.IDempleado === id ? { ...r, estado: 0 } : r))
        );
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "El empleado fue desactivado.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        setSnackbar({
          open: true,
          severity: "error",
          message: err.message || "Error al desactivar empleado.",
        });
      }
    }
  };

  const handleActivate = () => {
    Swal.fire({
      icon: "warning",
      title: "Aviso",
      text: "Para reactivar este empleado, contactar a TH.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleSave = async (payload, setSaving) => {
    try {
      if (!payload.nombre || !payload.identidad) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Nombre e Identidad son requeridos.",
        });
        return;
      }

      if (isEditing && editingData.IDempleado) {
        await UpdateEmpleado({
          IDempleado: editingData.IDempleado,
          ...payload,
        });

        // Buscar nombres a partir de los IDs seleccionados
        const filial = filiales.find(
          (f) => f.IDfilial === parseInt(payload.filial_id)
        );
        const puesto = puestos.find(
          (p) => p.IDpuesto === parseInt(payload.puesto_id)
        );
        const jefe = jefes.find(
          (j) => j.IDempleado === parseInt(payload.jefe_inmediato)
        );

        const updatedRow = {
          ...editingData,
          Identidad: payload.identidad,
          empleado: payload.nombre,
          IDfilial: payload.filial_id,
          filial: filial ? filial.nombre_filial : "Sin datos",
          IDpuesto: payload.puesto_id,
          puesto: puesto ? puesto.nombre : "Sin datos",
          IDjefe: payload.jefe_inmediato,
          jefe_inmediato_nombre: jefe ? jefe.Nombre : "Sin asignar",
          fecha_ingreso: payload.fecha_ingreso,
          username: payload.username,
          rol: payload.rol_sistema,
          estado: editingData.estado,
        };

        setRows((prev) =>
          prev.map((r) =>
            r.IDempleado === editingData.IDempleado ? updatedRow : r
          )
        );
        setSnackbar({
          open: true,
          severity: "success",
          message: "Empleado actualizado.",
        });
      } else {
        const res = await CreateEmpleado({ ...payload });
        const created = res?.data?.usuariosaved;
        if (!created)
          throw new Error("No se recibió respuesta válida del backend");
        const newRow = {
          IDempleado: created.IDusuario,
          Identidad: created.Identidad,
          empleado: created.Nombre,
          IDfilial: created.filial,
          filial:
            filiales.find((f) => f.IDfilial === created.filial)
              ?.nombre_filial || "Sin datos",
          IDpuesto: created.puesto,
          puesto:
            puestos.find((p) => p.IDpuesto === created.puesto)?.nombre ||
            "Sin datos",
          IDjefe: created.jefe_inmediato,
          jefe_inmediato_nombre:
            jefes.find((j) => j.IDempleado === created.jefe_inmediato)
              ?.empleado || "Sin asignar",
          fecha_ingreso: created.fechaI,
          username: created.username,
          rol: created.rol,
          estado: 1,
        };
        setRows((prev) => [...prev, newRow]);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Empleado creado.",
        });
      }
      setOpenModal(false);
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: err.response?.data?.error || err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "IDempleado", headerName: "ID", width: 50 },
    { field: "empleado", headerName: "Empleado", flex: 1, width: 180 },
    {
      field: "filial",
      headerName: "Filial",
      flex: 1,
      width: 150,
      renderCell: (p) => p.value || "Sin datos",
    },
    {
      field: "puesto",
      headerName: "Puesto",
      flex: 1,
      width: 150,
      renderCell: (p) => p.value || "Sin datos",
    },
    {
      field: "jefe_inmediato_nombre",
      headerName: "Jefe Inmediato",
      flex: 1,
      width: 130,
      renderCell: (p) => p.value || "Sin asignar",
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 1 ? "Activo" : "Inactivo"}
          color={params.value === 1 ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 190,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <Tooltip title="Editar">
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleEdit(params.row)}
              sx={{ minWidth: 36, height: 36, borderRadius: "10px", p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Tooltip>
          {params.row.estado === 1 ? (
            <Tooltip title="Desactivar">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDelete(params.row)}
                sx={{ minWidth: 36, height: 36, borderRadius: "10px", p: 0.5 }}
              >
                <BlockIcon fontSize="small" />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Activar">
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleActivate(params.row)}
                sx={{ minWidth: 36, height: 36, borderRadius: "10px", p: 0.5 }}
              >
                <CheckCircleIcon fontSize="small" />
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Resetear contraseña">
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={() => {
                setSelectedUser(params.row);
                setOpenPasswordModal(true);
              }}
              sx={{ minWidth: 36, height: 36, borderRadius: "10px", p: 0.5 }}
            >
              <KeyIcon fontSize="small" />
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
        <Typography variant="h4">Empleados</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Nuevo Empleado
          </Button>

          <TextField
            label="Buscar..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 250 }}
          />
        </Box>
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
            pageSizeOptions={[5, 10, 20, 50, 100]}
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

      <EmpleadoModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        isEditing={isEditing}
        initialData={editingData}
        filiales={filiales}
        puestos={puestos}
        jefes={jefes}
      />

      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        onConfirm={async (newPassword, setSaving) => {
          await ResetPasswordEmpleado(selectedUser.IDempleado, newPassword);
          try {
            Swal.fire({
              icon: "success",
              title: "Contraseña actualizada",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Error al cambiar contraseña",
              text: err.message || "No se pudo completar la acción.",
            });
          } finally {
            setSaving(false);
          }
        }}
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
