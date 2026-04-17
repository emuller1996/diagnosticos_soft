import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Snackbar, 
  Alert,
  TextField
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProjectForm from '../../components/projects/ProjectForm';
import ProjectList from '../../components/projects/ProjectList';
import { useProjects } from '../../hooks/useProjects';

const ProjectsPage = () => {
  const { 
    projects, 
    loading, 
    error, 
    search, 
    setSearch, 
    createProject, 
    deleteProject 
  } = useProjects();
  
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleCreateProject = async (formData) => {
    try {
      await createProject(formData);
      showNotification('Proyecto creado exitosamente', 'success');
      setIsCreating(false);
    } catch (error) {
      showNotification('Error al crear el proyecto', 'error');
    }
  };

  const handleInactivateProject = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas inactivar este proyecto?')) {
      try {
        await deleteProject(id);
        showNotification('Proyecto inactivado correctamente', 'success');
      } catch (error) {
        showNotification('Error al inactivar el proyecto', 'error');
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
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        gap={2}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Gestión de Proyectos
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 250 }}
          />
          {!isCreating && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => setIsCreating(true)}
            >
              Nuevo Proyecto
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {isCreating ? (
        <ProjectForm 
          onSubmit={handleCreateProject} 
          onCancel={() => setIsCreating(false)} 
        />
      ) : (
        <ProjectList 
          projects={projects} 
          loading={loading}
          onInactivate={handleInactivateProject} 
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
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectsPage;