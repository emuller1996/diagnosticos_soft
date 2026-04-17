import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import ProjectForm from "../../components/projects/ProjectForm";
import ProjectList from "../../components/projects/ProjectList";
import { useProjects } from "../../hooks/useProjects";

const ProjectsPage = () => {
  const {
    projects,
    loading,
    error,
    search,
    setSearch,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [projectToInactivate, setProjectToInactivate] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCreateProject = async (formData) => {
    try {
      await createProject(formData);
      showNotification("Proyecto creado exitosamente", "success");
      setIsCreating(false);
    } catch (error) {
      showNotification("Error al crear el proyecto", "error");
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      await updateProject(editingProject.id, formData);
      showNotification("Proyecto actualizado exitosamente", "success");
      setEditingProject(null);
    } catch (error) {
      showNotification("Error al actualizar el proyecto", "error");
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsCreating(false);
  };

  const handleInactivateProject = (id) => {
    setProjectToInactivate(id);
    setConfirmDialogOpen(true);
  };

  const confirmInactivate = async () => {
    setConfirmDialogOpen(false);
    try {
      await deleteProject(projectToInactivate);
      showNotification("Proyecto inactivado correctamente", "success");
    } catch (error) {
      showNotification("Error al inactivar el proyecto", "error");
    }
  };

  const cancelInactivate = () => {
    setConfirmDialogOpen(false);
    setProjectToInactivate(null);
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{mb:2}} fontWeight="bold">
        Gestión de Proyectos
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
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 250 }}
          />
      {!isCreating && !editingProject && (
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isCreating || editingProject ? (
        <ProjectForm
          initialData={editingProject}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={() => {
            setIsCreating(false);
            setEditingProject(null);
          }}
        />
      ) : (
        <ProjectList
          projects={projects}
          loading={loading}
          onInactivate={handleInactivateProject}
          onEdit={handleEditProject}
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

      <Dialog open={confirmDialogOpen} onClose={cancelInactivate}>
        <DialogTitle>Confirmar Inactivación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas inactivar este proyecto? Esta acción
            podría afectar la visibilidad del proyecto en la plataforma.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelInactivate} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmInactivate} color="error" variant="contained" autoFocus>
            Inactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectsPage;
