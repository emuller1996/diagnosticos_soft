import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import SignatureDialog from "../../../components/diagnosticos/SignatureDialog";
import { useNavigate } from "react-router-dom";
import { useCaracterizacionPesca } from "../../../hooks/useCaracterizacionPesca";
import { uploadService } from "../../../services/uploadService";

export default function FormCaraterizacionPescaPage() {
  const navigate = useNavigate();
  const { createCaracterizacion } = useCaracterizacionPesca();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [anexoFotos, setAnexoFotos] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombrePescador: "",
      documento: "",
      consejoComunitario: "",
      asociacion: "",
      comunidad: "",
      telefono: "",
      totalPersonas: 0,
      ninios: 0,
      jovenes: 0,
      adultos: 0,
      adultosMayores: 0,
      hombres: 0,
      mujeres: 0,
      pescadoBaseAlimentacion: "",
      anosExperiencia: "",
      tipoPesca: "",
      tipoEmbarcacion: "",
      // NUEVOS CAMPOS - SECCIÓN 4
      estadoEmbarcacion: "",
      tieneMotor: "",
      hpMotor: "",
      estadoMotor: "",
      // NUEVOS CAMPOS - SECCIÓN 5
      capturaPorDia: "",
      diasPescaSemana: "",
      // NUEVOS CAMPOS - SECCIÓN 6
      conservaPescado: "",
      tiempoAntesVender: "",
      perdidaPescado: "",
      // NUEVOS CAMPOS - SECCIÓN 7
      ventaPrincipal: "",
      medioTransporte: "",
      tiempoTransporte: "",
      problemasPrincipales: "",
      otroMedioTransporte: "",
      otroProblema: "",
      // NUEVOS CAMPOS - SECCIÓN 8
        necesidadesPrioritarias: [],
        firmaTitular: "",
        firmaProfesional: "",
      },
  });

  const totalPersonas = watch("totalPersonas");
  const ninios = watch("ninios");
  const jovenes = watch("jovenes");
  const adultos = watch("adultos");
  const adultosMayores = watch("adultosMayores");

  useEffect(() => {
    const total =
      (ninios || 0) + (jovenes || 0) + (adultos || 0) + (adultosMayores || 0);
    setValue("totalPersonas", total);
  }, [ninios, jovenes, adultos, adultosMayores, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const created = await createCaracterizacion(data);
      const id = created?.id;
      const uploadErrors = [];

      if (id && anexoFotos.length > 0) {
        for (let i = 0; i < anexoFotos.length; i++) {
          const { file, observaciones } = anexoFotos[i];
          if (file) {
            try {
              await uploadService.uploadPescaAnexoFoto(id, file, observaciones || '');
            } catch (e) {
              uploadErrors.push(`foto ${i + 1}: ${e?.response?.data?.message || e.message}`);
            }
          }
        }
      }

      if (uploadErrors.length > 0) {
        setSubmitError(`Ficha creada, pero hubo errores al subir algunas fotos: ${uploadErrors.join('; ')}`);
        setSubmitSuccess(true);
      } else {
        setSubmitSuccess(true);
      }

      setTimeout(() => {
        navigate("/dashboard/caracterizacion-pesca");
      }, 3000);
    } catch (err) {
      setSubmitError(err.message || "Ocurrió un error al guardar la ficha");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFoto = () => {
    setAnexoFotos([...anexoFotos, { file: null, observaciones: "" }]);
  };

  const removeFoto = (index) => {
    setAnexoFotos(anexoFotos.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, file) => {
    const updatedFotos = [...anexoFotos];
    updatedFotos[index].file = file;
    setAnexoFotos(updatedFotos);
  };

  const handleObsChange = (index, obs) => {
    const updatedFotos = [...anexoFotos];
    updatedFotos[index].observaciones = obs;
    setAnexoFotos(updatedFotos);
  };

  const [signatureDialog, setSignatureDialog] = useState({ open: false, target: null });

  const openSignatureDialog = (target) => {
    setSignatureDialog({ open: true, target });
  };

  const closeSignatureDialog = () => {
    setSignatureDialog({ open: false, target: null });
  };

  const handleSignatureSave = (base64Image) => {
    if (signatureDialog.target === "titular") {
      setValue("firmaTitular", base64Image);
    } else if (signatureDialog.target === "profesional") {
      setValue("firmaProfesional", base64Image);
    }
    closeSignatureDialog();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: "auto", mr: 2 }}>
          <ArrowBack />
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Formulario para Crear Ficha de Caracterización de Pesca
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ¡Ficha guardada exitosamente! Redirigiendo...
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2, color: "#2E7D32" }}
          >
            1. IDENTIFICACIÓN
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name="nombrePescador"
                control={control}
                rules={{ required: "Este campo es requerido" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre del pescador"
                    fullWidth
                    error={!!errors.nombrePescador}
                    helperText={errors.nombrePescador?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name="documento"
                control={control}
                rules={{ required: "Este campo es requerido" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Documento"
                    fullWidth
                    error={!!errors.documento}
                    helperText={errors.documento?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name="consejoComunitario"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Consejo Comunitario" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name="asociacion"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Asociación" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name="comunidad"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Comunidad / Vereda" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Teléfono (WhatsApp)"
                    fullWidth
                    placeholder="Ej: 3012345678"
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* SECCIÓN 2: COMPOSICIÓN DEL HOGAR */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            2. COMPOSICIÓN DEL HOGAR
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Cuántas personas dependen de usted?
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Total de personas"
                value={totalPersonas || 0}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">👥</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={6} md={3}>
              <Controller
                name="ninios"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Niños (0-12 años)"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <Controller
                name="jovenes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Jóvenes (13-17 años)"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <Controller
                name="adultos"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Adultos (18-59 años)"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <Controller
                name="adultosMayores"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Adultos mayores (60+)"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Controller
                name="hombres"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hombres"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="mujeres"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mujeres"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  ¿El pescado es base de alimentación en su hogar?
                </FormLabel>
                <Controller
                  name="pescadoBaseAlimentacion"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="si"
                        control={<Radio />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.pescadoBaseAlimentacion && (
                <Typography color="error" variant="caption">
                  {errors.pescadoBaseAlimentacion.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* SECCIÓN 3: ACTIVIDAD PESQUERA */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            3. ACTIVIDAD PESQUERA
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Años de experiencia:</FormLabel>
                <Controller
                  name="anosExperiencia"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="menos5"
                        control={<Radio />}
                        label="Menos de 5 años"
                      />
                      <FormControlLabel
                        value="5-10"
                        control={<Radio />}
                        label="5-10 años"
                      />
                      <FormControlLabel
                        value="mas10"
                        control={<Radio />}
                        label="Más de 10 años"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.anosExperiencia && (
                <Typography color="error" variant="caption" display="block">
                  {errors.anosExperiencia.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de pesca:</FormLabel>
                <Controller
                  name="tipoPesca"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="mar"
                        control={<Radio />}
                        label="Mar adentro"
                      />
                      <FormControlLabel
                        value="rio"
                        control={<Radio />}
                        label="Río/Estero"
                      />
                      <FormControlLabel
                        value="ambos"
                        control={<Radio />}
                        label="Ambos"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.tipoPesca && (
                <Typography color="error" variant="caption" display="block">
                  {errors.tipoPesca.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* SECCIÓN 4: EMBARCACIÓN Y EQUIPO */}
          {/* SECCIÓN 4: EMBARCACIÓN Y EQUIPO */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            4. EMBARCACIÓN Y EQUIPO
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Tipo de embarcación */}
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de embarcación:</FormLabel>
                <Controller
                  name="tipoEmbarcacion"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="canoa"
                        control={<Radio />}
                        label="Canoa"
                      />
                      <FormControlLabel
                        value="fibra"
                        control={<Radio />}
                        label="Fibra"
                      />
                      <FormControlLabel
                        value="madera"
                        control={<Radio />}
                        label="Madera"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.tipoEmbarcacion && (
                <Typography color="error" variant="caption" display="block">
                  {errors.tipoEmbarcacion.message}
                </Typography>
              )}
            </Grid>

            {/* Estado de la embarcación */}
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Estado:</FormLabel>
                <Controller
                  name="estadoEmbarcacion"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="bueno"
                        control={<Radio />}
                        label="Bueno"
                      />
                      <FormControlLabel
                        value="regular"
                        control={<Radio />}
                        label="Regular"
                      />
                      <FormControlLabel
                        value="malo"
                        control={<Radio />}
                        label="Malo"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.estadoEmbarcacion && (
                <Typography color="error" variant="caption" display="block">
                  {errors.estadoEmbarcacion.message}
                </Typography>
              )}
            </Grid>

            {/* ¿Tiene motor? */}
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">¿Tiene motor?</FormLabel>
                <Controller
                  name="tieneMotor"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="si"
                        control={<Radio />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.tieneMotor && (
                <Typography color="error" variant="caption" display="block">
                  {errors.tieneMotor.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* HP del motor - solo visible si tiene motor */}
            <Grid item xs={12} md={6}>
              <Controller
                name="hpMotor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="HP (Caballos de fuerza)"
                    type="number"
                    fullWidth
                    disabled={watch("tieneMotor") !== "si"}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            {/* Estado del motor - solo visible si tiene motor */}
            <Grid item xs={12} md={6}>
              <FormControl
                component="fieldset"
                disabled={watch("tieneMotor") !== "si"}
              >
                <FormLabel component="legend">Estado del motor:</FormLabel>
                <Controller
                  name="estadoMotor"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="bueno"
                        control={<Radio />}
                        label="Bueno"
                      />
                      <FormControlLabel
                        value="regular"
                        control={<Radio />}
                        label="Regular"
                      />
                      <FormControlLabel
                        value="malo"
                        control={<Radio />}
                        label="Malo"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          {/* SECCIÓN 5: PRODUCCIÓN (ESTIMADA) */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            5. PRODUCCIÓN (ESTIMADA)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Captura por día */}
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Captura por día:</FormLabel>
                <Controller
                  name="capturaPorDia"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="poco"
                        control={<Radio />}
                        label="Poco (<20 kg)"
                      />
                      <FormControlLabel
                        value="medio"
                        control={<Radio />}
                        label="Medio (20–50 kg)"
                      />
                      <FormControlLabel
                        value="alto"
                        control={<Radio />}
                        label="Alto (>50 kg)"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.capturaPorDia && (
                <Typography color="error" variant="caption" display="block">
                  {errors.capturaPorDia.message}
                </Typography>
              )}
            </Grid>

            {/* Días de pesca por semana */}
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Días de pesca por semana:
                </FormLabel>
                <Controller
                  name="diasPescaSemana"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="1-2"
                        control={<Radio />}
                        label="1–2"
                      />
                      <FormControlLabel
                        value="3-4"
                        control={<Radio />}
                        label="3–4"
                      />
                      <FormControlLabel
                        value="5+"
                        control={<Radio />}
                        label="5 o más"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.diasPescaSemana && (
                <Typography color="error" variant="caption" display="block">
                  {errors.diasPescaSemana.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* SECCIÓN 6: MANEJO DEL PESCADO */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            6. MANEJO DEL PESCADO
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* ¿Cómo conserva el pescado? */}
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  ¿Cómo conserva el pescado?
                </FormLabel>
                <Controller
                  name="conservaPescado"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="hielo"
                        control={<Radio />}
                        label="Hielo"
                      />
                      <FormControlLabel
                        value="sal"
                        control={<Radio />}
                        label="Sal"
                      />
                      <FormControlLabel
                        value="no-conserva"
                        control={<Radio />}
                        label="No conserva"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.conservaPescado && (
                <Typography color="error" variant="caption" display="block">
                  {errors.conservaPescado.message}
                </Typography>
              )}
            </Grid>

            {/* Antes de vender */}
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Antes de vender:</FormLabel>
                <Controller
                  name="tiempoAntesVender"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="mismo-dia"
                        control={<Radio />}
                        label="Mismo día"
                      />
                      <FormControlLabel
                        value="1-dia"
                        control={<Radio />}
                        label="1 día"
                      />
                      <FormControlLabel
                        value="mas-1-dia"
                        control={<Radio />}
                        label="Más de 1 día"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.tiempoAntesVender && (
                <Typography color="error" variant="caption" display="block">
                  {errors.tiempoAntesVender.message}
                </Typography>
              )}
            </Grid>

            {/* Pérdida de pescado */}
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Pérdida de pescado:</FormLabel>
                <Controller
                  name="perdidaPescado"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="mucha"
                        control={<Radio />}
                        label="Mucha"
                      />
                      <FormControlLabel
                        value="algo"
                        control={<Radio />}
                        label="Algo"
                      />
                      <FormControlLabel
                        value="muy-poca"
                        control={<Radio />}
                        label="Muy poca"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.perdidaPescado && (
                <Typography color="error" variant="caption" display="block">
                  {errors.perdidaPescado.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* SECCIÓN 7: COMERCIALIZACIÓN */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            7. COMERCIALIZACIÓN
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* ¿A quién le vende principalmente? */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  ¿A quién le vende principalmente?
                </FormLabel>
                <Controller
                  name="ventaPrincipal"
                  control={control}
                  rules={{ required: "Seleccione una opción" }}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="asociacion"
                        control={<Radio />}
                        label="Asociación"
                      />
                      <FormControlLabel
                        value="consejo-comunitario"
                        control={<Radio />}
                        label="Consejo comunitario"
                      />
                      <FormControlLabel
                        value="comunidad-local"
                        control={<Radio />}
                        label="Comunidad local"
                      />
                      <FormControlLabel
                        value="intermediario"
                        control={<Radio />}
                        label="Intermediario"
                      />
                      <FormControlLabel
                        value="buenaventura"
                        control={<Radio />}
                        label="Lleva a Buenaventura"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              {errors.ventaPrincipal && (
                <Typography color="error" variant="caption" display="block">
                  {errors.ventaPrincipal.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Si vende a Buenaventura - Campos condicionales */}
          {watch("ventaPrincipal") === "buenaventura" && (
            <>
              <Typography
                variant="subtitle1"
                sx={{ mt: 2, mb: 1, fontWeight: 500 }}
              >
                Información de venta a Buenaventura:
              </Typography>

              <Grid container spacing={3}>
                {/* Medio de transporte */}
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      Medio de transporte:
                    </FormLabel>
                    <Controller
                      name="medioTransporte"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field}>
                          <FormControlLabel
                            value="lancha"
                            control={<Radio />}
                            label="Lancha"
                          />
                          <FormControlLabel
                            value="bote-propio"
                            control={<Radio />}
                            label="Bote propio"
                          />
                          <FormControlLabel
                            value="transporte-contratado"
                            control={<Radio />}
                            label="Transporte contratado"
                          />
                          <FormControlLabel
                            value="otro"
                            control={<Radio />}
                            label="Otro"
                          />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Campo Otro - Medio de transporte */}
                {watch("medioTransporte") === "otro" && (
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="otroMedioTransporte"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Especifique otro medio de transporte"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Tiempo de transporte */}
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      Tiempo de transporte:
                    </FormLabel>
                    <Controller
                      name="tiempoTransporte"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field}>
                          <FormControlLabel
                            value="menos-2h"
                            control={<Radio />}
                            label="Menos de 2 horas"
                          />
                          <FormControlLabel
                            value="2-5h"
                            control={<Radio />}
                            label="2–5 horas"
                          />
                          <FormControlLabel
                            value="mas-5h"
                            control={<Radio />}
                            label="Más de 5 horas"
                          />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Problemas principales */}
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      Problemas principales:
                    </FormLabel>
                    <Controller
                      name="problemasPrincipales"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field}>
                          <FormControlLabel
                            value="bajo-precio"
                            control={<Radio />}
                            label="Bajo precio"
                          />
                          <FormControlLabel
                            value="transporte"
                            control={<Radio />}
                            label="Transporte"
                          />
                          <FormControlLabel
                            value="se-daña"
                            control={<Radio />}
                            label="Se daña el pescado"
                          />
                          <FormControlLabel
                            value="intermediarios"
                            control={<Radio />}
                            label="Intermediarios"
                          />
                          <FormControlLabel
                            value="otro"
                            control={<Radio />}
                            label="Otro"
                          />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Campo Otro - Problemas principales */}
                {watch("problemasPrincipales") === "otro" && (
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="otroProblema"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Especifique otro problema"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {/* SECCIÓN 8: NECESIDADES PRIORITARIAS */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            8. NECESIDADES PRIORITARIAS
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            (Marque máximo 3)
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {[
                    { value: "embarcacion", label: "Embarcación" },
                    { value: "motor", label: "Motor" },
                    { value: "equipos-pesca", label: "Equipos de pesca" },
                    { value: "sistema-frio", label: "Sistema de frío" },
                    { value: "transporte", label: "Transporte" },
                    { value: "capacitacion", label: "Capacitación" },
                    { value: "comercializacion", label: "Comercialización" },
                  ].map((item) => (
                    <FormControlLabel
                      key={item.value}
                      control={
                        <Controller
                          name="necesidadesPrioritarias"
                          control={control}
                          render={({ field }) => {
                            const isSelected =
                              field.value?.includes(item.value) || false;
                            const isDisabled =
                              !isSelected && (field.value?.length || 0) >= 3;

                            return (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([
                                      ...currentValue,
                                      item.value,
                                    ]);
                                  } else {
                                    field.onChange(
                                      currentValue.filter(
                                        (v) => v !== item.value,
                                      ),
                                    );
                                  }
                                }}
                                style={{ marginRight: 8 }}
                              />
                            );
                          }}
                        />
                      }
                      label={item.label}
                    />
                  ))}
                </Box>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" display="block">
                  Seleccionadas: {watch("necesidadesPrioritarias")?.length || 0}{" "}
                  de 3
                </Typography>
                {(watch("necesidadesPrioritarias")?.length || 0) === 3 && (
                  <Typography
                    color="success.main"
                    variant="caption"
                    display="block"
                  >
                    ✓ Límite alcanzado
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* SECCIÓN 9: ANEXOS FOTOGRÁFICOS */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}
          >
            9. ANEXOS FOTOGRÁFICOS
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Cargue las fotografías que sirvan como evidencia de la caracterización.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddPhotoIcon />}
              onClick={addFoto}
              size="small"
              color="success"
            >
              Agregar Foto
            </Button>
          </Box>

          <Grid container spacing={3}>
            {anexoFotos.map((foto, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper variant="outlined" sx={{ p: 2, position: 'relative', bgcolor: '#f9f9f9' }}>
                  <IconButton
                    onClick={() => removeFoto(index)}
                    sx={{ position: 'absolute', top: 5, right: 5, color: 'error.main' }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2">Foto {index + 1}</Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<AddPhotoIcon />}
                    >
                      {foto.file ? foto.file.name : "Seleccionar imagen"}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                      />
                    </Button>
                    <TextField
                      label="Observaciones"
                      fullWidth
                      size="small"
                      value={foto.observaciones}
                      onChange={(e) => handleObsChange(index, e.target.value)}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* FIRMAS */}
          <Box sx={{ mt: 6, p: 3, border: "1px solid #ddd", borderRadius: 2, bgcolor: "#fafafa" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#2E7D32" }}>
              FIRMAS
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Firma del Titular
                </Typography>
                <Box
                  sx={{
                    width: 300,
                    height: 150,
                    border: "2px dashed #ccc",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "white",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onClick={() => openSignatureDialog("titular")}
                >
                  {watch("firmaTitular") ? (
                    <img src={watch("firmaTitular")} alt="Firma Titular" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Haga clic para firmar
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => setValue("firmaTitular", "")}
                  disabled={!watch("firmaTitular")}
                >
                  Borrar Firma
                </Button>
              </Grid>

              <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Firma del Profesional
                </Typography>
                <Box
                  sx={{
                    width: 300,
                    height: 150,
                    border: "2px dashed #ccc",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "white",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onClick={() => openSignatureDialog("profesional")}
                >
                  {watch("firmaProfesional") ? (
                    <img src={watch("firmaProfesional")} alt="Firma Profesional" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Haga clic para firmar
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => setValue("firmaProfesional", "")}
                  disabled={!watch("firmaProfesional")}
                >
                  Borrar Firma
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* BOTONES DE ACCIÓN */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Guardar Ficha"
              )}
            </Button>
          </Box>
        </Paper>
      </form>
      <SignatureDialog
        open={signatureDialog.open}
        onClose={closeSignatureDialog}
        onSave={handleSignatureSave}
      />
    </Box>
  );
}
