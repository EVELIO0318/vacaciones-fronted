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
} from "@mui/material";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DataGrid } from "@mui/x-data-grid";

import FilialModal from "./FilialesModal";
import {
  GetFiliales,
  CreateFilial,
  UpdateFilial,
  DeleteFilial,
} from "../../services/FilialesService";

export function FilialesPage() {
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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetFiliales();
        const dataRaw = res?.data?.Filiales ?? res?.Filiales ?? res;
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
    const id = row.IDfilial;
    if (!id) return;
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta filial se desactivará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await DeleteFilial(id);
        setRows((prev) =>
          prev.map((r) => (r.IDfilial === id ? { ...r, estado: 0 } : r))
        );
        Swal.fire({
          icon: "success",
          title: "¡Exito!",
          text: "La filial fue desactivada.",
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
      title: "Aviso!",
      text: "Para reactivar esta Filial, Contactar a TIC.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleSave = async (payload, setSaving) => {
    try {
      if (!payload.nombre_filial) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "El Nombre de Filial es Requerido",
        });
        return;
      }
      if (isEditing && editingData.IDfilial) {
        await UpdateFilial({ IDfilial: editingData.IDfilial, ...payload });
        setRows((prev) =>
          prev.map((r) =>
            r.IDfilial === editingData.IDfilial ? { ...r, ...payload } : r
          )
        );
        setSnackbar({
          open: true,
          severity: "success",
          message: "Filial actualizada.",
        });
      } else {
        const res = await CreateFilial({ ...payload });
        console.log(res.data.filialSaved.filialGuardada);
        const created = res?.data.filialSaved.filialGuardada ?? res;
        setRows((prev) => [...prev, created]);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Filial creada.",
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
    { field: "IDfilial", headerName: "ID", width: 80 },
    { field: "nombre_filial", headerName: "Nombre", flex: 1, width: 250 },
    { field: "tipo", headerName: "Tipo", width: 150 },
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
        <Typography variant="h4">Filiales</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
        >
          Nueva Filial
        </Button>
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
            rows={rows}
            columns={columns}
            getRowId={(row) => row.IDfilial}
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            sx={{
              // width: "100%",
              // height: "100%",
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
                { fontSize: "0.85rem" },
            }}
          />
        </Box>
      )}

      <FilialModal
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
