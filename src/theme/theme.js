import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#fb8c00" }, // naranja
    background: { default: "#ffffff" },
    success: { main: "#4caf50" }, // verde para online
    error: { main: "#f44336" },   // rojo para offline
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600 },
    button: { textTransform: "none" },
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme;
