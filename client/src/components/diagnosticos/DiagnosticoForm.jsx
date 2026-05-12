import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Fingerprint as FingerprintIcon,
} from "@mui/icons-material";
import { uploadService } from "../../services/uploadService";
import { resolveStaticUrl } from "../../services/apiClient";
import SignatureDialog from "./SignatureDialog";

const MODALIDADES = [
  { value: "vivienda nueva", label: "Vivienda Nueva" },
  { value: "mejoramiento", label: "Mejoramiento" },
];

const TIPOS_ACTIVIDAD = [
  "Servicios",
  "Comercio",
  "Artesanía",
  "Turismo",
  "Agropecuaria",
  "Otro",
];

const NIVELES_EDUCATIVOS = [
  "Primaria",
  "Secundaria",
  "Técnico",
  "Universitario",
  "Postgrado",
  "Ninguno",
];

const TIPOS_TENENCIA = [
  "Certificado de tradición y libertad",
  "Acto administrativo de adjudicación",
  "Certificado de concejo comunitario",
  "Fallo o sentencia judicial",
  "Certificado de resguardo indígena",
  "Certificado de sana posesión",
  "Otro",
];

const CONDICIONES_AMBIENTALES = [
  "Predio localizado en zona rural",
  "Predio con acceso a fuente de agua",
  "Predio localizado en zona apta para el desarrollo de vivienda",
];

const CAUSAS_NO_CUMPLE = [
  "Zona de reserva natural",
  "Reserva obra pública",
  "Franja de vía",
  "Parques nacionales",
  "Alto riesgo no mitigable",
  "Ronda de cuerpo de agua",
  "Redes de alta tensión",
  "Riesgo de inundación",
  "Otro",
];

const FUENTES_AGUA = [
  "Acueducto convencional",
  "Acueducto no convencional",
  "Aljibe",
  "Cuerpo superficial de agua",
  "Agua lluvia",
  "Vehículo cisterna",
  "Método alternativo",
  "Otro",
];

const TIPOS_AGUAS_RESIDUALES = [
  "Red de alcantarillado convencional",
  "Sistema séptico",
  "Pozo de absorción",
  "Otro",
  "Ninguno",
];

const TIPOS_ENERGIA = [
  "Conexión a red de energía eléctrica",
  "Fuente propia de energía",
  "Otro",
  "Ninguno",
];

const PREMISAS_DIBUJO = [
  "Linderos del predio",
  "Acceso principal del predio",
  "Zona de implantación",
  "Puntos cardinales (Norte)",
  "Vivienda existente (Mejoramiento)",
  "Acceso a la vivienda (Mejoramiento)",
  "Cotas generales predio",
  "Cotas generales vivienda",
  "Cotas zona de implantación",
];

const MIEMBRO_VACIO = {
  apellidos: "",
  nombres: "",
  documento: "",
  alteracionMovilidad: false,
  ciegoSordo: false,
  altNeurologica: false,
  condEscaleras: false,
  descDiscapacidad: "",
};

const REQUISITOS_GENERALES = [
  "El hogar potencial beneficiario acredita a satisfacción la tenencia del predio",
  "La pendiente y condiciones topográficas de la zona de implantación permiten la construcción de la vivienda",
  "El predio está localizado en zona apta para el desarrollo de proyectos de vivienda",
  "El predio cuenta con disponibilidad o acceso a una fuente de agua para consumo humano y doméstico",
];

const CONDICIONES_VIVIENDA_NUEVA = [
  "La zona de implantación cumple con el área mínima requerida",
  "Requiere construcción de sistema de tratamiento de aguas residuales (sistema séptico)",
  "Se debe realizar conexión a red convencional de recolección y tratamiento de aguas residuales",
  "La zona de intervención cumple el área mínima para construcción del sistema séptico",
];

