import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CargarDiasEmpleado } from '../../services/DashboardService';
import autoTable from 'jspdf-autotable';

export function VerVacaciones({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const datos = await CargarDiasEmpleado(user.IDempleado);
        const data = datos.data.days;

        const formatted = (data || []).map((item) => ({
          ...item,
          IDvacaciones: item.IDvacaciones,
          periodo_inicio: item.periodo_inicio || '',
          periodo_fin: item.periodo_fin || '',
          dias_asignados: item.dias_asignados ?? '',
          dias_tomados: item.dias_tomados ?? '',
          dias_restantes: item.dias_restantes ?? '',
          fecha_asignacion: item.fecha_asignacion ? formatDate(item.fecha_asignacion) : '',
        }));

        if (mounted) setRows(formatted);
      } catch (err) {
        console.error(err);
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user.IDempleado]);

  const columns = [
    { field: 'IDvacaciones', headerName: 'ID', width: 90 },
    { field: 'periodo_inicio', headerName: 'Inicio', width: 140 },
    { field: 'periodo_fin', headerName: 'Fin', width: 140 },
    { field: 'dias_asignados', headerName: 'Asignados', width: 130, type: 'number' },
    { field: 'dias_tomados', headerName: 'Tomados', width: 130, type: 'number' },
    { field: 'dias_restantes', headerName: 'Restantes', width: 140, type: 'number' },
    { field: 'fecha_asignacion', headerName: 'Fecha Asignación', width: 180 },
  ];

  function formatDate(value) {
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return value;
    }
  }

  const handleExportPDF = async () => {
    
    try {
      const doc = new jsPDF('landscape', 'pt', 'a4');
      doc.setFontSize(14);
      doc.text(`Mis vacaciones usuario: ${user.username}`, 40, 40);

      const head = [['ID', 'Inicio', 'Fin', 'Asignados', 'Tomados', 'Restantes', 'Fecha Asignación']];
      const body = rows.map((r) => 
        [        
        r.IDvacaciones,
        r.periodo_inicio,
        r.periodo_fin,
        r.dias_asignados,
        r.dias_tomados,
        r.dias_restantes,
        r.fecha_asignacion,
      ]);

      autoTable(doc,{
        head,
        body,
        startY: 60,
        styles: { fontSize: 10 },
        headStyles: { fillColor: theme.palette.primary.main, textColor: 255 },
        theme: 'striped',
        margin: { left: 20, right: 20 },
      });

      // abrir directamente en otra pestaña
      doc.output('dataurlnewwindow');
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('No se pudo generar el PDF. Revisa la consola.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h3">Mis Vacaciones</Typography>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
          disabled={rows.length === 0 || loading}
          sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
        >
          Exportar PDF
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.IDvacaciones}
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            disableRowSelectionOnClick
            sx={{
              flex:1,
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#020202ff",
                color: "#020202ff",
                fontWeight: "bold",
                fontSize: "0.95rem",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#fafafa",
              },
                "& .MuiDataGrid-row:hover": {
                backgroundColor: "#e3f2fd",
              },
              "& .MuiDataGrid-cell": {
                borderColor: "#e0e0e0",
              },
              "& .MuiDataGrid-cellContent": {
                fontSize: "0.9rem",
              },
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
        </Box>
      )}
    </Box>
  );
}
