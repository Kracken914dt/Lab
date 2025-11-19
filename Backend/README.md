# Broken Authentication / JWT Lab (Login Vulnerable)

Backend: Express.js | Base de datos: ninguna (usuarios hardcodeados)

## Objetivo
Aprender a:
- Crear y explotar JWT inseguros
- Falsificar tokens
- Abusar de secretos débiles
- Romper autenticación por falta de verificación
- Implementar una versión segura para comparar

## Arquitectura
- Rutas vulnerables: `/login`, `/profile`, `/admin`
- Rutas seguras: `/secure/login`, `/secure/profile`, `/secure/admin`, `/secure/refresh`, `/secure/logout`

## Arranque
1) Copia `.env.example` a `.env` y establece un secreto robusto (>=32 bytes):

```powershell
Copy-Item .env.example .env
# Genera un secreto robusto
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" | Set-Content -Encoding ascii .secret.txt
(Get-Content .secret.txt) | ForEach-Object { $_ } | ForEach-Object { Add-Content .env "SECURE_JWT_SECRET=$_" }
Add-Content .env "PORT=3000"
```

2) Instalar dependencias y ejecutar:

```powershell
npm install
npm start
```

Servidor en: `http://localhost:3000`

---

## PARTE 1: Implementación VULNERABLE
Vulnerabilidades intencionales:
- JWT sin expiración (`exp`)
- Secret muy débil: `"123"`
- No se verifica el signature del token
- Se confía en el campo `role` enviado por el cliente

### Rutas vulnerables
1. `POST /login`
   - Body: `{ "username": "juan", "password": "juan123" }` (opcionalmente `role` para demostrar confianza indebida)
   - Genera token sin expiración firmado con `123`.

2. `GET /profile`
   - Header: `Authorization: Bearer <token>`
   - Decodifica sin verificar firma y devuelve el payload.

3. `GET /admin`
   - Debería requerir `role: admin`, pero NO verifica la firma.
   - Solo lee el payload del JWT.

### Ataques prácticos
1) Falsificar un JWT sin secret (no se verifica la firma):
   - Copia token original, decodifica en jwt.io.
   - Cambia `"role":"user"` a `"role":"admin"`.
   - Genera token inválido (sin firmar) y úsalo:

```http
Authorization: Bearer <token_modificado>
```
   - Acceso admin conseguido.

2) Refirmar el token con el secret débil (`"123"`):
   - En jwt.io coloca el secret `123` y firma un token con `role: admin`.
   - Accedes sin restricción a `/admin`.

3) Ataque de fuerza bruta al secret del JWT:
   - Con hashcat modo 16500 o herramientas similares:
```bash
hashcat -a 3 -m 16500 token.txt ?a?a?a
```
   - Con un secret tan débil como `123` se crackea en segundos.

---

## PARTE 2: VERSIÓN SEGURA (HARDENING)
Cambios correctivos implementados:
- Secret robusto (>= 32 bytes) desde `.env` (`SECURE_JWT_SECRET`)
- `exp` obligatorio (10 minutos para access token)
- Verificar firmas SIEMPRE (HS256)
- Usar `role` solo desde backend (mapa de usuarios hardcodeado)
- Rotación de tokens (`/secure/refresh` invalida el anterior)
- Logout invalidando tokens (`/secure/logout`)

### Rutas seguras
- `POST /secure/login` → devuelve `{ accessToken, refreshToken }`
- `POST /secure/refresh` → rotación: devuelve nuevos tokens e invalida refresh anterior
- `POST /secure/logout` → invalida refresh y (opcional) `accessJti`
- `GET /secure/profile` → requiere `Authorization: Bearer <accessToken>` válido
- `GET /secure/admin` → requiere admin; rol tomado del backend, no del JWT del cliente

### Ejemplos (PowerShell)
Login seguro (usuario normal juan):
```powershell
$body = @{ username = 'juan'; password = 'juan123' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/secure/login -ContentType 'application/json' -Body $body
```
Con el `accessToken` recibido:
```powershell
$token = '<ACCESS_TOKEN>'
Invoke-RestMethod -Method Get -Uri http://localhost:3000/secure/profile -Headers @{ Authorization = "Bearer $token" }
```
Acceso admin con usuario admin:
```powershell
$body = @{ username = 'admin'; password = 'admin123' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/secure/login -ContentType 'application/json' -Body $body
Invoke-RestMethod -Method Get -Uri http://localhost:3000/secure/admin -Headers @{ Authorization = "Bearer $($login.accessToken)" }
```
Rotación de refresh token:
```powershell
$refreshBody = @{ refreshToken = $login.refreshToken } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/secure/refresh -ContentType 'application/json' -Body $refreshBody
```
Logout:
```powershell
$logoutBody = @{ refreshToken = $login.refreshToken; accessJti = 'opcional-jti-del-access' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/secure/logout -ContentType 'application/json' -Body $logoutBody
```

---

## Usuarios demo
- `juan / juan123` (role: user)
- `admin / admin123` (role: admin)

> Nota: No hay base de datos.