const buildInitialState = (initialData) => {
  const defaults = {
    metadata: {
      fechaDiligenciamiento: "",
      consecutivoHogar: "",
      fechaSuscripcion: "",
    },
    titular: {
      nombre: "",
      apellido: "",
      documento: "",
      celular: "",
      departamento: "",
      municipio: "",
      vereda: "",
      otro: "",
    },
    modalidad: { type: "" },
    actividadProductiva: { tiene: false, tipo: "", descripcion: "" },
    nivelEducativo: "",
    numeroPersonas: "",
    numeroHogares: "",
    numeroHabitaciones: "",
    numeroCuartos: "",
    tenenciaPredio: { tipo: "", otro: "" },
    condicionesAmbientales: CONDICIONES_AMBIENTALES.map((condicion) => ({
      condicion,
      cumple: true,
    })),
    causasNoCumple: { causas: [], otro: "" },
    serviciosPublicos: {
      abastecimientoAgua: {
        cuenta: null,
        fuentes: [],
        fuenteOtroDescripcion: "",
      },
      aguasResiduales: { tipo: "", otroDescripcion: "" },
      energia: { tipo: "", otroDescripcion: "" },
    },
    levantamiento: {
      premisas: [],
      caracteristicas: { area: "", pendiente: "", observaciones: "" },
      croquisUrl: "",
    },
    miembros: [],
    constanciaVisita: {
      fechaVisita: "",
      firmaTitular: "",
      huellaDigital: "",
      profesional: {
        nombre: "",
        documento: "",
        tarjetaProfesional: "",
        firma: "",
      },
      testigo: "",
    },
    conceptoTecnico: {
      requisitosGenerales: REQUISITOS_GENERALES.map((requisito) => ({
        requisito,
        cumple: null,
      })),
      viviendaNueva: {
        aplica: null,
        condiciones: CONDICIONES_VIVIENDA_NUEVA.map((condicion) => ({
          condicion,
          valor: null,
        })),
      },
    },
    anexoFotografico: { fotos: [] },
  };

  if (!initialData) return defaults;

  const incomingServicios = initialData.serviciosPublicos || {};
  const incomingLevantamiento = initialData.levantamiento || {};
  const incomingConcepto = initialData.conceptoTecnico || {};
  const incomingViviendaNueva = incomingConcepto.viviendaNueva || {};
  const incomingConstancia = initialData.constanciaVisita || {};

  return {
    ...defaults,
    ...initialData,
    metadata: { ...defaults.metadata, ...(initialData.metadata || {}) },
    titular: { ...defaults.titular, ...(initialData.titular || {}) },
    modalidad: { ...defaults.modalidad, ...(initialData.modalidad || {}) },
    actividadProductiva: {
      ...defaults.actividadProductiva,
      ...(initialData.actividadProductiva || {}),
    },
    tenenciaPredio: {
      ...defaults.tenenciaPredio,
      ...(initialData.tenenciaPredio || {}),
    },
    condicionesAmbientales:
      Array.isArray(initialData.condicionesAmbientales) &&
      initialData.condicionesAmbientales.length ===
        CONDICIONES_AMBIENTALES.length
        ? initialData.condicionesAmbientales
        : defaults.condicionesAmbientales,
    causasNoCumple: {
      ...defaults.causasNoCumple,
      ...(initialData.causasNoCumple || {}),
    },
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
      premisas: Array.isArray(incomingLevantamiento.premisas)
        ? incomingLevantamiento.premisas
        : [],
      caracteristicas: {
        ...defaults.levantamiento.caracteristicas,
        ...(incomingLevantamiento.caracteristicas || {}),
      },
      croquisUrl: incomingLevantamiento.croquisUrl || "",
    },
    miembros: Array.isArray(initialData.miembros)
      ? initialData.miembros.map((m) => ({ ...MIEMBRO_VACIO, ...m }))
      : [],
    constanciaVisita: {
      ...defaults.constanciaVisita,
      ...incomingConstancia,
      profesional: {
        ...defaults.constanciaVisita.profesional,
        ...(incomingConstancia.profesional || {}),
      },
    },
    conceptoTecnico: {
      requisitosGenerales:
        Array.isArray(incomingConcepto.requisitosGenerales) &&
        incomingConcepto.requisitosGenerales.length ===
          REQUISITOS_GENERALES.length
          ? incomingConcepto.requisitosGenerales
          : defaults.conceptoTecnico.requisitosGenerales,
      viviendaNueva: {
        aplica:
          typeof incomingViviendaNueva.aplica === "boolean"
            ? incomingViviendaNueva.aplica
            : null,
        condiciones:
          Array.isArray(incomingViviendaNueva.condiciones) &&
          incomingViviendaNueva.condiciones.length ===
            CONDICIONES_VIVIENDA_NUEVA.length
            ? incomingViviendaNueva.condiciones
            : defaults.conceptoTecnico.viviendaNueva.condiciones,
      },
    },
    anexoFotografico: {
      fotos: Array.isArray(initialData.anexoFotografico?.fotos)
        ? initialData.anexoFotografico.fotos.map((f) => ({
            url: f?.url || "",
            observaciones: f?.observaciones || "",
            sizeBytes: f?.sizeBytes,
          }))
        : [],
    },
  };
};

const requiredRule = { required: "Campo requerido" };

const huellaSrc = (value) => {
  if (!value) return "";
  return value.startsWith("data:") ? value : resolveStaticUrl(value);
};

