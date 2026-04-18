import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  Chip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const DiagnosticoList = ({ diagnosticos, onInactivate, onEdit, loading }) => {
  if (loading) {
    return <div style={{ textAlign: 'center', mt: 3 }}>Cargando diagnósticos...</div>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead sx={{ backgroundColor: 'grey.200' }}>
          <TableRow>
            <TableCell><strong>Titular</strong></TableCell>
            <TableCell><strong>Documento</strong></TableCell>
            <TableCell><strong>Modalidad</strong></TableCell>
            <TableCell><strong>Estado</strong></TableCell>
            <TableCell align="right"><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {diagnosticos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">No hay diagnósticos registrados</TableCell>
            </TableRow>
          ) : (
            diagnosticos.map((diag) => (
              <TableRow key={diag.id} hover>
                <TableCell>{`${diag.titular.nombre} ${diag.titular.apellido}`}</TableCell>
                <TableCell>{diag.titular.documento}</TableCell>
                <TableCell>{diag.modalidad.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={diag.active ? 'Activo' : 'Inactivo'} 
                    color={diag.active ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver Detalles">
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {diag.active && (
                    <>
                      <Tooltip title="Editar Diagnóstico">
                        <IconButton 
                          color="primary" 
                          onClick={() => onEdit(diag)}
                        >
                          <ModeEditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Inactivar Diagnóstico">
                        <IconButton 
                          color="error" 
                          onClick={() => onInactivate(diag.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiagnosticoList;