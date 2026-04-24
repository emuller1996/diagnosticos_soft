import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  RadioGroup,
  Radio,
  Grid,
  Divider,
  Paper,
} from '@mui/material';

const MODALIDADES = [
  { value: 'vivienda nueva', label: 'Vivienda Nueva' },
  { value: 'mejoramiento', label: 'Mejoramiento' },
];

const TIPOS_ACTIVIDAD = ['Servicios', 'Comercio', 'Artesanía', 'Turismo', 'Agropecuaria', 'Otro'];

const NIVELES_EDUCATIVOS = ['Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado', 'Ninguno'];

const TIPOS_TENENCIA = [
  'Certificado de tradición y libertad',
  'Acto administrativo de adjudicación',
  'Certificado de concejo comunitario',
  'Fallo o sentencia judicial',
  'Certificado de resguardo indígena',
  'Certificado de sana posesión',
  'Otro',
];

const CONDICIONES_AMBIENTALES = [
  'Predio localizado en zona rural',
  'Predio con acceso a fuente de agua',
  'Predio localizado en zona apta para el desarrollo de vivienda',
];

const CAUSAS_NO_CUMPLE = [
  'Zona de reserva natural',
  'Reserva obra pública',
  'Franja de vía',
  'Parques nacionales',
  'Alto riesgo no mitigable',
  'Ronda de cuerpo de agua',
  'Redes de alta tensión',
  'Riesgo de inundación',
  'Otro',
];

const buildInitialState = (initialData) => {
  const defaults = {
    metadata: {
      fechaDiligenciamiento: '',
      consecutivoHogar: '',
      fechaSuscripcion: '',
    },
    titular: {
      nombre: '',
      apellido: '',
      documento: '',
      celular: '',
      departamento: '',
      municipio: '',
      vereda: '',
      otro: '',
    },
    modalidad: { type: '' },
    actividadProductiva: { tiene: false, tipo: '', descripcion: '' },
    nivelEducativo: '',
    numeroPersonas: '',
    numeroHogares: '',
    numeroHabitaciones: '',
    numeroCuartos: '',
    tenenciaPredio: { tipo: '', otro: '' },
    condicionesAmbientales: CONDICIONES_AMBIENTALES.map((condicion) => ({
      condicion,
      cumple: true,
    })),
    causasNoCumple: { causas: [], otro: '' },
  };

  if (!initialData) return defaults;

  return {
    ...defaults,
    ...initialData,
    metadata: { ...defaults.metadata, ...(initialData.metadata || {}) },
    titular: { ...defaults.titular, ...(initialData.titular || {}) },
    modalidad: { ...defaults.modalidad, ...(initialData.modalidad || {}) },
    actividadProductiva: { ...defaults.actividadProductiva, ...(initialData.actividadProductiva || {}) },
    tenenciaPredio: { ...defaults.tenenciaPredio, ...(initialData.tenenciaPredio || {}) },
    condicionesAmbientales:
      Array.isArray(initialData.condicionesAmbientales) && initialData.condicionesAmbientales.length === CONDICIONES_AMBIENTALES.length
        ? initialData.condicionesAmbientales
        : defaults.condicionesAmbientales,
    causasNoCumple: { ...defaults.causasNoCumple, ...(initialData.causasNoCumple || {}) },
  };
};

const DiagnosticoForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => buildInitialState(initialData));

  const handleSectionChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleBaseChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCondicionChange = (index, cumple) => {
    setFormData((prev) => {
      const next = [...prev.condicionesAmbientales];
      next[index] = { ...next[index], cumple };
      return { ...prev, condicionesAmbientales: next };
    });
  };

  const toggleCausa = (causa) => {
    setFormData((prev) => {
      const current = prev.causasNoCumple.causas;
      const causas = current.includes(causa)
        ? current.filter((c) => c !== causa)
        : [...current, causa];
      return { ...prev, causasNoCumple: { ...prev.causasNoCumple, causas } };
    });
  };

  const hasIncumplimiento = formData.condicionesAmbientales.some((c) => c.cumple === false);

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
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Información del Documento</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Fecha de Diligenciamiento" type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.metadata.fechaDiligenciamiento}
                onChange={(e) => handleSectionChange('metadata', 'fechaDiligenciamiento', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Consecutivo Hogar"
                placeholder="GPV-20260323-0002"
                value={formData.metadata.consecutivoHogar}
                onChange={(e) => handleSectionChange('metadata', 'consecutivoHogar', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Fecha de Suscripción" type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.metadata.fechaSuscripcion}
                onChange={(e) => handleSectionChange('metadata', 'fechaSuscripcion', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">A. Datos del Titular del Hogar</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Nombre(s)"
                value={formData.titular.nombre}
                onChange={(e) => handleSectionChange('titular', 'nombre', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Apellido(s)"
                value={formData.titular.apellido}
                onChange={(e) => handleSectionChange('titular', 'apellido', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="No. Documento"
                value={formData.titular.documento}
                onChange={(e) => handleSectionChange('titular', 'documento', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Cel. Contacto"
                value={formData.titular.celular}
                onChange={(e) => handleSectionChange('titular', 'celular', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Departamento"
                value={formData.titular.departamento}
                onChange={(e) => handleSectionChange('titular', 'departamento', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Municipio"
                value={formData.titular.municipio}
                onChange={(e) => handleSectionChange('titular', 'municipio', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Vereda"
                value={formData.titular.vereda}
                onChange={(e) => handleSectionChange('titular', 'vereda', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Otro"
                value={formData.titular.otro}
                onChange={(e) => handleSectionChange('titular', 'otro', e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">Datos del Subsidio - Modalidad</Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            select fullWidth label="Modalidad"
            value={formData.modalidad.type}
            onChange={(e) => handleSectionChange('modalidad', 'type', e.target.value)}
            required
          >
            {MODALIDADES.map((m) => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">B. Condición del Hogar</Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.actividadProductiva.tiene}
                onChange={(e) => handleSectionChange('actividadProductiva', 'tiene', e.target.checked)}
              />
            }
            label="¿En la vivienda se desarrolla alguna actividad productiva?"
          />

          {formData.actividadProductiva.tiene && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Tipo de actividad"
                  value={formData.actividadProductiva.tipo}
                  onChange={(e) => handleSectionChange('actividadProductiva', 'tipo', e.target.value)}
                  required
                >
                  {TIPOS_ACTIVIDAD.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Describa (Otro)"
                  value={formData.actividadProductiva.descripcion}
                  onChange={(e) => handleSectionChange('actividadProductiva', 'descripcion', e.target.value)}
                  required={formData.actividadProductiva.tipo === 'Otro'}
                />
              </Grid>
            </Grid>
          )}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Nivel educativo del Jefe de Hogar"
                value={formData.nivelEducativo}
                onChange={(e) => handleBaseChange('nivelEducativo', e.target.value)}
                required
              >
                {NIVELES_EDUCATIVOS.map((n) => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth label="No. Personas en hogar" type="number"
                inputProps={{ min: 1 }}
                value={formData.numeroPersonas}
                onChange={(e) => handleBaseChange('numeroPersonas', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth label="No. Hogares en vivienda" type="number"
                inputProps={{ min: 1 }}
                value={formData.numeroHogares}
                onChange={(e) => handleBaseChange('numeroHogares', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                fullWidth label="Habitaciones para dormir" type="number"
                inputProps={{ min: 0 }}
                value={formData.numeroHabitaciones}
                onChange={(e) => handleBaseChange('numeroHabitaciones', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                fullWidth label="Cuartos usados" type="number"
                inputProps={{ min: 0 }}
                value={formData.numeroCuartos}
                onChange={(e) => handleBaseChange('numeroCuartos', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">C. Acreditación de la Tenencia del Predio</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={formData.tenenciaPredio.tipo === 'Otro' ? 6 : 12}>
              <TextField
                select fullWidth label="Tipo de acreditación"
                value={formData.tenenciaPredio.tipo}
                onChange={(e) => handleSectionChange('tenenciaPredio', 'tipo', e.target.value)}
                required
              >
                {TIPOS_TENENCIA.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {formData.tenenciaPredio.tipo === 'Otro' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Nombre y/o descripción (Otro)"
                  value={formData.tenenciaPredio.otro}
                  onChange={(e) => handleSectionChange('tenenciaPredio', 'otro', e.target.value)}
                  required
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">D. Condiciones Ambientales y Territoriales del Predio</Typography>
          <Divider sx={{ mb: 2 }} />

          <Paper variant="outlined" sx={{ p: 2 }}>
            {formData.condicionesAmbientales.map((cond, index) => (
              <Box key={cond.condicion} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: index < formData.condicionesAmbientales.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Typography variant="body2">{`${String.fromCharCode(97 + index)}) ${cond.condicion}`}</Typography>
                <RadioGroup
                  row
                  value={cond.cumple ? 'cumple' : 'no_cumple'}
                  onChange={(e) => handleCondicionChange(index, e.target.value === 'cumple')}
                >
                  <FormControlLabel value="cumple" control={<Radio size="small" />} label="Cumple" />
                  <FormControlLabel value="no_cumple" control={<Radio size="small" />} label="No cumple" />
                </RadioGroup>
              </Box>
            ))}
          </Paper>

          {hasIncumplimiento && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                Si el predio "NO CUMPLE", indicar la causa:
              </Typography>
              <FormGroup row>
                {CAUSAS_NO_CUMPLE.map((causa) => (
                  <FormControlLabel
                    key={causa}
                    sx={{ minWidth: '33%' }}
                    control={
                      <Checkbox
                        checked={formData.causasNoCumple.causas.includes(causa)}
                        onChange={() => toggleCausa(causa)}
                      />
                    }
                    label={causa}
                  />
                ))}
              </FormGroup>
              {formData.causasNoCumple.causas.includes('Otro') && (
                <TextField
                  fullWidth label='Descripción causa "Otro"'
                  sx={{ mt: 1 }}
                  value={formData.causasNoCumple.otro}
                  onChange={(e) => handleSectionChange('causasNoCumple', 'otro', e.target.value)}
                  required
                />
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
          <Button variant="contained" type="submit" color="primary">Guardar Diagnóstico</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DiagnosticoForm;
