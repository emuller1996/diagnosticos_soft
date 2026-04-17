import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Grid, Paper, Typography, Box } from "@mui/material";

const ProjectForm = ({ onSubmit, onCancel, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialData || {},
  });

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const isEditing = !!initialData;

  return (
    <Paper elevation={3} sx={{ p: 3, mx: "auto", mt:3 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Nombre del Proyecto"
              {...register("name", { required: "El Nombre es obligatorio" })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Tipo"
              {...register("project_type", {
                required: "El tipo es obligatorio",
              })}
              error={!!errors.project_type}
              helperText={errors.project_type?.message}
            />
          </Grid>
          <Grid item size={{ xs: 12}}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              {...register("description", {
                required: "La descripción es obligatoria",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Comunidad"
              {...register("community", {
                required: "La comunidad es obligatoria",
              })}
              error={!!errors.community}
              helperText={errors.community?.message}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Ciudad"
              {...register("city", { required: "La ciudad es obligatoria" })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              loading={isSubmitting}
              type="submit"
              variant="contained"
              color="primary"
            >
              {isEditing ? "Actualizar Proyecto" : "Guardar Proyecto"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProjectForm;
