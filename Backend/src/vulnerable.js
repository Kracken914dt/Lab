const express = require('express');
const jwt = require('jsonwebtoken');
const { findUser } = require('./users');

const router = express.Router();

const WEAK_SECRET = '123';


function decodeJwtWithoutVerify(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const pad = payload.length % 4;
    const base64 = payload + (pad ? '='.repeat(4 - pad) : '');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

router.post('/login', (req, res) => {
  const { username, password, role } = req.body || {};
  const user = findUser(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const payload = { user: user.username, role: role || user.role };
  // Sin exp a propósito
  const token = jwt.sign(payload, WEAK_SECRET, { noTimestamp: false });
  return res.json({ token, note: 'Token sin expiración y con secreto débil' });
});


router.get('/admin', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Falta token' });

  const decoded = decodeJwtWithoutVerify(token);
  if (!decoded) return res.status(400).json({ error: 'Token mal formado' });

  if (decoded.role === 'admin') {
    return res.json({ message: 'Acceso administrador CONCEDIDO (vulnerable)', decoded });
  }
  return res.status(403).json({ error: 'Acceso denegado (role != admin, pero fácilmente falsificable)' });
});


router.get('/profile', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Falta token' });

  const decoded = decodeJwtWithoutVerify(token);
  if (!decoded) return res.status(400).json({ error: 'Token mal formado' });
  return res.json({ profile: decoded, note: 'Payload no verificado (inseguro)' });
});

module.exports = router;
