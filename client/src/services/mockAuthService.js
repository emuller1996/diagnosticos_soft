/**
 * Servicio de autenticación simulada (Mock)
 * En un entorno real, estas funciones realizarían peticiones fetch a un servidor.
 */

const MOCK_USER = {
  email: 'test@example.com',
  password: '123456',
  name: 'Usuario de Prueba'
};

// Simulación de base de datos de usuarios en localStorage
const getUsers = () => JSON.parse(localStorage.getItem('mock_users') || '[]');
const saveUsers = (users) => localStorage.setItem('mock_users', JSON.stringify(users));

export const mockAuthService = {
  /**
   * Simula el login. Valida contra el usuario predefinido o los registrados en localStorage.
   */
  async login(email, password) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia de red

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password) || 
                 (email === MOCK_USER.email && password === MOCK_USER.password ? MOCK_USER : null);

    if (user) {
      // Generamos un "JWT" simulado (Base64 del nombre y email)
      // IMPORTANTE: En producción, el JWT debe ser firmado por el backend con una clave secreta.
      const token = btoa(JSON.stringify({ email: user.email, name: user.name, exp: Date.now() + 3600000 }));
      return {
        token,
        user: { name: user.name, email: user.email }
      };
    }
    throw new Error('Credenciales inválidas');
  },

  /**
   * Simula el registro de un nuevo usuario.
   */
  async register(userData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getUsers();
    
    if (users.find(u => u.email === userData.email)) {
      throw new Error('El correo electrónico ya está registrado');
    }

    users.push(userData);
    saveUsers(users);
    return { message: 'Usuario registrado exitosamente' };
  },

  /**
   * Verifica si el token es válido (decodifica y revisa expiración).
   */
  async verifyToken(token) {
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.exp < Date.now()) {
        throw new Error('Token expirado');
      }
      return decoded;
    } catch (e) {
      throw new Error('Token inválido');
    }
  }
};