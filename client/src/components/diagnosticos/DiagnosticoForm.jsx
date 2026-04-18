import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const DiagnosticoForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      titular: { nombre: '', apellido: '', documento: '', celular: '' },
      modalidad: { type: '' },
      actividadProductiva: { tiene: false, tipo: '', descripcion: '' },
      nivelEducativo: '',
      numeroPersonas: '',
      numeroHogares: '',
      numeroHabitaciones: '',
      numeroCuartos: '',
      tenenciaPredio: { tipo: '', otro: '' },
      condicionesAmbientales: [{ condicion: '', cumple: false, causa: '' }],
    }
  );

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleBaseChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConditionChange = (index, field, value) => {
    const updatedConditions = [...formData.condicionesAmbientales];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };
    setFormData((prev) => ({ ...prev, condicionesAmbientales: updatedConditions }));
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      condicionesAmbientales: [...prev.condicionesAmbientales, { condicion: '', cumple: false, causa: '' }],
    }));
  };

  const removeCondition = (index) => {
    const updatedConditions = formData.condicionesAmbientales.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, condicionesAmbientales: updatedConditions }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Titular Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Datos del Titular</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Nombre"
                value={formData.titular.nombre}
                onChange={(e) => handleChange('titular', 'nombre', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Apellido"
                value={formData.titular.apellido}
                onChange={(e) => handleChange('titular', 'apellido', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Documento"
                value={formData.titular.documento}
                onChange={(e) => handleChange('titular', 'documento', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Celular"
                value={formData.titular.celular}
                onChange={(e) => handleChange('titular', 'celular', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </Grid>

        {/* General Info Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Información General</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Modalidad"
                value={formData.modalidad.type}
                onChange={(e) => handleChange('modalidad', 'type', e.target.value)}
                required
              >
                <MenuItem value="vivienda nueva">Vivienda Nueva</MenuItem>
                <MenuItem value="mejoramiento">Mejoramiento</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Nivel Educativo"
                value={formData.nivelEducativo}
                onChange={(e) => handleBaseChange('nivelEducativo', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth label="Nº Personas" type="number"
                value={formData.numeroPersonas}
                onChange={(e) => handleBaseChange('numeroPersonas', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth label="Nº Hogares" type="number"
                value={formData.numeroHogares}
                onChange={(e) => handleBaseChange('numeroHogares', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth label="Nº Habitaciones" type="number"
                value={formData.numeroHabitaciones}
                onChange={(e) => handleBaseChange('numeroHabitaciones', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth label="Nº Cuartos" type="number"
                value={formData.numeroCuartos}
                onChange={(e) => handleBaseChange('numeroCuartos', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Actividad Productiva Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Actividad Productiva</Typography>
          <Divider sx={{ mb: 2 }} />
          <FormControlLabel
            control={<Checkbox checked={formData.actividadProductiva.tiene} onChange={(e) => handleChange('actividadProductiva', 'tiene', e.target.checked)} />}
            label="¿Tiene actividad productiva?"
          />
          {formData.actividadProductiva.tiene && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Tipo"
                  value={formData.actividadProductiva.tipo}
                  onChange={(e) => handleChange('actividadProductiva', 'tipo', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Descripción"
                  value={formData.actividadProductiva.descripcion}
                  onChange={(e) => handleChange('actividadProductiva', 'descripcion', e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Tenencia Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Tenencia del Predio</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Tipo de Tenencia"
                value={formData.tenenciaPredio.tipo}
                onChange={(e) => handleChange('tenenciaPredio', 'tipo', e.target.value)}
                required
              >
                <MenuItem value="Propia">Propia</MenuItem>
                <MenuItem value="Arrendada">Arrendada</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </TextField>
            </Grid>
            {formData.tenenciaPredio.tipo === 'Otro' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Especifique"
                  value={formData.tenenciaPredio.otro}
                  onChange={(e) => handleChange('tenenciaPredio', 'otro', e.target.value)}
                  required
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Condiciones Ambientales Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Condiciones Ambientales</Typography>
          <Divider sx={{ mb: 2 }} />
          {formData.condicionesAmbientales.map((cond, index) => (
            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth label="Condición"
                  value={cond.condicion}
                  onChange={(e) => handleConditionChange(index, 'condicion', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={<Checkbox checked={cond.cumple} onChange={(e) => handleConditionChange(index, 'cumple', e.target.checked)} />}
                  label="Cumple"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth label="Causa/Observación"
                  value={cond.causa}
                  onChange={(e) => handleConditionChange(index, 'causa', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton onClick={() => removeCondition(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addCondition}>Agregar Condición</Button>
        </Grid>

        {/* Form Actions */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
          <Button variant="contained" type="submit" color="primary">Guardar Diagnóstico</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DiagnosticoForm;