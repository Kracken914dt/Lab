const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { findUser, getUserById } = require('./users');

const router = express.Router();
router.use(cookieParser());


const SECURE_SECRET = process.env.SECURE_JWT_SECRET || '';
if (!SECURE_SECRET || SECURE_SECRET.length < 32) {
  console.warn('[SECURE] SECURE_JWT_SECRET no establecido o demasiado corto. Defínelo en .env');
}


const accessBlacklist = new Set(); 
const refreshStore = new Map(); 

function signAccessToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const jti = `${user.id}-${now}-${Math.random().toString(36).slice(2)}`;
  const payload = {
    sub: String(user.id),
    role: user.role,
    iat: now,
    exp: now + 10 * 60, // 10 minutos
    jti
  };
  return jwt.sign(payload, SECURE_SECRET, { algorithm: 'HS256' });
}

function signRefreshToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(user.id),
    iat: now,
    exp: now + 60 * 60 // 1 hora
  };
  const token = jwt.sign(payload, SECURE_SECRET, { algorithm: 'HS256' });
  refreshStore.set(token, { userId: user.id, exp: payload.exp });
  return token;
}

function verifyAccess(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Falta token' });
  try {
    const decoded = jwt.verify(token, SECURE_SECRET, { algorithms: ['HS256'] });
    if (decoded.jti && accessBlacklist.has(decoded.jti)) {
      return res.status(401).json({ error: 'Token inválido (revocado)' });
    }
    req.auth = decoded;
    const user = getUserById(Number(decoded.sub));
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = user; // rol desde backend
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido', details: e.message });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Requiere rol admin' });
}

// /secure/login - no confía en rol del cliente
router.post('/secure/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = findUser(username, password);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return res.json({ accessToken, refreshToken });
});


router.post('/secure/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'Falta refreshToken' });

  try {
    const decoded = jwt.verify(refreshToken, SECURE_SECRET, { algorithms: ['HS256'] });
    const entry = refreshStore.get(refreshToken);
    if (!entry || String(entry.userId) !== decoded.sub) {
      return res.status(401).json({ error: 'Refresh token inválido o revocado' });
    }

    refreshStore.delete(refreshToken);
    const user = getUserById(Number(decoded.sub));
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (e) {
    return res.status(401).json({ error: 'Refresh inválido', details: e.message });
  }
});


router.post('/secure/logout', (req, res) => {
  const { refreshToken, accessJti } = req.body || {};
  if (refreshToken && refreshStore.has(refreshToken)) {
    refreshStore.delete(refreshToken);
  }
  if (accessJti) accessBlacklist.add(accessJti);
  return res.json({ ok: true, message: 'Sesión cerrada' });
});


router.get('/secure/profile', verifyAccess, (req, res) => {
  return res.json({
    user: { id: req.user.id, username: req.user.username, role: req.user.role },
    token: { sub: req.auth.sub, iat: req.auth.iat, exp: req.auth.exp, jti: req.auth.jti }
  });
});


router.get('/secure/admin', verifyAccess, requireAdmin, (req, res) => {
  return res.json({ message: 'Acceso admin CONCEDIDO (seguro)' });
});

module.exports = router;
