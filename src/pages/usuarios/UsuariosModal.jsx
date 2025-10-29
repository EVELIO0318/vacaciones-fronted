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
import { parseISO, format } from "date-fns";

export default function EmpleadoModal({
  open,
  onClose,
  onSave,
  isEditing,
  initialData = {},
  filiales = {},
  puestos = {},
  jefes = {},
}) {
  const [form, setForm] = useState({
    identidad: "",
    nombre: "",
    filial_id: "",
    puesto_id: "",
    jefe_inmediato: "",
    fecha_ingreso: "",
    username: "",
    rol_sistema: "",
  });

  // const [filiales, setfiliales] = useState([]);
  // const [puestos, setpuestos] = useState([]);
  // const [jefes, setjefes] = useState([]);
  // const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      IDusuario: initialData.IDusuario,
      identidad: initialData.Identidad
        ? initialData.Identidad.replace(/^(\d{4})(\d{4})(\d{5})$/, "$1-$2-$3")
        : "",
      nombre: initialData.empleado ?? "",
      filial_id: initialData.IDfilial ?? "",
      puesto_id: initialData.IDpuesto ?? "",
      jefe_inmediato: initialData.IDjefe ?? "",
      fecha_ingreso: initialData.fecha_ingreso
        ? format(
            initialData.fecha_ingreso instanceof Date
              ? initialData.fecha_ingreso
              : parseISO(initialData.fecha_ingreso),
            "yyyy-MM-dd"
          )
        : "",
      username: initialData.username ?? "",
      rol_sistema: initialData.rol ?? "",
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
      <DialogTitle>
        {isEditing ? "Editar Empleado" : "Nuevo Empleado"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Identidad"
            name="identidad"
            value={form.identidad}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Filial"
            name="filial_id"
            value={form.filial_id}
            onChange={handleChange}
            select
            fullWidth
          >
            <MenuItem value="">Seleccionar...</MenuItem>
            {filiales.map((f) => (
              <MenuItem key={f.IDfilial} value={f.IDfilial}>
                {f.nombre_filial}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Puesto"
            name="puesto_id"
            value={form.puesto_id}
            onChange={handleChange}
            select
            fullWidth
          >
            <MenuItem value="">Seleccionar...</MenuItem>
            {puestos.map((p) => (
              <MenuItem key={p.IDpuesto} value={p.IDpuesto}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Jefe Inmediato"
            name="jefe_inmediato"
            value={form.jefe_inmediato}
            onChange={handleChange}
            select
            fullWidth
          >
            <MenuItem value="">Seleccionar...</MenuItem>
            {jefes.map((j) => (
              <MenuItem key={j.IDempleado} value={j.IDempleado}>
                {j.Nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha de Ingreso"
            name="fecha_ingreso"
            type="date"
            value={form.fecha_ingreso}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Rol del Sistema"
            name="rol_sistema"
            value={form.rol_sistema}
            onChange={handleChange}
            select
            fullWidth
            required
          >
            <MenuItem value="">Seleccionar...</MenuItem>
            <MenuItem value="GERENCIAL">GERENCIAL</MenuItem>
            <MenuItem value="TH">TH</MenuItem>
            <MenuItem value="NORMAL">NORMAL</MenuItem>
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
