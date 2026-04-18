import React, { useState } from "react";
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
    createDiagnostico,
    updateDiagnostico,
    inactivateDiagnostico,
  } = useDiagnosticos();

  const [isCreating, setIsCreating] = useState(false);
  const [editingDiagnostico, setEditingDiagnostico] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCreateDiagnostico = async (formData) => {
    try {
      await createDiagnostico(formData);
      showNotification("Diagnóstico creado exitosamente", "success");
      setIsCreating(false);
    } catch (error) {
      showNotification("Error al crear el diagnóstico", "error");
    }
  };

  const handleUpdateDiagnostico = async (formData) => {
    try {
      await updateDiagnostico(editingDiagnostico.id, formData);
      showNotification("Diagnóstico actualizado exitosamente", "success");
      setEditingDiagnostico(null);
    } catch (error) {
      showNotification("Error al actualizar el diagnóstico", "error");
    }
  };

  const handleEditDiagnostico = (diagnostico) => {
    setEditingDiagnostico(diagnostico);
    setIsCreating(false);
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

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          {!isCreating && !editingDiagnostico && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreating(true)}
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

      {isCreating || editingDiagnostico ? (
        <DiagnosticoForm
          initialData={editingDiagnostico}
          onSubmit={editingDiagnostico ? handleUpdateDiagnostico : handleCreateDiagnostico}
          onCancel={() => {
            setIsCreating(false);
            setEditingDiagnostico(null);
          }}
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