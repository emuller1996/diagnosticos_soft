import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import diagnosticoRoutes from './routes/diagnosticoRoutes.js';
import caracterizacionPescaRoutes from './routes/caracterizacionPescaRoutes.js';
import morgan from "morgan";

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(morgan("dev"));

// Middleware to parse JSON
app.use(express.json());

// Serve uploaded files publicly (croquis, huellas, etc.)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);
app.use('/api/caracterizacion-pesca', caracterizacionPescaRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler — ensures CORS headers are present on error responses
// (some hosts/proxies strip them, which surfaces as "CORS error" in the browser)
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/users`);
});