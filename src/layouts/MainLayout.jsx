// src/components/layout/Layout.jsx
import React, { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";


export const Layout = ({ children, user }) => {
  const [open, setOpen] = useState(false);
  const drawerWidth = 240; //
  

  const toggleDrawer = () => setOpen(!open);

   const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Navbar onMenuClick={toggleDrawer}  onLogout={handleLogout} user={user}/>
      <Sidebar open={open} onClose={toggleDrawer} user={user} />

      <Box component="main" sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          transition: "margin 0.3s ease, width 0.3s ease",
          ml: { sm: open ? `${drawerWidth}px` : "64px" }, // 🔹 se mueve cuando el sidebar se abre/cierra
          width: {
            xs: "100%",
            sm: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - 64px)`,
          },
          px: 3,
        }}>
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            maxWidth: "1600px", // 🔹 puedes cambiar el máximo
            mx: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
