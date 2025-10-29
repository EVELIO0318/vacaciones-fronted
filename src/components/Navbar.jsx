import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { getNotificaciones, ReadNotifications } from "../services/DashboardService";

export const Navbar = ({ onMenuClick, onLogout,user }) => {
  const [openLogout, setOpenLogout] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  
  const isTHorAdmin = user?.rol === "TH" || user?.rol_sistema === "ADMIN";

  useEffect(() => {
    if (isTHorAdmin) {
      getNotificaciones()
        .then((data) => {
          // console.log(data);
          setNotifications(data.notifis);
        })
        .catch((err) => console.error("Error al cargar notificaciones:", err));
    }
  }, [isTHorAdmin]);

  const unreadCount = notifications.filter((n) => n.leido === 0).length;

  //limpiar notificaciones
    const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);

    // Solo marcar como leídas si hay no leídas
    if (unreadCount > 0) {

      ReadNotifications().
      then((res)=>{
        console.log(unreadCount)
        if(res.status==200){
          setNotifications((prev)=>
          prev.map((n)=>({...n,leido:1}))
          )
        }
      })
    }
  };

  
  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setOpenLogout(true);
  };

  const handleConfirmLogout = () => {
    setOpenLogout(false);
    onLogout(); // función pasada desde el padre
  };

  const handleCancelLogout = () => {
    setOpenLogout(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#fb8c00",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Menu + Título */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Sistema de Vacaciones Talento Humano
            </Typography>
          </Stack>

          {/* Sección de notificaciones + bienvenida + logout */}
          <Stack direction="row" spacing={2} alignItems="center">
            {
              isTHorAdmin &&(
                <>
                  <IconButton color="inherit" aria-label="notificaciones" onClick={handleOpenNotifications}>
                    <Badge badgeContent={unreadCount>0?unreadCount:null} color="error">
                      <NotificationsRoundedIcon />
                    </Badge>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseNotifications}
                    PaperProps={{
                      sx: { width: 300, maxHeight: 400,overflowY:"auto", overflowX:"auto",whiteSpace:"nowrap" },
                    }}
                  >
                    <Typography sx={{ px: 2, py: 1, fontWeight: 600 }}>
                      Notificaciones
                    </Typography>
                    <Divider />
                    {notifications.length === 0 ?  (
                      
                        <MenuItem disabled>
                          <ListItemText primary="Sin notificaciones" />
                        </MenuItem>
                    ) : (
                      notifications.map((n) => (
                      <MenuItem
                        key={n.IDnotificacion}
                        sx={{
                          backgroundColor:
                            n.leido === 0 ? "rgba(255,165,0,0.15)" : "inherit",
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "nowrap" }}
                              title={n.mensaje} // tooltip para mostrar el texto completo al pasar el mouse
                            >
                              {n.mensaje}
                            </Typography>
                          }
                          secondary={new Date(
                            n.creado_en
                          ).toLocaleString("es-HN")}
                        />
                      </MenuItem>
                    ))
                  )}
                </Menu>

                </>
              )
            }

            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogoutClick}
              sx={{ borderColor: "#000000ff", color: "#000000ff" }}
            >
              Cerrar Sesión
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Modal de confirmación de logout */}
      <Dialog open={openLogout} onClose={handleCancelLogout}>
        <DialogTitle>Confirmar Salida</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout}>Cancelar</Button>
          <Button onClick={handleConfirmLogout} color="error">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
