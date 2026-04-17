# Contexto del Proyecto: diagnosticos_soft

Este documento sirve como guía de contexto para agentes de IA y desarrolladores sobre la arquitectura, el stack tecnológico y la funcionalidad de la aplicación **diagnosticos_soft**.

## 🚀 Stack Tecnológico

### Frontend (Client)
- **Framework**: React 18 (Vite)
- **UI Library**: Material UI (MUI)
- **Routing**: React Router Dom v6
- **Estado/Contexto**: AuthContext (Context API)
- **Estilos**: Emotion (vía MUI)

### Backend (Server)
- **Entorno**: Node.js (ES Modules)
- **Framework**: Express 5.x
- **Base de Datos / Motor de Búsqueda**: Elasticsearch (Utilizado como almacén de documentos para usuarios)
- **Autenticación**: JSON Web Tokens (JWT)
- **Configuración**: Dotenv (`.env`)

## 🏗️ Arquitectura del Sistema

La aplicación sigue una estructura modular separando la lógica de transporte, control y persistencia.

### Backend Structure
- `server/index.js`: Punto de entrada, configuración de middleware (CORS, JSON) y rutas.
- `server/config/`: Configuración de conexiones externas (ej. `elastic.js` para la conexión al cluster de Elasticsearch).
- `server/routes/`: Definición de endpoints API.
- `server/controllers/`: Lógica de orquestación de las peticiones (validaciones básicas, manejo de respuestas HTTP).
- `server/services/`: Lógica de negocio y acceso a datos (interacción directa con el cliente de Elasticsearch).

### Frontend Structure
- `client/src/App.jsx`: Definición de rutas y proveedores de contexto.
- `client/src/context/`: Gestión del estado global de autenticación.
- `client/src/pages/`: Componentes de vista (Login, Register, Dashboard).
- `client/src/services/`: Capa de comunicación con la API del backend.
- `client/src/components/`: Componentes reutilizables y de infraestructura (ej. `ProtectedRoute`).

## 🛠️ Flujos Principales

### Autenticación y Usuarios
1. **Registro**: 
   - Frontend (`Register.jsx`) $\rightarrow$ Backend (`/api/users/register`) $\rightarrow$ `userController.register` $\rightarrow$ `userService.createUser`.
   - El usuario se guarda en Elasticsearch usando el email como ID del documento.
2. **Login**:
   - Frontend (`Login.jsx`) $\rightarrow$ Backend (`/api/users/login`) $\rightarrow$ `userController.login` $\rightarrow$ `userService.findUserByEmail`.
   - Si las credenciales coinciden, se genera un JWT firmado con `JWT_SECRET` válido por 24h.
3. **Protección de Rutas**:
   - El componente `ProtectedRoute` en el frontend verifica la existencia de un token en el contexto de autenticación antes de renderizar el `Dashboard`.

## 📋 Notas Importantes para el Desarrollo

- **Elasticsearch**: Se utiliza el cliente oficial `@elastic/elasticsearch`. Los índices están definidos mediante variables de entorno (`INDEX_ELASTIC`).
- **Seguridad**: Las contraseñas se están manejando actualmente en texto plano (punto a mejorar: implementar hashing con `bcrypt`).
- **Env Vars**: El servidor requiere un archivo `.env` con:
  - `PORT`
  - `JWT_SECRET`
  - `ELASTIC_NODE`
  - `USER_ELASTIC`
  - `PASS_ELASTIC`
  - `INDEX_ELASTIC`

## 📂 Mapa de Archivos Clave

| Archivo | Propósito |
| :--- | :--- |
| `server/index.js` | Arranque del servidor y middleware |
| `server/config/elastic.js` | Cliente de conexión a Elasticsearch |
| `server/services/userService.js` | CRUD de usuarios en Elastic |
| `client/src/context/AuthContext.jsx` | Estado global de sesión |
| `client/src/App.jsx` | Enrutamiento y Temas (MUI) |