const DiagnosticoForm = ({ initialData, onSubmit, onCancel }) => {
  const isEdit = !!initialData?.id;
  const diagnosticoId = initialData?.id;

  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: buildInitialState(initialData),
  });

  // Reset si el padre swappea initialData sin desmontar
  useEffect(() => {
    reset(buildInitialState(initialData));
  }, [initialData, reset]);

  const miembrosArray = useFieldArray({ control, name: "miembros" });
  const anexoFotosArray = useFieldArray({
    control,
    name: "anexoFotografico.fotos",
  });

  // Files locales (CREATE mode) — no entran al form state
  const [croquisFile, setCroquisFile] = useState(null);
  const [huellaFile, setHuellaFile] = useState(null);
  // Anexo fotográfico: en CREATE, fotos pendientes de subir. En EDIT no se usa (upload directo al endpoint).
  // Cada entrada: { file, observaciones, previewUrl }
  const [anexoLocalFiles, setAnexoLocalFiles] = useState([]);
  const [anexoUploading, setAnexoUploading] = useState(false);
  const [anexoError, setAnexoError] = useState(null);

  // Estado de uploads en EDIT (cuando una imagen está faltante y se sube ahí mismo)
  const [croquisUploading, setCroquisUploading] = useState(false);
  const [croquisError, setCroquisError] = useState(null);
  const [huellaUploading, setHuellaUploading] = useState(false);
  const [huellaError, setHuellaError] = useState(null);

  const [signatureDialog, setSignatureDialog] = useState({
    open: false,
    target: null,
  });

  // Watched values para conditional rendering
  const actividadTiene = watch("actividadProductiva.tiene");
  const actividadTipo = watch("actividadProductiva.tipo");
  const tenenciaTipo = watch("tenenciaPredio.tipo");
  const condicionesAmbientales = watch("condicionesAmbientales") || [];
  const causasSeleccionadas = watch("causasNoCumple.causas") || [];
  const aguaFuentes =
    watch("serviciosPublicos.abastecimientoAgua.fuentes") || [];
  const aguasResidualesTipo = watch("serviciosPublicos.aguasResiduales.tipo");
  const energiaTipo = watch("serviciosPublicos.energia.tipo");
  const croquisUrl = watch("levantamiento.croquisUrl");
  const titularNombre = watch("titular.nombre");
  const titularApellido = watch("titular.apellido");
  const titularDocumento = watch("titular.documento");
  const firmaTitular = watch("constanciaVisita.firmaTitular");
  const firmaProfesional = watch("constanciaVisita.profesional.firma");
  const huellaDigital = watch("constanciaVisita.huellaDigital");
  const consecutivoHogar = watch("metadata.consecutivoHogar");
  const viviendaNuevaAplica = watch("conceptoTecnico.viviendaNueva.aplica");

  const hasIncumplimiento = condicionesAmbientales.some(
    (c) => c.cumple === false,
  );

  // Previews de los files locales (CREATE)
  const croquisFilePreview = useMemo(
    () => (croquisFile ? URL.createObjectURL(croquisFile) : ""),
    [croquisFile],
  );
  useEffect(
    () => () => {
      if (croquisFilePreview) URL.revokeObjectURL(croquisFilePreview);
    },
    [croquisFilePreview],
  );

  const huellaFilePreview = useMemo(
    () => (huellaFile ? URL.createObjectURL(huellaFile) : ""),
    [huellaFile],
  );
  useEffect(
    () => () => {
      if (huellaFilePreview) URL.revokeObjectURL(huellaFilePreview);
    },
    [huellaFilePreview],
  );

  // Cleanup de blob URLs de las fotos locales del anexo al desmontar.
  useEffect(
    () => () => {
      anexoLocalFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    },
    // Solo al desmontar; las URLs intermedias se revocan en removeAnexoLocalFile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const showCroquisUpload = !isEdit || !croquisUrl;
  const showHuellaUpload = !isEdit || !huellaDigital;

  const handleCroquisFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (isEdit && diagnosticoId) {
      // EDIT con croquis faltante — sube directo al endpoint
      setCroquisError(null);
      setCroquisUploading(true);
      try {
        const updated = await uploadService.uploadCroquis(diagnosticoId, file);
        setValue(
          "levantamiento.croquisUrl",
          updated?.levantamiento?.croquisUrl || "",
          {
            shouldDirty: true,
          },
        );
      } catch (err) {
        setCroquisError(
          err?.response?.data?.message ||
            err.message ||
            "Error subiendo el croquis.",
        );
      } finally {
        setCroquisUploading(false);
      }
    } else {
      setCroquisFile(file);
    }
  };

  const handleHuellaFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (isEdit && diagnosticoId) {
      setHuellaError(null);
      setHuellaUploading(true);
      try {
        const updated = await uploadService.uploadHuella(diagnosticoId, file);
        setValue(
          "constanciaVisita.huellaDigital",
          updated?.constanciaVisita?.huellaDigital || "",
          {
            shouldDirty: true,
          },
        );
      } catch (err) {
        setHuellaError(
          err?.response?.data?.message ||
            err.message ||
            "Error subiendo la huella.",
        );
      } finally {
        setHuellaUploading(false);
      }
    } else {
      setHuellaFile(file);
    }
  };

  const handleAnexoFotoSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setAnexoError(null);
    if (isEdit && diagnosticoId) {
      setAnexoUploading(true);
      try {
        const updated = await uploadService.uploadAnexoFoto(
          diagnosticoId,
          file,
          "",
        );
        setValue(
          "anexoFotografico.fotos",
          updated?.anexoFotografico?.fotos || [],
          { shouldDirty: true },
        );
      } catch (err) {
        setAnexoError(
          err?.response?.data?.message ||
            err.message ||
            "Error subiendo la foto.",
        );
      } finally {
        setAnexoUploading(false);
      }
    } else {
      // CREATE: guardar local
      setAnexoLocalFiles((prev) => [
        ...prev,
        { file, observaciones: "", previewUrl: URL.createObjectURL(file) },
      ]);
    }
  };

  const removeAnexoLocalFile = (index) => {
    setAnexoLocalFiles((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const updateAnexoLocalObservaciones = (index, observaciones) => {
    setAnexoLocalFiles((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], observaciones };
      return next;
    });
  };

  const removeAnexoUploadedFoto = async (index) => {
    if (!diagnosticoId) return;
    setAnexoError(null);
    setAnexoUploading(true);
    try {
      const updated = await uploadService.deleteAnexoFoto(diagnosticoId, index);
      setValue(
        "anexoFotografico.fotos",
        updated?.anexoFotografico?.fotos || [],
        { shouldDirty: true },
      );
    } catch (err) {
      setAnexoError(
        err?.response?.data?.message ||
          err.message ||
          "Error borrando la foto.",
      );
    } finally {
      setAnexoUploading(false);
    }
  };

  const openSignatureDialog = (target) =>
    setSignatureDialog({ open: true, target });
  const closeSignatureDialog = () =>
    setSignatureDialog({ open: false, target: null });

  const handleSignatureSave = (dataUrl) => {
    if (signatureDialog.target === "titular") {
      setValue("constanciaVisita.firmaTitular", dataUrl, { shouldDirty: true });
    } else if (signatureDialog.target === "profesional") {
      setValue("constanciaVisita.profesional.firma", dataUrl, {
        shouldDirty: true,
      });
    }
    closeSignatureDialog();
  };

  const onValid = (data) => {
    onSubmit({
      data,
      files: {
        croquis: croquisFile,
        huella: huellaFile,
        anexoFotos: anexoLocalFiles.map(({ file, observaciones }) => ({
          file,
          observaciones,
        })),
      },
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onValid)} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? "Editar Diagnóstico" : "Nuevo Diagnóstico"}
      </Typography>

      <Grid container spacing={3}>
        {/* Información del Documento */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Información del Documento
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="metadata.fechaDiligenciamiento"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Fecha de Diligenciamiento"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="metadata.fechaSuscripcion"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Fecha de Suscripción"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {isEdit && consecutivoHogar && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Consecutivo Hogar: <strong>{consecutivoHogar}</strong>{" "}
                  (asignado automáticamente)
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* A. Datos del Titular del Hogar */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            A. Datos del Titular del Hogar
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.nombre"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nombre(s)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.apellido"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Apellido(s)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.documento"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="No. Documento"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.celular"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cel. Contacto"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.departamento"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Departamento"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.municipio"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Municipio"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.vereda"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Vereda" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="titular.otro"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Otro" />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Datos del Subsidio - Modalidad */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Datos del Subsidio - Modalidad
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Controller
            name="modalidad.type"
            control={control}
            rules={requiredRule}
            render={({ field, fieldState }) => (
              <TextField
                select
                fullWidth
                label="Modalidad"
                {...field}
                value={field.value || ""}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {MODALIDADES.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* B. Condición del Hogar */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            B. Condición del Hogar
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Controller
            name="actividadProductiva.tiene"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="¿En la vivienda se desarrolla alguna actividad productiva?"
              />
            )}
          />

          {actividadTiene && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="actividadProductiva.tipo"
                  control={control}
                  rules={requiredRule}
                  shouldUnregister
                  render={({ field, fieldState }) => (
                    <TextField
                      select
                      fullWidth
                      label="Tipo de actividad"
                      {...field}
                      value={field.value || ""}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      {TIPOS_ACTIVIDAD.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="actividadProductiva.descripcion"
                  control={control}
                  rules={actividadTipo === "Otro" ? requiredRule : undefined}
                  shouldUnregister
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Describa (Otro)"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="nivelEducativo"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    fullWidth
                    label="Nivel educativo del Jefe de Hogar"
                    {...field}
                    value={field.value || ""}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {NIVELES_EDUCATIVOS.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name="numeroPersonas"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="No. Personas en hogar"
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name="numeroHogares"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="No. Hogares en vivienda"
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <Controller
                name="numeroHabitaciones"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Habitaciones para dormir"
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <Controller
                name="numeroCuartos"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cuartos usados"
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* C. Acreditación de la Tenencia del Predio */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            C. Acreditación de la Tenencia del Predio
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={tenenciaTipo === "Otro" ? 6 : 12}>
              <Controller
                name="tenenciaPredio.tipo"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    fullWidth
                    label="Tipo de acreditación"
                    {...field}
                    value={field.value || ""}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {TIPOS_TENENCIA.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            {tenenciaTipo === "Otro" && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="tenenciaPredio.otro"
                  control={control}
                  rules={requiredRule}
                  shouldUnregister
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nombre y/o descripción (Otro)"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* D. Condiciones Ambientales */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            D. Condiciones Ambientales y Territoriales del Predio
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Paper variant="outlined" sx={{ p: 2 }}>
            {CONDICIONES_AMBIENTALES.map((condicionLabel, index) => (
              <Box
                key={condicionLabel}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom:
                    index < CONDICIONES_AMBIENTALES.length - 1
                      ? "1px solid"
                      : "none",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2">{`${String.fromCharCode(97 + index)}) ${condicionLabel}`}</Typography>
                <Controller
                  name={`condicionesAmbientales.${index}.cumple`}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      value={
                        field.value === true
                          ? "cumple"
                          : field.value === false
                            ? "no_cumple"
                            : ""
                      }
                      onChange={(e) =>
                        field.onChange(e.target.value === "cumple")
                      }
                    >
                      <FormControlLabel
                        value="cumple"
                        control={<Radio size="small" />}
                        label="Cumple"
                      />
                      <FormControlLabel
                        value="no_cumple"
                        control={<Radio size="small" />}
                        label="No cumple"
                      />
                    </RadioGroup>
                  )}
                />
              </Box>
            ))}
          </Paper>

          {hasIncumplimiento && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                Si el predio "NO CUMPLE", indicar la causa:
              </Typography>
              <Controller
                name="causasNoCumple.causas"
                control={control}
                render={({ field }) => (
                  <FormGroup row>
                    {CAUSAS_NO_CUMPLE.map((causa) => (
                      <FormControlLabel
                        key={causa}
                        sx={{ minWidth: "33%" }}
                        control={
                          <Checkbox
                            checked={(field.value || []).includes(causa)}
                            onChange={() => {
                              const current = field.value || [];
                              const next = current.includes(causa)
                                ? current.filter((c) => c !== causa)
                                : [...current, causa];
                              field.onChange(next);
                            }}
                          />
                        }
                        label={causa}
                      />
                    ))}
                  </FormGroup>
                )}
              />
              {causasSeleccionadas.includes("Otro") && (
                <Controller
                  name="causasNoCumple.otro"
                  control={control}
                  rules={requiredRule}
                  shouldUnregister
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      sx={{ mt: 1 }}
                      label='Descripción causa "Otro"'
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              )}
            </Box>
          )}
        </Grid>

        {/* F. Servicios Públicos */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            F. Disponibilidad o Acceso a Servicios Públicos
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Abastecimiento de Agua
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2">
                ¿El predio cuenta con posibilidad de abastecimiento de agua?
              </Typography>
              <Controller
                name="serviciosPublicos.abastecimientoAgua.cuenta"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    row
                    value={
                      field.value === true
                        ? "si"
                        : field.value === false
                          ? "no"
                          : ""
                    }
                    onChange={(e) => field.onChange(e.target.value === "si")}
                  >
                    <FormControlLabel
                      value="si"
                      control={<Radio size="small" />}
                      label="SI"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio size="small" />}
                      label="NO"
                    />
                  </RadioGroup>
                )}
              />
            </Box>

            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ mt: 1, mb: 0.5 }}
            >
              Fuente de agua para consumo humano y doméstico:
            </Typography>
            <Controller
              name="serviciosPublicos.abastecimientoAgua.fuentes"
              control={control}
              render={({ field }) => (
                <FormGroup row>
                  {FUENTES_AGUA.map((fuente) => (
                    <FormControlLabel
                      key={fuente}
                      sx={{ minWidth: "25%" }}
                      control={
                        <Checkbox
                          checked={(field.value || []).includes(fuente)}
                          onChange={() => {
                            const current = field.value || [];
                            const next = current.includes(fuente)
                              ? current.filter((f) => f !== fuente)
                              : [...current, fuente];
                            field.onChange(next);
                          }}
                        />
                      }
                      label={fuente}
                    />
                  ))}
                </FormGroup>
              )}
            />
            {aguaFuentes.includes("Otro") && (
              <Controller
                name="serviciosPublicos.abastecimientoAgua.fuenteOtroDescripcion"
                control={control}
                rules={requiredRule}
                shouldUnregister
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    sx={{ mt: 1 }}
                    label="¿Cuál? (Otro)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
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
            <Controller
              name="serviciosPublicos.aguasResiduales.tipo"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field} value={field.value || ""}>
                  {TIPOS_AGUAS_RESIDUALES.map((tipo) => (
                    <FormControlLabel
                      key={tipo}
                      value={tipo}
                      control={<Radio size="small" />}
                      label={tipo}
                      sx={{ minWidth: "33%" }}
                    />
                  ))}
                </RadioGroup>
              )}
            />
            {aguasResidualesTipo === "Otro" && (
              <Controller
                name="serviciosPublicos.aguasResiduales.otroDescripcion"
                control={control}
                rules={requiredRule}
                shouldUnregister
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    sx={{ mt: 1 }}
                    label="¿Cuál? (Otro)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
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
            <Controller
              name="serviciosPublicos.energia.tipo"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field} value={field.value || ""}>
                  {TIPOS_ENERGIA.map((tipo) => (
                    <FormControlLabel
                      key={tipo}
                      value={tipo}
                      control={<Radio size="small" />}
                      label={tipo}
                      sx={{ minWidth: "33%" }}
                    />
                  ))}
                </RadioGroup>
              )}
            />
            {energiaTipo === "Otro" && (
              <Controller
                name="serviciosPublicos.energia.otroDescripcion"
                control={control}
                rules={requiredRule}
                shouldUnregister
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    sx={{ mt: 1 }}
                    label="¿Cuál? (Otro)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
          </Paper>
        </Grid>

        {/* G. Levantamiento (Mano Alzada) */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            G. Levantamiento (Mano Alzada)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Premisas de Dibujo
                </Typography>
                <Controller
                  name="levantamiento.premisas"
                  control={control}
                  render={({ field }) => (
                    <FormGroup>
                      {PREMISAS_DIBUJO.map((premisa, i) => (
                        <FormControlLabel
                          key={premisa}
                          control={
                            <Checkbox
                              checked={(field.value || []).includes(premisa)}
                              onChange={() => {
                                const current = field.value || [];
                                const next = current.includes(premisa)
                                  ? current.filter((p) => p !== premisa)
                                  : [...current, premisa];
                                field.onChange(next);
                              }}
                            />
                          }
                          label={`${String.fromCharCode(97 + i)}) ${premisa}`}
                        />
                      ))}
                    </FormGroup>
                  )}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Características del Predio
                </Typography>
                <Controller
                  name="levantamiento.caracteristicas.area"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      sx={{ mb: 2 }}
                      label="A) Área zona de intervención (m²)"
                      type="number"
                      inputProps={{ min: 0, step: "0.01" }}
                    />
                  )}
                />
                <Controller
                  name="levantamiento.caracteristicas.pendiente"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      sx={{ mb: 2 }}
                      label="B) Pendiente en zona de intervención (%)"
                      type="number"
                      inputProps={{ min: 0, max: 100, step: "0.01" }}
                    />
                  )}
                />
                <Controller
                  name="levantamiento.caracteristicas.observaciones"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={4}
                      label="Observaciones del levantamiento"
                    />
                  )}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Croquis / Levantamiento
                </Typography>

                {croquisError && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setCroquisError(null)}
                  >
                    {croquisError}
                  </Alert>
                )}

                {/* CASO: EDIT con croquis ya cargado → preview read-only */}
                {isEdit && croquisUrl && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={resolveStaticUrl(croquisUrl)}
                      alt="Croquis del levantamiento"
                      sx={{
                        maxWidth: "100%",
                        maxHeight: 400,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      No modificable desde este formulario.
                    </Typography>
                  </Box>
                )}

                {/* CASO: EDIT con croquis faltante O CREATE → permitir subir */}
                {showCroquisUpload && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      py: 2,
                    }}
                  >
                    {croquisFilePreview && (
                      <Box
                        component="img"
                        src={croquisFilePreview}
                        alt="Croquis seleccionado"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                          mb: 1,
                        }}
                      />
                    )}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant={croquisFile ? "outlined" : "contained"}
                        component="label"
                        startIcon={
                          croquisUploading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CloudUploadIcon />
                          )
                        }
                        disabled={croquisUploading}
                      >
                        {croquisUploading
                          ? "Subiendo..."
                          : croquisFile || (isEdit && !croquisUrl)
                            ? "Reemplazar croquis"
                            : "Seleccionar croquis"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleCroquisFile}
                        />
                      </Button>
                      {croquisFile && (
                        <Button
                          color="error"
                          onClick={() => setCroquisFile(null)}
                        >
                          Quitar
                        </Button>
                      )}
                    </Box>
                    {!isEdit && (
                      <Typography variant="caption" color="text.secondary">
                        Se subirá al servidor cuando guardes el diagnóstico (se
                        convierte a WebP).
                      </Typography>
                    )}
                    {isEdit && !croquisUrl && (
                      <Typography variant="caption" color="text.secondary">
                        El croquis está faltante. Subilo ahora; después quedará
                        bloqueado.
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Composición del Hogar - Miembros */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Composición del Hogar – Miembros
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => miembrosArray.append({ ...MIEMBRO_VACIO })}
            >
              Agregar miembro
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Apellidos</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Nombres</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Documento</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Alt. Movilidad</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Ciego / Sordo</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Alt. Neurológica</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Cond. Escaleras</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Desc. Discapacidad</strong>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {miembrosArray.fields.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{ color: "text.secondary" }}
                    >
                      Sin miembros registrados. Usa "Agregar miembro" para
                      añadir uno.
                    </TableCell>
                  </TableRow>
                ) : (
                  miembrosArray.fields.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Controller
                          name={`miembros.${idx}.apellidos`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              variant="standard"
                              fullWidth
                              {...field}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`miembros.${idx}.nombres`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              variant="standard"
                              fullWidth
                              {...field}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`miembros.${idx}.documento`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              variant="standard"
                              fullWidth
                              {...field}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Controller
                          name={`miembros.${idx}.alteracionMovilidad`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Controller
                          name={`miembros.${idx}.ciegoSordo`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Controller
                          name={`miembros.${idx}.altNeurologica`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Controller
                          name={`miembros.${idx}.condEscaleras`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`miembros.${idx}.descDiscapacidad`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              variant="standard"
                              fullWidth
                              {...field}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => miembrosArray.remove(idx)}
                        >
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

        {/* I. Constancia de Visita */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            I. Constancia de Visita
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Titular del Hogar
                </Typography>
                <TextField
                  fullWidth
                  label="Nombre"
                  size="small"
                  sx={{ mb: 1 }}
                  value={`${titularNombre || ""} ${titularApellido || ""}`.trim()}
                  InputProps={{ readOnly: true }}
                  helperText="Tomado de la sección A"
                />
                <TextField
                  fullWidth
                  label="No. Documento"
                  size="small"
                  sx={{ mb: 2 }}
                  value={titularDocumento || ""}
                  InputProps={{ readOnly: true }}
                />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Firma del Titular
                  </Typography>
                  <Box
                    sx={{
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                      height: 110,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "background.paper",
                      mt: 0.5,
                    }}
                  >
                    {firmaTitular ? (
                      <img
                        src={firmaTitular}
                        alt="Firma del titular"
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin firma
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => openSignatureDialog("titular")}
                    >
                      {firmaTitular ? "Reemplazar" : "Capturar Firma"}
                    </Button>
                    {firmaTitular && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          setValue("constanciaVisita.firmaTitular", "", {
                            shouldDirty: true,
                          })
                        }
                      >
                        Borrar
                      </Button>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Huella Digital
                  </Typography>
                  <Box
                    sx={{
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                      height: 110,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "background.paper",
                      mt: 0.5,
                    }}
                  >
                    {huellaDigital ? (
                      <img
                        src={huellaSrc(huellaDigital)}
                        alt="Huella digital"
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                      />
                    ) : huellaFilePreview ? (
                      <img
                        src={huellaFilePreview}
                        alt="Huella seleccionada"
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin imagen
                      </Typography>
                    )}
                  </Box>

                  {/* EDIT con huella cargada → solo preview */}
                  {isEdit && huellaDigital && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      No modificable desde este formulario.
                    </Typography>
                  )}

                  {/* CREATE o EDIT con huella faltante → permitir subir */}
                  {showHuellaUpload && (
                    <>
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={
                            huellaUploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <FingerprintIcon />
                            )
                          }
                          component="label"
                          disabled={huellaUploading}
                        >
                          {huellaUploading
                            ? "Subiendo..."
                            : huellaFile
                              ? "Reemplazar huella"
                              : "Seleccionar huella"}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleHuellaFile}
                          />
                        </Button>
                        {huellaFile && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setHuellaFile(null)}
                          >
                            Quitar
                          </Button>
                        )}
                      </Box>
                      {!isEdit && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          Se subirá al servidor al guardar.
                        </Typography>
                      )}
                      {isEdit && !huellaDigital && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          La huella está faltante. Subila ahora; después quedará
                          bloqueada.
                        </Typography>
                      )}
                    </>
                  )}

                  {huellaError && (
                    <Alert
                      severity="error"
                      sx={{ mt: 1 }}
                      onClose={() => setHuellaError(null)}
                    >
                      {huellaError}
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Profesional de Diagnóstico
                </Typography>
                <Controller
                  name="constanciaVisita.profesional.nombre"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nombre"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                />
                <Controller
                  name="constanciaVisita.profesional.documento"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="No. Documento"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                />
                <Controller
                  name="constanciaVisita.profesional.tarjetaProfesional"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="No. Tarjeta Profesional"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <Typography variant="caption" color="text.secondary">
                  Firma del Profesional
                </Typography>
                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    height: 110,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.paper",
                    mt: 0.5,
                  }}
                >
                  {firmaProfesional ? (
                    <img
                      src={firmaProfesional}
                      alt="Firma del profesional"
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sin firma
                    </Typography>
                  )}
                </Box>
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => openSignatureDialog("profesional")}
                  >
                    {firmaProfesional ? "Reemplazar" : "Capturar Firma"}
                  </Button>
                  {firmaProfesional && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        setValue("constanciaVisita.profesional.firma", "", {
                          shouldDirty: true,
                        })
                      }
                    >
                      Borrar
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={8}>
              <Controller
                name="constanciaVisita.testigo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Testigo (si aplica) - Nombre"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="constanciaVisita.fechaVisita"
                control={control}
                rules={requiredRule}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Fecha de Visita"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <SignatureDialog
            open={signatureDialog.open}
            title={
              signatureDialog.target === "titular"
                ? "Firma del Titular"
                : signatureDialog.target === "profesional"
                  ? "Firma del Profesional"
                  : "Firma"
            }
            initialDataUrl={
              signatureDialog.target === "titular"
                ? firmaTitular
                : signatureDialog.target === "profesional"
                  ? firmaProfesional
                  : ""
            }
            onCancel={closeSignatureDialog}
            onSave={handleSignatureSave}
          />
        </Grid>

        {/* J. Concepto Técnico */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            J. Concepto Técnico - Diagnóstico Integral
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Validación Requisitos Generales
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Requisito</strong>
                    </TableCell>
                    <TableCell align="center" sx={{ width: 100 }}>
                      <strong>Cumple</strong>
                    </TableCell>
                    <TableCell align="center" sx={{ width: 100 }}>
                      <strong>No Cumple</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {REQUISITOS_GENERALES.map((requisitoLabel, index) => (
                    <TableRow key={requisitoLabel}>
                      <TableCell>{`${String.fromCharCode(97 + index)}) ${requisitoLabel}`}</TableCell>
                      <Controller
                        name={`conceptoTecnico.requisitosGenerales.${index}.cumple`}
                        control={control}
                        render={({ field }) => (
                          <>
                            <TableCell align="center">
                              <Radio
                                size="small"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Radio
                                size="small"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                              />
                            </TableCell>
                          </>
                        )}
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Validación Modalidad Vivienda Nueva
            </Typography>
            <Controller
              name="conceptoTecnico.viviendaNueva.aplica"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  row
                  value={
                    field.value === true
                      ? "aplica"
                      : field.value === false
                        ? "no_aplica"
                        : ""
                  }
                  onChange={(e) => field.onChange(e.target.value === "aplica")}
                  sx={{ mb: 1 }}
                >
                  <FormControlLabel
                    value="aplica"
                    control={<Radio size="small" />}
                    label="APLICA"
                  />
                  <FormControlLabel
                    value="no_aplica"
                    control={<Radio size="small" />}
                    label="NO APLICA"
                  />
                </RadioGroup>
              )}
            />

            {viviendaNuevaAplica === true && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Condición</strong>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 80 }}>
                        <strong>SI</strong>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 80 }}>
                        <strong>NO</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {CONDICIONES_VIVIENDA_NUEVA.map((condicionLabel, index) => (
                      <TableRow key={condicionLabel}>
                        <TableCell>{`${String.fromCharCode(97 + index)}) ${condicionLabel}`}</TableCell>
                        <Controller
                          name={`conceptoTecnico.viviendaNueva.condiciones.${index}.valor`}
                          control={control}
                          render={({ field }) => (
                            <>
                              <TableCell align="center">
                                <Radio
                                  size="small"
                                  checked={field.value === true}
                                  onChange={() => field.onChange(true)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Radio
                                  size="small"
                                  checked={field.value === false}
                                  onChange={() => field.onChange(false)}
                                />
                              </TableCell>
                            </>
                          )}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Anexo 01 - Registro Fotográfico */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Anexo 01 - Registro Fotográfico
            </Typography>
            <Button
              size="small"
              component="label"
              startIcon={
                anexoUploading ? <CircularProgress size={16} /> : <AddIcon />
              }
              disabled={anexoUploading}
            >
              {anexoUploading ? "Subiendo..." : "Agregar Foto"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAnexoFotoSelect}
              />
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {anexoError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setAnexoError(null)}
            >
              {anexoError}
            </Alert>
          )}

          {anexoFotosArray.fields.length === 0 &&
            anexoLocalFiles.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, textAlign: "center" }}
              >
                Sin fotos. Agregá la primera con el botón de arriba.
              </Typography>
            )}

          <Grid container spacing={2}>
            {/* Fotos ya subidas (EDIT) */}
            {anexoFotosArray.fields.map((row, idx) => {
              const url = watch(`anexoFotografico.fotos.${idx}.url`);
              return (
                <Grid item xs={12} md={12} key={row.id}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Fotografía {idx + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeAnexoUploadedFoto(idx)}
                        disabled={anexoUploading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box
                      component="img"
                      src={resolveStaticUrl(url)}
                      alt={`Fotografía ${idx + 1}`}
                      sx={{
                        width: "100%",
                        maxHeight: 280,
                        objectFit: "contain",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        backgroundColor: "#fafafa",
                        mb: 1,
                      }}
                    />
                    <Controller
                      name={`anexoFotografico.fotos.${idx}.observaciones`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Observaciones"
                          multiline
                          minRows={2}
                        />
                      )}
                    />
                  </Paper>
                </Grid>
              );
            })}

            {/* Fotos locales pendientes de subir (CREATE) */}
            {anexoLocalFiles.map((entry, idx) => (
              <Grid item xs={12} md={6} key={`local-${idx}`}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderStyle: "dashed",
                    borderColor: "warning.light",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      Fotografía nueva {idx + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeAnexoLocalFile(idx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box
                    component="img"
                    src={entry.previewUrl}
                    alt={`Foto local ${idx + 1}`}
                    sx={{
                      width: "100%",
                      maxHeight: 280,
                      objectFit: "contain",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      backgroundColor: "#fafafa",
                      mb: 1,
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Observaciones"
                    multiline
                    minRows={2}
                    value={entry.observaciones}
                    onChange={(e) =>
                      updateAnexoLocalObservaciones(idx, e.target.value)
                    }
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Se subirá al servidor al guardar.
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Botones */}
      </Grid>
      <Box
        item
        xs={12}
        sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
      >
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="contained" type="submit" color="primary">
          Guardar Diagnóstico
        </Button>
      </Box>
    </Box>
  );
};

export default DiagnosticoForm;
