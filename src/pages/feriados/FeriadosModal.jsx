// FeriadoModal.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format,parse } from 'date-fns';
import { es } from 'date-fns/locale';

export default function FeriadoModal({
  open,
  onClose,
  onSave,
  isEditing,
  initialData = {},
  filiales = [],
  filialesLoading = false,
}) {
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [aplicaTodas, setAplicaTodas] = useState(true);
  const [selectedFiliales, setSelectedFiliales] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDescripcion(initialData.descripcion ?? '');
    setFechaInicio(parseDateString(initialData.fechaI ?? initialData.fechaInicio));
    setFechaFin(parseDateString(initialData.fechaF ?? initialData.fechaFin));
    setAplicaTodas(Boolean(initialData.aplicaTodas ?? true));

    const aplica = Boolean(initialData.aplicaTodas ?? true);
    setAplicaTodas(aplica);

     if (aplica) {
    // Si aplica a todas, limpiar selección
    setSelectedFiliales(new Set());
    } else {
      // Si no aplica a todas, restaurar las filiales asignadas
      const filialesIds = initialData.filiales_ids ?? initialData.filiales ?? [];
      const parsedIds = Array.isArray(filialesIds)
        ? filialesIds.map(Number)
        : String(filialesIds)
            .split(',')
            .map((id) => Number(id.trim()))
            .filter(Boolean);
      setSelectedFiliales(new Set(parsedIds));
    }

    // setSelectedFiliales(new Set(initialData.filiales_ids ?? []));
    setSaving(false);
  }, [open, initialData]);


  function parseDateString(str) {
  if (!str) return null;
  // Asegura formato correcto
  try {
    return parse(str, 'yyyy-MM-dd', new Date());
  } catch {
    return null;
  }
}

  const toggleFilial = (id) => {
    setSelectedFiliales((prev) => {
      const copy = new Set(prev);
      const nid = Number(id);
      if (copy.has(nid)) copy.delete(nid);
      else copy.add(nid);
      return copy;
    });
  };

  const handleSaveClick = async () => {
    const payload = {
      descripcion: descripcion.trim(),
      fechaI: fechaInicio ? format(fechaInicio, 'yyyy-MM-dd') : null,
      fechaF: fechaFin ? format(fechaFin, 'yyyy-MM-dd') : null,
      aplicaTodas,
      filiales: aplicaTodas ? [] : Array.from(selectedFiliales),
    };
    setSaving(true);
    await onSave(payload, setSaving);
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Feriado' : 'Nuevo Feriado'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            required
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Fecha Inicio"
                value={fechaInicio}
                onChange={(newVal) => setFechaInicio(newVal)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
              <DatePicker
                label="Fecha Fin"
                value={fechaFin}
                onChange={(newVal) => setFechaFin(newVal)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Stack>
          </LocalizationProvider>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={aplicaTodas} onChange={(e) => setAplicaTodas(e.target.checked)} />}
              label="Aplica a todas las filiales"
            />
          </FormGroup>
          {!aplicaTodas && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Seleccione filiales:
              </Typography>
              {filialesLoading ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={18} />
                  <Typography>Cargando filiales...</Typography>
                </Stack>
              ) : (
                <FormGroup>
                  {filiales.map((f) => {
                    const fid = f.id ?? f.ID ?? f.IDfilial ?? null;
                    const nombre = f.nombre ?? f.nombre_filial ?? f.Nombre ?? f.name ?? `Filial ${fid}`;
                    return (
                      <FormControlLabel
                        key={fid}
                        control={
                          <Checkbox
                            checked={selectedFiliales.has(Number(fid))}
                            onChange={() => toggleFilial(fid)}
                            disabled={aplicaTodas}
                          />
                        }
                        label={nombre}
                      />
                    );
                  })}
                </FormGroup>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSaveClick} disabled={saving} sx={{ ml: 1 }}>
          {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
