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
} from "@mui/material";
import { Add, Edit, Visibility, Delete, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCaracterizacionPesca } from "../../hooks/useCaracterizacionPesca";

export default function CaracterizacionPescaPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data, loading, error, fetchCaracterizaciones } =
    useCaracterizacionPesca();

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
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="primary"
          >
            Caracterización de Pesca
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión y seguimiento de las fichas de caracterización
          </Typography>
        </Box>
      </Box>
      <Box sx={{mb:2}}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => navigate("/dashboard/caracterizacion-pesca/nuevo")}
        >
          Agregar Primera Ficha
        </Button>
      </Box>

      {data.length === 0 ? (
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
                    <TableCell fontWeight="bold">Nombre/ID</TableCell>
                    <TableCell fontWeight="bold">documento</TableCell>
                    <TableCell fontWeight="bold">Fecha</TableCell>
                    <TableCell fontWeight="bold" align="right">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {item.nombrePescador || item.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.documento || "N/A"}</TableCell>
                      <TableCell>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <IconButton
                            color="primary"
                            onClick={() =>
                              navigate(
                                `/dashboard/caracterizacion-pesca/ver/${item.id}`,
                              )
                            }
                            title="Ver detalle"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() =>
                              navigate(
                                `/dashboard/caracterizacion-pesca/editar/${item.id}`,
                              )
                            }
                            title="Editar"
                          >
                            <Edit />
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
              {data.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 4 },
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="primary"
                          >
                            {item.nombre || `Ficha #${item.id}`}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            📍 {item.ubicacion || "Ubicación no especificada"}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              navigate(
                                `/dashboard/caracterizacion-pesca/ver/${item.id}`,
                              )
                            }
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() =>
                              navigate(
                                `/dashboard/caracterizacion-pesca/editar/${item.id}`,
                              )
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        pt={2}
                        borderTop="1px solid"
                        borderColor="grey.200"
                      >
                        <Typography variant="caption" color="text.disabled">
                          Fecha:{" "}
                          {item.fecha
                            ? new Date(item.fecha).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() =>
                            navigate(
                              `/dashboard/caracterizacion-pesca/ver/${item.id}`,
                            )
                          }
                          sx={{ textTransform: "none" }}
                        >
                          Ver más
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
