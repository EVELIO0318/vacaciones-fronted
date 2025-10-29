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
import { DataGrid } from "@mui/x-data-grid";

import PuestoModal from "./PuestosModal";
import {
  GetPuestos,
  CreatePuesto,
  UpdatePuesto,
  DeletePuesto,
} from "../../services/PuestosService";

export function PuestosPage() {
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

  // Cargar datos
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetPuestos();
        const dataRaw = res?.data?.Puestos ?? res?.Puestos ?? res;
        if (mounted) setRows(Array.isArray(dataRaw) ? dataRaw : []);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    setFilteredRows(
      rows.filter(
        (r) =>
          r.nombre?.toLowerCase().includes(lowerSearch) ||
          String(r.IDpuesto).includes(lowerSearch)
      )
    );
  }, [searchText, rows]);

  const openCreateModal = () => {
    setEditingData({});
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleEdit = (row) => {
    setEditingData(row);
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleDelete = async (row) => {
    const id = row.IDpuesto;
    if (!id) return;
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este puesto se desactivará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await DeletePuesto(id);
        setRows((prev) =>
          prev.map((r) => (r.IDpuesto === id ? { ...r, estado: 0 } : r))
        );
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "El puesto fue desactivado.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        setSnackbar({
          open: true,
          severity: "error",
          message: err,
        });
      }
    }
  };

  const handleActivate = () => {
    Swal.fire({
      icon: "warning",
      title: "Aviso",
      text: "Para reactivar este puesto, contactar a TIC.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleSave = async (payload, setSaving) => {
    try {
      if (!payload.nombre) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "El nombre del puesto es requerido.",
        });
        return;
      }
      if (isEditing && editingData.IDpuesto) {
        await UpdatePuesto({ IDpuesto: editingData.IDpuesto, ...payload });
        console.log(payload);
        setRows((prev) =>
          prev.map((r) =>
            r.IDpuesto === editingData.IDpuesto ? { ...r, ...payload,estado:r.estado } : r
          )
        );
        setSnackbar({
          open: true,
          severity: "success",
          message: "Puesto actualizado.",
        });
      } else {
        const res = await CreatePuesto({ ...payload });
        const created = res?.data?.newP;
        setRows((prev) => [...prev, created]);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Puesto creado.",
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
    { field: "IDpuesto", headerName: "ID", width: 80 },
    { field: "nombre", headerName: "Nombre del Puesto", flex: 1, width: 250 },
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
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <Tooltip title="Editar">
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleEdit(params.row)}
              sx={{
                minWidth: "36px",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                p: 0.5,
              }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Tooltip>
          {params.row.estado === 1 ? (
            <Tooltip title="Deshabilitar">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDelete(params.row)}
                sx={{
                  minWidth: "36px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  p: 0.5,
                }}
              >
                <BlockIcon fontSize="small" />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Habilitar">
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleActivate(params.row)}
                sx={{
                  minWidth: "36px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  p: 0.5,
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </Button>
            </Tooltip>
          )}
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
        <Typography variant="h4">Puestos</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Nuevo Puesto
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
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ height: "70vh", width: "100%" }}>
          <DataGrid
            // rows={rows}
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.IDpuesto}
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
              "& .MuiDataGrid-cell": { borderColor: "#e0e0e0", py: 1 },
              "& .MuiDataGrid-cellContent": { fontSize: "0.9rem" },
              "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel":
                {
                  fontSize: "0.85rem",
                },
            }}
          />
        </Box>
      )}

      <PuestoModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        isEditing={isEditing}
        initialData={editingData}
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
