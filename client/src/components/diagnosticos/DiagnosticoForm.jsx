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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { uploadService } from '../../services/uploadService';
import { resolveStaticUrl } from '../../services/apiClient';

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

const FUENTES_AGUA = [
  'Acueducto convencional',
  'Acueducto no convencional',
  'Aljibe',
  'Cuerpo superficial de agua',
  'Agua lluvia',
  'Vehículo cisterna',
  'Método alternativo',
  'Otro',
];

const TIPOS_AGUAS_RESIDUALES = [
  'Red de alcantarillado convencional',
  'Sistema séptico',
  'Pozo de absorción',
  'Otro',
  'Ninguno',
];

const TIPOS_ENERGIA = [
  'Conexión a red de energía eléctrica',
  'Fuente propia de energía',
  'Otro',
  'Ninguno',
];

const PREMISAS_DIBUJO = [
  'Linderos del predio',
  'Acceso principal del predio',
  'Zona de implantación',
  'Puntos cardinales (Norte)',
  'Vivienda existente (Mejoramiento)',
  'Acceso a la vivienda (Mejoramiento)',
  'Cotas generales predio',
  'Cotas generales vivienda',
  'Cotas zona de implantación',
];

const MIEMBRO_VACIO = {
  apellidos: '',
  nombres: '',
  documento: '',
  alteracionMovilidad: false,
  ciegoSordo: false,
  altNeurologica: false,
  condEscaleras: false,
  descDiscapacidad: '',
};

const MIEMBRO_DEFAULT = {
  apellidos: '',
  nombres: '',
  documento: '',
  alteracionMovilidad: false,
  ciegoSordo: false,
  altNeurologica: false,
  condEscaleras: false,
  descDiscapacidad: '',
};

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
    serviciosPublicos: {
      abastecimientoAgua: { cuenta: null, fuentes: [], fuenteOtroDescripcion: '' },
      aguasResiduales: { tipo: '', otroDescripcion: '' },
      energia: { tipo: '', otroDescripcion: '' },
    },
    levantamiento: {
      premisas: [],
      caracteristicas: { area: '', pendiente: '', observaciones: '' },
      croquisUrl: '',
    },
    miembros: [],
  };

  if (!initialData) return defaults;

  const incomingServicios = initialData.serviciosPublicos || {};
  const incomingLevantamiento = initialData.levantamiento || {};

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
    serviciosPublicos: {
      abastecimientoAgua: {
        ...defaults.serviciosPublicos.abastecimientoAgua,
        ...(incomingServicios.abastecimientoAgua || {}),
      },
      aguasResiduales: {
        ...defaults.serviciosPublicos.aguasResiduales,
        ...(incomingServicios.aguasResiduales || {}),
      },
      energia: {
        ...defaults.serviciosPublicos.energia,
        ...(incomingServicios.energia || {}), 
      },
    },
    levantamiento: {
      premisas: Array.isArray(incomingLevantamiento.premisas) ? incomingLevantamiento.premisas : [],
      caracteristicas: {
        ...defaults.levantamiento.caracteristicas,
        ...(incomingLevantamiento.caracteristicas || {}),
      },
      croquisUrl: incomingLevantamiento.croquisUrl || '',
    },
    miembros: Array.isArray(initialData.miembros)
      ? initialData.miembros.map((m) => ({ ...MIEMBRO_VACIO, ...m }))
      : [],
  };
};

const DiagnosticoForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => buildInitialState(initialData));
  const [croquisUploading, setCroquisUploading] = useState(false);
  const [croquisError, setCroquisError] = useState(null);

  const diagnosticoId = initialData?.id;

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

  const handleServicioChange = (subsection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      serviciosPublicos: {
        ...prev.serviciosPublicos,
        [subsection]: { ...prev.serviciosPublicos[subsection], [field]: value },
      },
    }));
  };

  const toggleFuenteAgua = (fuente) => {
    setFormData((prev) => {
      const current = prev.serviciosPublicos.abastecimientoAgua.fuentes;
      const fuentes = current.includes(fuente)
        ? current.filter((f) => f !== fuente)
        : [...current, fuente];
      return {
        ...prev,
        serviciosPublicos: {
          ...prev.serviciosPublicos,
          abastecimientoAgua: { ...prev.serviciosPublicos.abastecimientoAgua, fuentes },
        },
      };
    });
  };

  const togglePremisa = (premisa) => {
    setFormData((prev) => {
      const current = prev.levantamiento.premisas;
      const premisas = current.includes(premisa)
        ? current.filter((p) => p !== premisa)
        : [...current, premisa];
      return {
        ...prev,
        levantamiento: { ...prev.levantamiento, premisas },
      };
    });
  };

  const handleCaracteristicaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      levantamiento: {
        ...prev.levantamiento,
        caracteristicas: { ...prev.levantamiento.caracteristicas, [field]: value },
      },
    }));
  };

  const addMiembro = () => {
    setFormData((prev) => ({ ...prev, miembros: [...prev.miembros, { ...MIEMBRO_VACIO }] }));
  };

  const removeMiembro = (index) => {
    setFormData((prev) => ({ ...prev, miembros: prev.miembros.filter((_, i) => i !== index) }));
  };

  const handleMiembroChange = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.miembros];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, miembros: next };
    });
  };

  const handleCroquisUpload = async (file) => {
    if (!file || !diagnosticoId) return;
    setCroquisError(null);
    setCroquisUploading(true);
    try {
      const updated = await uploadService.uploadCroquis(diagnosticoId, file);
      setFormData((prev) => ({
        ...prev,
        levantamiento: {
          ...prev.levantamiento,
          croquisUrl: updated?.levantamiento?.croquisUrl || '',
        },
      }));
    } catch (err) {
      setCroquisError(err?.response?.data?.message || err.message || 'Error subiendo el croquis.');
    } finally {
      setCroquisUploading(false);
    }
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

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">F. Disponibilidad o Acceso a Servicios Públicos</Typography>
          <Divider sx={{ mb: 2 }} />

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Abastecimiento de Agua
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                ¿El predio cuenta con posibilidad de abastecimiento de agua?
              </Typography>
              <RadioGroup
                row
                value={
                  formData.serviciosPublicos.abastecimientoAgua.cuenta === true
                    ? 'si'
                    : formData.serviciosPublicos.abastecimientoAgua.cuenta === false
                    ? 'no'
                    : ''
                }
                onChange={(e) => handleServicioChange('abastecimientoAgua', 'cuenta', e.target.value === 'si')}
              >
                <FormControlLabel value="si" control={<Radio size="small" />} label="SI" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="NO" />
              </RadioGroup>
            </Box>

            <Typography variant="body2" fontWeight="bold" sx={{ mt: 1, mb: 0.5 }}>
              Fuente de agua para consumo humano y doméstico:
            </Typography>
            <FormGroup row>
              {FUENTES_AGUA.map((fuente) => (
                <FormControlLabel
                  key={fuente}
                  sx={{ minWidth: '25%' }}
                  control={
                    <Checkbox
                      checked={formData.serviciosPublicos.abastecimientoAgua.fuentes.includes(fuente)}
                      onChange={() => toggleFuenteAgua(fuente)}
                    />
                  }
                  label={fuente}
                />
              ))}
            </FormGroup>
            {formData.serviciosPublicos.abastecimientoAgua.fuentes.includes('Otro') && (
              <TextField
                fullWidth label="¿Cuál? (Otro)"
                sx={{ mt: 1 }}
                value={formData.serviciosPublicos.abastecimientoAgua.fuenteOtroDescripcion}
                onChange={(e) => handleServicioChange('abastecimientoAgua', 'fuenteOtroDescripcion', e.target.value)}
                required
              />
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Tratamiento de Aguas Residuales
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              ¿Con qué tipo de servicio sanitario cuenta el hogar?
            </Typography>
            <RadioGroup
              row
              value={formData.serviciosPublicos.aguasResiduales.tipo}
              onChange={(e) => handleServicioChange('aguasResiduales', 'tipo', e.target.value)}
            >
              {TIPOS_AGUAS_RESIDUALES.map((tipo) => (
                <FormControlLabel
                  key={tipo}
                  value={tipo}
                  control={<Radio size="small" />}
                  label={tipo}
                  sx={{ minWidth: '33%' }}
                />
              ))}
            </RadioGroup>
            {formData.serviciosPublicos.aguasResiduales.tipo === 'Otro' && (
              <TextField
                fullWidth label="¿Cuál? (Otro)"
                sx={{ mt: 1 }}
                value={formData.serviciosPublicos.aguasResiduales.otroDescripcion}
                onChange={(e) => handleServicioChange('aguasResiduales', 'otroDescripcion', e.target.value)}
                required
              />
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Disponibilidad o Acceso a Energía
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Para las actividades del hogar la energía que utiliza es:
            </Typography>
            <RadioGroup
              row
              value={formData.serviciosPublicos.energia.tipo}
              onChange={(e) => handleServicioChange('energia', 'tipo', e.target.value)}
            >
              {TIPOS_ENERGIA.map((tipo) => (
                <FormControlLabel
                  key={tipo}
                  value={tipo}
                  control={<Radio size="small" />}
                  label={tipo}
                  sx={{ minWidth: '33%' }}
                />
              ))}
            </RadioGroup>
            {formData.serviciosPublicos.energia.tipo === 'Otro' && (
              <TextField
                fullWidth label="¿Cuál? (Otro)"
                sx={{ mt: 1 }}
                value={formData.serviciosPublicos.energia.otroDescripcion}
                onChange={(e) => handleServicioChange('energia', 'otroDescripcion', e.target.value)}
                required
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">G. Levantamiento (Mano Alzada)</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Premisas de Dibujo
                </Typography>
                <FormGroup>
                  {PREMISAS_DIBUJO.map((premisa, i) => (
                    <FormControlLabel
                      key={premisa}
                      control={
                        <Checkbox
                          checked={formData.levantamiento.premisas.includes(premisa)}
                          onChange={() => togglePremisa(premisa)}
                        />
                      }
                      label={`${String.fromCharCode(97 + i)}) ${premisa}`}
                    />
                  ))}
                </FormGroup>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  Características del Predio
                </Typography>
                <TextField
                  fullWidth label="A) Área zona de intervención (m²)"
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  sx={{ mb: 2 }}
                  value={formData.levantamiento.caracteristicas.area}
                  onChange={(e) => handleCaracteristicaChange('area', e.target.value)}
                />
                <TextField
                  fullWidth label="B) Pendiente en zona de intervención (%)"
                  type="number"
                  inputProps={{ min: 0, max: 100, step: '0.01' }}
                  sx={{ mb: 2 }}
                  value={formData.levantamiento.caracteristicas.pendiente}
                  onChange={(e) => handleCaracteristicaChange('pendiente', e.target.value)}
                />
                <TextField
                  fullWidth label="Observaciones del levantamiento"
                  multiline minRows={4}
                  value={formData.levantamiento.caracteristicas.observaciones}
                  onChange={(e) => handleCaracteristicaChange('observaciones', e.target.value)}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Croquis / Levantamiento
                </Typography>

                {!diagnosticoId && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Guarda primero el diagnóstico para poder subir el croquis.
                  </Alert>
                )}

                {croquisError && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCroquisError(null)}>
                    {croquisError}
                  </Alert>
                )}

                {formData.levantamiento.croquisUrl ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src={resolveStaticUrl(formData.levantamiento.croquisUrl)}
                      alt="Croquis del levantamiento"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 400,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={croquisUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                      disabled={!diagnosticoId || croquisUploading}
                    >
                      {croquisUploading ? 'Subiendo...' : 'Reemplazar croquis'}
                      <input
                        type="file" hidden accept="image/*"
                        onChange={(e) => handleCroquisUpload(e.target.files?.[0])}
                      />
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 3 }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={croquisUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                      disabled={!diagnosticoId || croquisUploading}
                    >
                      {croquisUploading ? 'Subiendo...' : 'Subir croquis'}
                      <input
                        type="file" hidden accept="image/*"
                        onChange={(e) => handleCroquisUpload(e.target.files?.[0])}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      La imagen se convertirá a WebP en el servidor para optimizar el tamaño.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Composición del Hogar – Miembros
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addMiembro}>
              Agregar miembro
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Apellidos</strong></TableCell>
                  <TableCell><strong>Nombres</strong></TableCell>
                  <TableCell><strong>Documento</strong></TableCell>
                  <TableCell align="center"><strong>Alt. Movilidad</strong></TableCell>
                  <TableCell align="center"><strong>Ciego / Sordo</strong></TableCell>
                  <TableCell align="center"><strong>Alt. Neurológica</strong></TableCell>
                  <TableCell align="center"><strong>Cond. Escaleras</strong></TableCell>
                  <TableCell><strong>Desc. Discapacidad</strong></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.miembros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ color: 'text.secondary' }}>
                      Sin miembros registrados. Usa "Agregar miembro" para añadir uno.
                    </TableCell>
                  </TableRow>
                ) : (
                  formData.miembros.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          variant="standard" fullWidth
                          value={m.apellidos}
                          onChange={(e) => handleMiembroChange(idx, 'apellidos', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard" fullWidth
                          value={m.nombres}
                          onChange={(e) => handleMiembroChange(idx, 'nombres', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard" fullWidth
                          value={m.documento}
                          onChange={(e) => handleMiembroChange(idx, 'documento', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={m.alteracionMovilidad}
                          onChange={(e) => handleMiembroChange(idx, 'alteracionMovilidad', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={m.ciegoSordo}
                          onChange={(e) => handleMiembroChange(idx, 'ciegoSordo', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={m.altNeurologica}
                          onChange={(e) => handleMiembroChange(idx, 'altNeurologica', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={m.condEscaleras}
                          onChange={(e) => handleMiembroChange(idx, 'condEscaleras', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard" fullWidth
                          value={m.descDiscapacidad}
                          onChange={(e) => handleMiembroChange(idx, 'descDiscapacidad', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => removeMiembro(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
