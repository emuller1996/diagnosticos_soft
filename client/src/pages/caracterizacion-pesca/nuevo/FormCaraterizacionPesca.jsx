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
    CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCaracterizacionPesca } from "../../../hooks/useCaracterizacionPesca";

export default function FormCaraterizacionPescaPage() {
    const navigate = useNavigate();
    const { createCaracterizacion } = useCaracterizacionPesca();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
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
            tipoEmbarcacion: ""
        }
    });

    const totalPersonas = watch("totalPersonas");
    const ninios = watch("ninios");
    const jovenes = watch("jovenes");
    const adultos = watch("adultos");
    const adultosMayores = watch("adultosMayores");

    useEffect(() => {
        const total = (ninios || 0) + (jovenes || 0) + (adultos || 0) + (adultosMayores || 0);
        setValue("totalPersonas", total);
    }, [ninios, jovenes, adultos, adultosMayores, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            await createCaracterizacion(data);
            setSubmitSuccess(true);
            // Redirigir después de un breve delay para que el usuario vea el mensaje de éxito
            setTimeout(() => {
                navigate("/dashboard/caracterizacion-pesca");
            }, 2000);
        } catch (err) {
            setSubmitError(err.message || "Ocurrió un error al guardar la ficha");
        } finally {
            setIsSubmitting(false);
        }
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
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#2E7D32" }}>
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
                                    <TextField
                                        {...field}
                                        label="Consejo Comunitario"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                            <Controller
                                name="asociacion"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Asociación"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                            <Controller
                                name="comunidad"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Comunidad / Vereda"
                                        fullWidth
                                    />
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
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}>
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
                                    startAdornment: <InputAdornment position="start">👥</InputAdornment>,
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
                                <FormLabel component="legend">¿El pescado es base de alimentación en su hogar?</FormLabel>
                                <Controller
                                    name="pescadoBaseAlimentacion"
                                    control={control}
                                    rules={{ required: "Seleccione una opción" }}
                                    render={({ field }) => (
                                        <RadioGroup {...field} row>
                                            <FormControlLabel value="si" control={<Radio />} label="Sí" />
                                            <FormControlLabel value="no" control={<Radio />} label="No" />
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
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}>
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
                                            <FormControlLabel value="menos5" control={<Radio />} label="Menos de 5 años" />
                                            <FormControlLabel value="5-10" control={<Radio />} label="5-10 años" />
                                            <FormControlLabel value="mas10" control={<Radio />} label="Más de 10 años" />
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
                                            <FormControlLabel value="mar" control={<Radio />} label="Mar adentro" />
                                            <FormControlLabel value="rio" control={<Radio />} label="Río/Estero" />
                                            <FormControlLabel value="ambos" control={<Radio />} label="Ambos" />
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
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 4, mb: 2, color: "#2E7D32" }}>
                        4. EMBARCACIÓN Y EQUIPO
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Tipo de embarcación:</FormLabel>
                                <Controller
                                    name="tipoEmbarcacion"
                                    control={control}
                                    rules={{ required: "Seleccione una opción" }}
                                    render={({ field }) => (
                                        <RadioGroup {...field} row>
                                            <FormControlLabel value="canoa" control={<Radio />} label="Canoa" />
                                            <FormControlLabel value="fibra" control={<Radio />} label="Fibra" />
                                            <FormControlLabel value="madera" control={<Radio />} label="Madera" />
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
                    </Grid>

                    {/* BOTONES DE ACCIÓN */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
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
        </Box>
    );
}
