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
} from "@mui/material";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import { format, parse } from "date-fns";

import FeriadoModal from "./FeriadosModal";
import {
  GetFeriados,
  CreateFeriado,
  UpdateFeriado,
  DeleteFeriado,
} from "../../services/FeriadosService";
import { GetFiliales } from "../../services/FilialesService";

export function FeriadosPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [filiales, setFiliales] = useState([]);
  const [filialesLoading, setFilialesLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // function parseDateString(str) {
  //   if (!str) return null;
  //   const [year, month, day] = str.split('-').map(Number);
  //   return new Date(year, month - 1, day); // mes 0-indexado
  // }
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetFeriados();
        const dataRaw = res?.data?.Feriados ?? res?.Feriados ?? res;
        const data = dataRaw.map((f) => ({
          ...f,
          aplicaTodas: Boolean(f.aplicaTodas),
          filiales_ids: f.filiales_ids
            ? f.filiales_ids.split(",").map((id) => Number(id))
            : [],

          // fechaInicio: f.fechaInicio ? new Date(f.fechaInicio).toISOString() : null,
          // fechaFin: f.fechaFin ? new Date(f.fechaFin).toISOString() : null,
        }));
        if (mounted) setRows(Array.isArray(data) ? data : []);
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

    if (filiales.length === 0) loadFiliales();
  };

  const handleDelete = async (row) => {
    const id = row.id ?? row.IDferiado ?? null;
    if (!id) return;
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este feriado se eliminará permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await DeleteFeriado(id);
        setRows((prev) => prev.filter((r) => (r.id ?? r.IDferiado) !== id));
        Swal.fire({
          icon: "success",
          title: "¡Exito!",
          text: "El feriado se eliminó correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Error eliminando feriado.",
        });
      }
    }
  };

  const loadFiliales = async () => {
    setFilialesLoading(true);
    try {
      const res = await GetFiliales();
      const data = res?.data?.Filiales ?? res;
      const list = Array.isArray(data)
        ? data
        : data?.filiales ?? data?.items ?? [];
      setFiliales(list);
    } catch (err) {
      console.error(err);
    } finally {
      setFilialesLoading(false);
    }
  };

  const handleSave = async (payload, setSaving) => {
    try {
      if (isEditing && editingData.IDferiado) {
        await UpdateFeriado({ IDferiado: editingData.IDferiado, ...payload });

        console.log(payload);
        const payloadFrontend = {
          descripcion: payload.descripcion,
          fechaInicio: payload.fechaI, // ← renombrado para el grid
          fechaFin: payload.fechaF, // ← renombrado para el grid
          aplicaTodas: payload.aplicaTodas,
          filiales_ids: payload.filiales,
        };
        console.log(payloadFrontend);
        setRows((prev) =>
          prev
            .map((r) =>
              r.IDferiado === editingData.IDferiado
                ? { ...r, ...payloadFrontend }
                : r
            )
            .sort((a, b) => a.IDferiado - b.IDferiado)
        );
        setSnackbar({
          open: true,
          severity: "success",
          message: "Feriado actualizado.",
        });
      } else {
        const res = await CreateFeriado(payload);
        const created = res?.data.Valores;
        const newRow = {
          ...created,
          id: created.IDferiado ?? created.id,
        };
        setRows((prev) => [...prev, newRow]);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Feriado creado.",
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
    { field: "IDferiado", headerName: "ID", width: 80 },
    { field: "descripcion", headerName: "Descripción", width: 300, flex: 1 },
    {
      field: "fechaInicio",
      headerName: "Inicio",
      width: 140,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "fechaFin",
      headerName: "Fin",
      width: 140,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "aplicaTodas",
      headerName: "Aplica a todas",
      width: 140,
      renderCell: (params) => (params.row.aplicaTodas ? "Sí" : "No"),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
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
          <Tooltip title="Eliminar">
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
              <DeleteIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const formatDate = (value) => {
    if (!value) return "";
    try {
      // Si viene en string tipo '2026-03-29'
      const date =
        typeof value === "string"
          ? parse(value, "yyyy-MM-dd", new Date())
          : value;
      return format(date, "dd/MM/yyyy");
    } catch {
      return value;
    }
  };

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
        <Typography variant="h4">Feriados</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
        >
          Nuevo Feriado
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
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          getRowId={(row) => row.IDferiado}
          pageSizeOptions={[5, 10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            width: "100%",
            height: "100%",
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
          localeText={{
            footerPaginationRowsPerPage: "Periodos por página",
            footerPaginationLabelDisplayedRows: ({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
          }}
        />
      )}

      <FeriadoModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        isEditing={isEditing}
        initialData={editingData}
        filiales={filiales}
        filialesLoading={filialesLoading}
      />

      {/* <Snackbar
       open={snackbar.open} 
       autoHideDuration={4500} 
       onClose={handleCloseSnackbar} 
       message={snackbar.message} 
       anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} /> */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // <-- CENTRADO EN LA PARTE SUPERIOR
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled" // <-- COLOR SOLIDO
          sx={{ width: "100%" }} // <-- PARA QUE se vea elegante
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
