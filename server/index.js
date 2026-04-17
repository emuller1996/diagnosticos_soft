import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import morgan from "morgan";

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

app.use(morgan("dev"));

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/users`);
});