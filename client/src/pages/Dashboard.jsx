import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box,
  CircularProgress
} from '@mui/material';
import { 
  Assignment as ProjectIcon, 
  People as UserIcon, 
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { projectService } from '../services/projectService';

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <Box sx={{ 
        backgroundColor: `${color}15`, 
        color: color, 
        p: 1.5, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {icon}
      </Box>
    </Box>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" fontWeight="bold">
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await projectService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Bienvenido al Panel de Control
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Aquí tienes un resumen rápido de la actividad de tu sistema.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <StatCard 
              title="Proyectos Activos" 
              value={stats?.activeProjects || 0} 
              icon={<ProjectIcon fontSize="large" />} 
              color="#2563eb" 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard 
              title="Total Proyectos" 
              value={stats?.totalProjects || 0} 
              icon={<UserIcon fontSize="large" />} 
              color="#7c3aed" 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard 
              title="Proyectos Completados" 
              value={stats?.completedProjects || 0} 
              icon={<SettingsIcon fontSize="large" />} 
              color="#059669" 
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;