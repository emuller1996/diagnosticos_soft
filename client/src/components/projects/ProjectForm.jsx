import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  Box 
} from '@mui/material';

const ProjectForm = ({ onSubmit, onCancel }) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm();

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Crear Nuevo Proyecto
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre del Proyecto"
              {...register('name', { required: 'El Nombre es obligatorio' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tipo"
              {...register('project_type', { required: 'El tipo es obligatorio' })}
              error={!!errors.project_type}
              helperText={errors.project_type?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              {...register('description', { required: 'La descripción es obligatoria' })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Comunidad"
              {...register('community', { required: 'La comunidad es obligatoria' })}
              error={!!errors.community}
              helperText={errors.community?.message}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Ciudad"
              {...register('city', { required: 'La ciudad es obligatoria' })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar Proyecto
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProjectForm;