import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Snackbar, Alert, Box, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DiagnosticoForm from '../../components/diagnosticos/DiagnosticoForm';
import { useDiagnosticos } from '../../hooks/useDiagnosticos';
import { uploadService } from '../../services/uploadService';

const LIST_PATH = '/dashboard/diagnosticos';

const NuevoDiagnosticoPage = () => {
  const navigate = useNavigate();
  const { createDiagnostico } = useDiagnosticos();
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = (message, severity) =>
    setNotification({ open: true, message, severity });

  const handleCloseNotification = () =>
    setNotification((n) => ({ ...n, open: false }));

  const handleSubmit = async ({ data, files }) => {
    try {
      const created = await createDiagnostico(data);
      const id = created?.id;
      const uploadErrors = [];
      if (id && files?.croquis) {
        try {
          await uploadService.uploadCroquis(id, files.croquis);
        } catch (e) {
          uploadErrors.push(`croquis: ${e?.response?.data?.message || e.message}`);
        }
      }
      if (id && files?.huella) {
        try {
          await uploadService.uploadHuella(id, files.huella);
        } catch (e) {
          uploadErrors.push(`huella: ${e?.response?.data?.message || e.message}`);
        }
      }
      if (id && Array.isArray(files?.anexoFotos) && files.anexoFotos.length) {
        for (let i = 0; i < files.anexoFotos.length; i++) {
          const { file, observaciones } = files.anexoFotos[i];
          try {
            await uploadService.uploadAnexoFoto(id, file, observaciones || '');
          } catch (e) {
            uploadErrors.push(`anexo foto ${i + 1}: ${e?.response?.data?.message || e.message}`);
          }
        }
      }
      if (uploadErrors.length) {
        navigate(LIST_PATH, {
          state: {
            notification: {
              message: `Diagnóstico creado pero hubo errores: ${uploadErrors.join('; ')}. Editalo para subir las imágenes faltantes.`,
              severity: 'warning',
            },
          },
        });
      } else {
        navigate(LIST_PATH, {
          state: {
            notification: {
              message: 'Diagnóstico creado exitosamente',
              severity: 'success',
            },
          },
        });
      }
    } catch (err) {
      showNotification('Error al crear el diagnóstico', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(LIST_PATH)}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Nuevo Diagnóstico
        </Typography>
      </Box>

      <DiagnosticoForm
        initialData={null}
        onSubmit={handleSubmit}
        onCancel={() => navigate(LIST_PATH)}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NuevoDiagnosticoPage;
