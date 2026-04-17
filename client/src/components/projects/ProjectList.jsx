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

const ProjectList = ({ projects, onInactivate, onEdit }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead sx={{ backgroundColor: 'grey.200' }}>
          <TableRow>
            <TableCell><strong>Nombre</strong></TableCell>
            <TableCell><strong>Tipo</strong></TableCell>
            <TableCell><strong>Ciudad</strong></TableCell>
            <TableCell><strong>Estado</strong></TableCell>
            <TableCell align="right"><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">No hay proyectos registrados</TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.project_type}</TableCell>
                <TableCell>{project.city}</TableCell>
                <TableCell>
                  <Chip 
                    label={project.active ? 'Activo' : 'Inactivo'} 
                    color={project.active ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver Detalles">
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {project.active && (
                    <>
                      <Tooltip title="Editar Proyecto">
                        <IconButton 
                          color="primary" 
                          onClick={() => onEdit(project)}
                        >
                          <ModeEditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Inactivar Proyecto">
                        <IconButton 
                          color="error" 
                          onClick={() => onInactivate(project.id)}
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

export default ProjectList;