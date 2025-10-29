import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { useDropzone } from "react-dropzone";

export default function SolicitudModal({
  open,
  onClose,
  onSave,
  initialData = null,
  empleados = [],
  onSnackbar,
}) {
  const [form, setForm] = useState({
    usuario_id: "",
    filial_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    archivo: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const empleado = empleados.find(
        (emp) => emp.IDempleado === initialData.usuario_id
      );
      setForm({
        usuario_id: initialData.usuario_id,
        filial_id: empleado.Filial_id,
        fecha_inicio: initialData.fecha_inicio
          ? format(parseISO(initialData.fecha_inicio), "yyyy-MM-dd")
          : "",
        fecha_fin: initialData.fecha_fin
          ? format(parseISO(initialData.fecha_fin), "yyyy-MM-dd")
          : "",
        archivo: null, // siempre null hasta que se cargue un nuevo archivo
      });
    } else {
      setForm({
        usuario_id: "",
        filial_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        archivo: null,
      });
    }
    setSaving(false);
  }, [open, initialData]);

  // Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    onDrop: (files) => setForm((prev) => ({ ...prev, archivo: files[0] })),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Al seleccionar empleado, también actualizamos la filial
  const handleEmpleadoChange = (e) => {
    const empleado = empleados.find((emp) => emp.IDempleado === e.target.value);
    setForm((prev) => ({
      ...prev,
      usuario_id: empleado?.IDempleado || "",
      filial_id: empleado?.Filial_id || "",
    }));
  };

  const handleSaveClick = async () => {
    if (!form.usuario_id || !form.fecha_inicio || !form.fecha_fin) {
      onSnackbar({
        open: true,
        severity: "error",
        message: "Empleado, fecha inicio y fecha fin son requeridos.",
      });
      return;
    }

    setSaving(true);
    try {
      // Preparar FormData si hay archivo
      const payload = new FormData();
      payload.append("usuario_id", form.usuario_id);
      payload.append("filial_id", form.filial_id);
      payload.append("fecha_inicio", form.fecha_inicio);
      payload.append("fecha_fin", form.fecha_fin);
      if (form.archivo) payload.append("pdf_solicitud", form.archivo);

      await onSave(payload, setSaving); // la función onSave se encarga de la petición
    } catch (err) {
      onSnackbar({
        open: true,
        severity: "error",
        message: err.message || "Error al guardar solicitud",
      });
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Editar Solicitud" : "Nueva Solicitud"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Empleado"
            value={form.usuario_id}
            onChange={handleEmpleadoChange}
            fullWidth
            required
          >
            <MenuItem value="">Seleccionar...</MenuItem>
            {empleados.map((emp) => (
              <MenuItem key={emp.IDempleado} value={emp.IDempleado}>
                {emp.Nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Filial"
            value={
              empleados.find((emp) => emp.IDempleado === form.usuario_id)
                ?.nombre_filial || ""
            }
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Fecha inicio"
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Fecha fin"
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <Box
            {...getRootProps()}
            sx={{
              p: 2,
              border: "2px dashed #ccc",
              borderRadius: 2,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            {form.archivo
              ? form.archivo.name
              : "Arrastra o selecciona un archivo PDF"}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSaveClick} disabled={saving}>
          {saving ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
