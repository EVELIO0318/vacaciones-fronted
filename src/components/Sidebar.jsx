// src/components/layout/Sidebar.jsx
import React, { useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import {
  Drawer as MuiDrawer,
  Box,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Toolbar,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";

import { Link } from "react-router-dom";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import InfoIcon from "@mui/icons-material/Info";
import EventAvailableTwoToneIcon from "@mui/icons-material/EventAvailableTwoTone";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? drawerWidth : 60,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  [`& .MuiDrawer-paper`]: {
    width: open ? drawerWidth : 60,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  },
}));

export const Sidebar = React.memo(({ open = true, onClose, user }) => {
  const [openAbout, setOpenAbout] = useState(false);

  const firstLetter = useMemo(
    () => (user?.username ? user.username.charAt(0).toUpperCase() : "U"),
    [user?.username]
  );

  const role = user?.rol;

  // Memoriza las listas de links
  const commonLinks = useMemo(
    () => [
      {
        text: "Mis Vacaciones",
        path: "/vacaciones/ver",
        icon: <BeachAccessIcon />,
      },
    ],
    []
  );

  const gerencialLinks = useMemo(
    () => [
      {
        text: "Solicitudes",
        path: "/vacaciones/solicitudes",
        icon: <CalendarMonthIcon />,
      },
    ],
    []
  );

  const thLinks = useMemo(() => {
    if (!role) return [];
    const links = [];
    if (["ADMIN", "TH"].includes(role)) {
      links.push({
        text: "Feriados",
        path: "/feriados/feriadosPage",
        icon: <CalendarMonthIcon />,
      });
      links.push({
        text: "Filiales",
        path: "/filiales/filialesPage",
        icon: <LocationCityIcon />,
      });
      links.push({
        text: "Puestos",
        path: "/puestos/puestosPage",
        icon: <WorkIcon />,
      });
      links.push({
        text: "Empleados",
        path: "/usuarios/usuariosPage",
        icon: <PeopleIcon />,
      });
      links.push({
        text: "Vacaciones",
        path: "/",
        icon: <EventAvailableTwoToneIcon />,
      });
    }
    return links;
  }, [role]);

  const links = useMemo(() => {
    let arr = [...commonLinks];
    if (["ADMIN", "GERENCIAL"].includes(role)) arr.push(...gerencialLinks);
    if (["ADMIN", "TH"].includes(role)) arr.push(...thLinks);
    return arr;
  }, [role, commonLinks, gerencialLinks, thLinks]);

  return (
    <>
      <Drawer
        variant="permanent"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
      >
        <Toolbar />
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "#2E7D32" }}>
              {firstLetter}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user?.username || "Usuario"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.rol || "Rol"}
              </Typography>
            </Box>
          </Box>
        </Link>
        <Divider />
        <List>
          {links.map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              onClick={onClose}
            >
              <Tooltip title={item.text}>
                <ListItemIcon sx={{ color: "#2E7D32" }}>
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: "auto", mb: 1 }}>
          <ListItemButton onClick={() => setOpenAbout(true)}>
            <ListItemIcon sx={{ color: "#2E7D32" }}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Acerca de" />
          </ListItemButton>
        </Box>
      </Drawer>

      <Dialog open={openAbout} onClose={() => setOpenAbout(false)}>
        <DialogTitle>Acerca del Sistema</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Sistema de Vacaciones
          </Typography>
          <Typography variant="body2">
            Desarrollado por <b>Evelio Escobar, Departamento TIC</b>.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            © {new Date().getFullYear()} - Todos los derechos reservados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAbout(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
