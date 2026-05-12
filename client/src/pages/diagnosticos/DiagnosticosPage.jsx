import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import DiagnosticoForm from "../../components/diagnosticos/DiagnosticoForm";
import DiagnosticoList from "../../components/diagnosticos/DiagnosticoList";
import { useDiagnosticos } from "../../hooks/useDiagnosticos";

const DiagnosticosPage = () => {
  const {
    diagnosticos,
    loading,
    error,
    search,
    setSearch,
    updateDiagnostico,
    inactivateDiagnostico,
  } = useDiagnosticos();

  const navigate = useNavigate();
  const location = useLocation();

  const [editingDiagnostico, setEditingDiagnostico] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification((n) => ({ ...n, open: false }));
  };

  // Mostrar notificación que llegó vía location.state (ej. desde NuevoDiagnosticoPage)
  useEffect(() => {
    if (location.state?.notification) {
      const { message, severity } = location.state.notification;
      showNotification(message, severity);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleUpdateDiagnostico = async ({ data }) => {
    try {
      await updateDiagnostico(editingDiagnostico.id, data);
      showNotification("Diagnóstico actualizado exitosamente", "success");
      setEditingDiagnostico(null);
    } catch (error) {
      showNotification("Error al actualizar el diagnóstico", "error");
    }
  };

  const handleEditDiagnostico = (diagnostico) => {
    setEditingDiagnostico(diagnostico);
  };

  const handleInactivateDiagnostico = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas inactivar este diagnóstico?")) {
      try {
        await inactivateDiagnostico(id);
        showNotification("Diagnóstico inactivado correctamente", "success");
      } catch (error) {
        showNotification("Error al inactivar el diagnóstico", "error");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Typography variant="h5" sx={{ mb: 2 }} fontWeight="bold">
        Gestión de Diagnósticos
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        gap={2}
      >
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar diagnósticos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 250 }}
          />
          {!editingDiagnostico && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/dashboard/diagnosticos/nuevo")}
            >
              Nuevo Diagnóstico
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {editingDiagnostico ? (
        <DiagnosticoForm
          initialData={editingDiagnostico}
          onSubmit={handleUpdateDiagnostico}
          onCancel={() => setEditingDiagnostico(null)}
        />
      ) : (
        <DiagnosticoList
          diagnosticos={diagnosticos}
          loading={loading}
          onInactivate={handleInactivateDiagnostico}
          onEdit={handleEditDiagnostico}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DiagnosticosPage;
