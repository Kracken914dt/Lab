const axios = require('axios');

async function main() {
  // Usuario normal
  const loginUser = await axios.post('http://localhost:3000/secure/login', {
    username: 'juan',
    password: 'juan123'
  });
  const userAccess = loginUser.data.accessToken;
  try {
    await axios.get('http://localhost:3000/secure/admin', {
      headers: { Authorization: `Bearer ${userAccess}` }
    });
    console.log('[secure] ERROR: usuario no admin accedió a /secure/admin');
  } catch (e) {
    console.log('[secure] OK: usuario no admin bloqueado en /secure/admin');
  }

  // Usuario admin
  const loginAdmin = await axios.post('http://localhost:3000/secure/login', {
    username: 'admin',
    password: 'admin123'
  });
  const adminAccess = loginAdmin.data.accessToken;
  const ok = await axios.get('http://localhost:3000/secure/admin', {
    headers: { Authorization: `Bearer ${adminAccess}` }
  });
  console.log('[secure] Admin acceso:', ok.data);
}

main().catch(err => {
  if (err.response) console.error('HTTP', err.response.status, err.response.data);
  else console.error(err.message);
  process.exit(1);
});
