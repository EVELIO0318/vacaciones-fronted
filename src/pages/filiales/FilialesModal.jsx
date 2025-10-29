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
} from "@mui/material";

export default function FilialModal({
  open,
  onClose,
  onSave,
  isEditing,
  initialData = {},
}) {
  const [form, setForm] = useState({ nombre_filial: "", tipo: "Filial" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      IDfilial: initialData.IDfilial,
      nombre_filial: initialData.nombre_filial ?? "",
      tipo: initialData.tipo ?? "Filial",
    });
    setSaving(false);
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    setSaving(true);
    await onSave(form, setSaving);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Editar Filial" : "Nueva Filial"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre de Filial"
            name="nombre_filial"
            value={form.nombre_filial}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            select
            fullWidth
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
          >
            <MenuItem value="Filial">Filial</MenuItem>
            <MenuItem value="Ventanilla">Ventanilla</MenuItem>
          </TextField>
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
