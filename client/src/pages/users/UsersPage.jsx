import React from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Pagination, 
  CircularProgress,
  Container
} from '@mui/material';
import { useUsers } from '../../hooks/useUsers';

const UsersPage = () => {
  const {
    users,
    loading,
    total,
    currentPage,
    totalPages,
    searchTerm,
    handlePageChange,
    handleSearchChange,
  } = useUsers();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Listado de Usuarios
        </Typography>
        <TextField
          label="Buscar usuario (Nombre o Email)"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ position: 'relative' }}>
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              bgcolor: 'rgba(255, 255, 255, 0.7)', 
              zIndex: 1 
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">{user.type || 'user'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Total de usuarios: {total}
        </Typography>
        <Pagination 
          count={totalPages} 
          page={currentPage} 
          onChange={(page) => handlePageChange(page)} 
          color="primary" 
          disabled={loading}
        />
      </Box>
    </Container>
  );
};

export default UsersPage;