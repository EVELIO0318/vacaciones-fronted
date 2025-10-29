import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
} from "@mui/material";

export default function PuestoModal({
  open,
  onClose,
  onSave,
  isEditing,
  initialData = {},
}) {
  const [form, setForm] = useState({ nombre: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      IDpuesto: initialData.IDpuesto,
      nombre: initialData.nombre ?? "",
    });
    setSaving(false);
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    setSaving(true);
    await onSave({ ...form, estado: 1 }, setSaving);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Editar Puesto" : "Nuevo Puesto"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre del Puesto"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveClick}
          disabled={saving}
          sx={{ ml: 1 }}
        >
          {saving
            ? isEditing
              ? "Actualizando..."
              : "Guardando..."
            : isEditing
            ? "Actualizar"
            : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
