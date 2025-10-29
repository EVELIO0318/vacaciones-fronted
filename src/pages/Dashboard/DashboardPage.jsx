import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TodayIcon from '@mui/icons-material/Today';
import { CargarDiasEmpleado } from '../../services/DashboardService';

const COLORS = ['#f83400', '#00a31e'];

export const DashboardPage = ({ user }) => {

  const [diasTomados, setdiasTomados] = useState(null)
  const [diasPendientes, setdiasPendientes] = useState(null)


  useEffect(() => {
    async function getDays(){
      const days= await CargarDiasEmpleado(user.IDempleado)
      console.log(days.data.days)
      const totalDiasTomados=(days.data.days).reduce((total,item)=>total+item.dias_tomados,0);
      const totalDiasRestantes=(days.data.days).reduce((total,item)=>total+item.dias_restantes,0);
      setdiasTomados(totalDiasTomados);
      setdiasPendientes(totalDiasRestantes);

    }

    getDays();
  }, [user.IDempleado])
  
  

  const pieData = [
    { name: 'Días Tomados', value: diasTomados },
    { name: 'Días Disponibles', value: diasPendientes },
  ];

  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Centra horizontalmente todo
      }}
    >
      {/* Titulo centrado */}
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 4 }}>
        Bienvenido, {user?.username || 'Usuario'}, Resumen de tus vacaciones
      </Typography>

      {/* Cards centradas */}
      <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
        <Grid size={{xs:12,sm:6,md:6}}>
          <Card sx={{ bgcolor: '#f83400', color: '#fff', display: 'flex', alignItems: 'center', p: 2, boxShadow: 3 }}>
            <BeachAccessIcon sx={{ fontSize: 50, mr: 2 }} />
            <Box>
              <Typography variant="subtitle1">Días Tomados</Typography>
              <Typography variant="h4">{diasTomados}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{xs:12,sm:6,md:6}}>
          <Card sx={{ bgcolor: '#00a31e', color: '#fff', display: 'flex', alignItems: 'center', p: 2, boxShadow: 3 }}>
            <TodayIcon sx={{ fontSize: 50, mr: 2 }} />
            <Box>
              <Typography variant="subtitle1">Días Disponibles</Typography>
              <Typography variant="h4">{diasPendientes<=0? 'Sin Dias': diasPendientes}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico Pie centrado */}
      <Box sx={{ width: '100%', maxWidth: 500, height: 300, mb: 4 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </Box>

     
    </Box>
  );
};
