import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { loginUser } from "../../services/AuthService";

export default function Login({ setUser }) {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser(username, password);
      console.log(res)

      if (res?.token) {
        localStorage.setItem("token", res.token);
        setUser(res.user);
        window.location.href = "/"; // redirige al dashboard
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.log(err)
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper elevation={6} sx={{ p: 5, borderRadius: 3, width: "100%",maxWidth:400,mx:"auto" }}>
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src="/logo.png" // logo
            alt="Logo Cooperativa"
            style={{ width: "120px", marginBottom: "10px" }}
          />
        </Box>

        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
        >
          Sistema de Vacaciones
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuario"
            type="text"
            required
            margin="normal"
            value={username}
            onChange={(e) => setusername(e.target.value)}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" align="center" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 600,
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "#e07b00" },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
