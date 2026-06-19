import userService from '../services/userService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userController = {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await userService.createUser({ email, password, name });
      res.status(201).json({ message: 'User created successfully', result });
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

       const user = await userService.findUserByEmail(email);
 
       if (!user) {
         return res.status(401).json({ message: 'Invalid credentials' });
       }

       const isPasswordValid = await bcrypt.compare(password, user.password);
       if (!isPasswordValid) {
         return res.status(401).json({ message: 'Invalid credentials' });
       }

      const token = jwt.sign(
        { email: user.email, id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({ 
        message: 'Login successful', 
        token,
        user: { email: user.email, name: user.name } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  async listUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await userService.findUsers({ page, limit, search });
      
      res.status(200).json({
        ...result,
        currentPage: page,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
};

export default userController;
