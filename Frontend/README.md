# Frontend - JWT Security Lab

Frontend React + Vite + Tailwind CSS v3 para demostrar vulnerabilidades y seguridad en JWT.

## Características

### ❌ Flujo Vulnerable
- Login sin verificación robusta
- Visualización de tokens sin expiración
- Generador de tokens falsificados (cambio de role a admin)
- Acceso a endpoints vulnerables que no verifican firma

### ✅ Flujo Seguro
- Login con tokens verificados
- Access token con expiración (10 min)
- Refresh token para renovación
- Logout con invalidación de tokens
- Protección de rutas admin con verificación de rol desde backend

## Arranque

```powershell
npm install
npm run dev
```

Abre el navegador en: `http://localhost:5173`

## Requisitos

- Backend corriendo en `http://localhost:3000`
- Node.js >= 18

## Usuarios de prueba

- **Usuario normal**: `juan / juan123` (role: user)
- **Administrador**: `admin / admin123` (role: admin)

## Uso

1. **Tab "Vulnerable Flow"**:
   - Haz login con `juan/juan123`
   - Observa el token sin expiración
   - Haz clic en "Generar Token Falsificado" para cambiar role a admin
   - Accede a `/admin` con el token falsificado y verás acceso concedido ⚠️

2. **Tab "Secure Flow"**:
   - Haz login con `admin/admin123`
   - Accede a `/secure/admin` (permitido)
   - Haz login con `juan/juan123` e intenta acceder a `/secure/admin` (denegado)
   - Prueba la renovación de tokens y el logout

## Tecnologías

- React 18
- Vite 7
- Tailwind CSS 3
- Fetch API para requests HTTP
