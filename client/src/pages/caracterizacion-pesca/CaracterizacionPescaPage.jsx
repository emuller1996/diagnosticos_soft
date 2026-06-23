import React from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
} from "@mui/material";
import { Add, Edit, Visibility, Delete, Refresh, PictureAsPdf, Search, Person, CalendarMonth } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCaracterizacionPesca } from "../../hooks/useCaracterizacionPesca";
import { downloadCaracterizacionPescaPdf } from "../../services/pdf/caracterizacionPescaPdf";

export default function CaracterizacionPescaPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data, loading, error, fetchCaracterizaciones } =
    useCaracterizacionPesca();

  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item) =>
        item.nombrePescador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.comunidad?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleDownloadPdf = async (item) => {
    try {
      await downloadCaracterizacionPescaPdf(item);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Hubo un error al generar el PDF");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
      <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/dashboard/caracterizacion-pesca/nuevo")}
          sx={{ 
            px: 3, 
            py: 1.5, 
            borderRadius: 2,
            mt:3, 
            fontWeight: 600, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
          }}
        >
          Nueva Ficha
        </Button>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchCaracterizaciones}
            >
              <Refresh fontSize="small" /> Reintentar
            </Button>
          }
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>{error}</Typography>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        textAlign={{ xs: "center", sm: "left" }}
        sx={{mb:2}}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="primary"
            sx={{ letterSpacing: "-0.5px" }}
          >
            Caracterización de Pesca
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión y seguimiento de las fichas de caracterización técnica
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/dashboard/caracterizacion-pesca/nuevo")}
          sx={{ 
            px: 3, 
            py: 1.5, 
            borderRadius: 2,
            mt:3, 
            fontWeight: 600, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
          }}
        >
          Nueva Ficha
        </Button>
      </Box>

      {/* Search and Filters Bar */}
      {!loading && !error && data.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre, documento o comunidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              backgroundColor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          />
        </Box>
      )}

      {filteredData.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary">
            No se encontraron registros de caracterización.
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            Comience agregando una nueva ficha técnica al sistema.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Desktop View: Table */}
          {!isMobile ? (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, boxShadow: 2 }}
            >
              <Table>
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 2 }}>Pescador</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2 }}>Documento</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2 }}>Comunidad</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: theme.palette.primary.main }}>
                        {item.nombrePescador ? item.nombrePescador[0].toUpperCase() : 'P'}
                      </Avatar>
                      <Typography fontWeight="medium">{item.nombrePescador || item.id}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{item.documento || "N/A"}</TableCell>
                  <TableCell>{item.comunidad || "N/A"}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                      <CalendarMonth sx={{ fontSize: 14 }} />
                      {item.createdAt || item.fecha
                        ? new Date(item.createdAt || item.fecha).toLocaleDateString()
                        : "N/A"}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/dashboard/caracterizacion-pesca/ver/${item.id}`)}
                        title="Ver detalle"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                       <IconButton
                         color="secondary"
                         onClick={() => navigate(`/dashboard/caracterizacion-pesca/editar/${item.id}`)}
                         title="Editar"
                       >
                         <Edit fontSize="small" />
                       </IconButton>
                        <IconButton
                          color="info"
                          onClick={() => handleDownloadPdf(item)}
                          title="Descargar PDF"
                        >
                          <PictureAsPdf fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* Mobile View: Cards */
            <Grid container spacing={2}>
              {filteredData.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      transition: "0.3s",
                      "&:hover": { 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderColor: 'primary.light'
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                         <Box display="flex" gap={2} alignItems="center">
                            <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main, fontWeight: 'bold' }}>
                              {item.nombrePescador ? item.nombrePescador[0].toUpperCase() : 'P'}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="text.primary"
                              >
                                {item.nombrePescador || `Ficha #${item.id}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Doc: {item.documento || "N/A"} | {item.comunidad || "S/C"}
                              </Typography>
                            </Box>
                         </Box>
                         <Box display="flex" gap={1}>
                           <IconButton
                             size="small"
                             color="primary"
                             onClick={() => navigate(`/dashboard/caracterizacion-pesca/ver/${item.id}`)}
                           >
                             <Visibility fontSize="small" />
                           </IconButton>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => navigate(`/dashboard/caracterizacion-pesca/editar/${item.id}`)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleDownloadPdf(item)}
                            >
                              <PictureAsPdf fontSize="small" />
                            </IconButton>
                          </Box>
                      </Box>
 
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        pt={2}
                        borderTop="1px solid"
                        borderColor="grey.100"
                      >
                        <Chip 
                          label={`📅 ${item.createdAt || item.fecha 
                            ? new Date(item.createdAt || item.fecha).toLocaleDateString() 
                            : 'Sin fecha'}`} 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                        />
                        <Button
                          size="small"
                          onClick={() => navigate(`/dashboard/caracterizacion-pesca/ver/${item.id}`)}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          Ver Detalles
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
