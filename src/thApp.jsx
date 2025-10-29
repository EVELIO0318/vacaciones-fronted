import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Navigate } from "react-router-dom";
import theme from "./theme/theme";
import { AppRouter } from "./router/AppRouter";

export const ThApp = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </BrowserRouter>
  );
};
