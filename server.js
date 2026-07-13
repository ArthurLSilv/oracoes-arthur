const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Inicializar banco de dados
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Conectado ao banco de dados SQLite');
});

// Criar tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    )
  `);
});

// Credenciais padrão do casal
const COUPLE_USERNAME = 'arthureana';
const COUPLE_PASSWORD = '123';

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === COUPLE_USERNAME && password === COUPLE_PASSWORD) {
    // Check if users already exist
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar usuários' });
      }

      if (row.count === 0) {
        // Create users on first login
        db.run(
          'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
          [COUPLE_USERNAME + '_arthur', password, 'Arthur Silva'],
          function (err1) {
            if (err1) {
              return res.status(500).json({ error: 'Erro ao criar conta' });
            }

            db.run(
              'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
              [COUPLE_USERNAME + '_ana', password, 'Ana Follmann'],
              function (err2) {
                if (err2) {
                  return res.status(500).json({ error: 'Erro ao criar conta' });
                }
                res.json({ success: true });
              }
            );
          }
        );
      } else {
        res.json({ success: true });
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Registro (primeira vez)
app.post('/api/register', (req, res) => {
  const { username, password, name1, name2 } = req.body;

  if (username !== COUPLE_USERNAME || password !== COUPLE_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }

  db.run(
    'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
    [username + '_pessoa1', password, name1],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar conta' });
      }

      db.run(
        'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
        [username + '_pessoa2', password, name2],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao criar segunda conta' });
          }

          db.all('SELECT id, name FROM users WHERE username LIKE ?', [username + '%'], (err, users) => {
            res.json({ success: true, users });
          });
        }
      );
    }
  );
});

// Obter informações do casal
app.get('/api/casal-info', (req, res) => {
  db.all('SELECT id, name FROM users WHERE username LIKE ?', [COUPLE_USERNAME + '%'], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    res.json(users);
  });
});

// Marcar oração do dia
app.post('/api/prayer', (req, res) => {
  const { user_id, date } = req.body;

  db.run(
    'INSERT OR IGNORE INTO prayers (user_id, date) VALUES (?, ?)',
    [user_id, date],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao registrar oração' });
      }
      res.json({ success: true });
    }
  );
});

// Obter orações do mês
app.get('/api/prayers/:user_id/:month', (req, res) => {
  const { user_id, month } = req.params;

  db.all(
    `SELECT date FROM prayers WHERE user_id = ? AND date LIKE ?`,
    [user_id, month + '%'],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar orações' });
      }
      res.json(rows.map((r) => r.date));
    }
  );
});

// Obter contagem total de dias de oração
app.get('/api/prayer-count/:user_id', (req, res) => {
  const { user_id } = req.params;

  db.get('SELECT COUNT(*) as count FROM prayers WHERE user_id = ?', [user_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar contagem' });
    }
    res.json({ count: row.count });
  });
});

// Verificar se já orou hoje
app.get('/api/prayed-today/:user_id', (req, res) => {
  const { user_id } = req.params;
  const today = new Date().toISOString().split('T')[0];

  db.get('SELECT id FROM prayers WHERE user_id = ? AND date = ?', [user_id, today], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar oração' });
    }
    res.json({ prayed: !!row });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
