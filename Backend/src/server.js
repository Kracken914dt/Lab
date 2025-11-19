require('dotenv').config();
const express = require('express');
const vulnerable = require('./vulnerable');
const secure = require('./secure');

const app = express();

// CORS para permitir acceso desde el frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Broken Authentication / JWT Lab',
    endpoints: {
      vulnerable: ['/login (POST)', '/admin (GET)', '/profile (GET)'],
      secure: ['/secure/login (POST)', '/secure/refresh (POST)', '/secure/logout (POST)', '/secure/profile (GET)', '/secure/admin (GET)']
    }
  });
});

app.use(vulnerable);
app.use(secure);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JWT Lab backend escuchando en http://localhost:${PORT}`);
});
