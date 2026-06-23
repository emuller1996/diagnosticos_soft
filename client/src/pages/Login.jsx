import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container, 
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import { Email, Lock, Phishing } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      
      setError(err.response.data.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 3,
            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)'
          }}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Bienvenido
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Inicie sesión para acceder al sistema
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large" 
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </Button>
            
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                ¿No tienes cuenta?{' '}
                <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }}>o</Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Phishing />}
            onClick={() => navigate('/dashboard/caracterizacion-pesca/nuevo')}
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            Llenar caracterización de pesca
          </Button>
          <Typography variant="caption" color="textSecondary" display="block" textAlign="center" mt={1}>
            Puede llenar la ficha sin conexión. Se enviará al iniciar sesión.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;