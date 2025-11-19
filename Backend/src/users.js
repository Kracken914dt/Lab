
const users = [
  { id: 1, username: 'juan', password: 'juan123', role: 'user' },
  { id: 2, username: 'admin', password: 'admin123', role: 'admin' }
];

function findUser(username, password) {
  return users.find(u => u.username === username && u.password === password) || null;
}

function getUserById(id) {
  return users.find(u => u.id === id) || null;
}

module.exports = { users, findUser, getUserById };
