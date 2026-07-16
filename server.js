const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase initialization
const SUPABASE_URL = 'https://mgcubzhxuegpjqpctwsk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0vS3AMysNghVw25CW0EeKQ_tcvah7cB';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Servir index.html na raiz
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Credenciais padrão do casal
const COUPLE_USERNAME = 'arthureana';
const COUPLE_PASSWORD = '123';

// Helper function to get today's date in local timezone
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === COUPLE_USERNAME && password === COUPLE_PASSWORD) {
    try {
      // Check if users already exist
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (checkError) {
        return res.status(500).json({ error: 'Erro ao verificar usuários' });
      }

      if (!existingUsers || existingUsers.length === 0) {
        // Create users on first login
        const { data: insertedUsers, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              username: COUPLE_USERNAME + '_arthur',
              password: password,
              name: 'Arthur Silva'
            },
            {
              username: COUPLE_USERNAME + '_ana',
              password: password,
              name: 'Ana Follmann'
            }
          ]);

        if (insertError) {
          console.error('Insert error:', insertError);
          return res.status(500).json({ error: 'Erro ao criar contas', details: insertError.message });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Obter informações do casal
app.get('/api/casal-info', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name')
      .order('id', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }

    res.json(users || []);
  } catch (error) {
    console.error('Error fetching casal info:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Marcar oração do dia
app.post('/api/prayer', async (req, res) => {
  const { user_id, date } = req.body;

  try {
    const { error } = await supabase
      .from('prayers')
      .insert([
        {
          user_id: user_id,
          date: date
        }
      ]);

    if (error) {
      // If it's a unique constraint error, it's OK (already prayed)
      if (error.code === '23505') {
        return res.json({ success: true });
      }
      return res.status(500).json({ error: 'Erro ao registrar oração' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking prayer:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Obter orações do mês
app.get('/api/prayers/:user_id/:month', async (req, res) => {
  const { user_id, month } = req.params;

  try {
    const { data: prayers, error } = await supabase
      .from('prayers')
      .select('date')
      .eq('user_id', user_id)
      .like('date', month + '%');

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar orações' });
    }

    const dates = prayers ? prayers.map(p => p.date) : [];
    res.json(dates);
  } catch (error) {
    console.error('Error fetching prayers:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Obter contagem total de dias de oração
app.get('/api/prayer-count/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data: prayers, error } = await supabase
      .from('prayers')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id);

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar contagem' });
    }

    const count = prayers ? prayers.length : 0;
    res.json({ count: count });
  } catch (error) {
    console.error('Error fetching prayer count:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Verificar se já orou hoje
app.get('/api/prayed-today/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const today = getTodayDate();

  try {
    const { data: prayers, error } = await supabase
      .from('prayers')
      .select('id')
      .eq('user_id', user_id)
      .eq('date', today);

    if (error) {
      return res.status(500).json({ error: 'Erro ao verificar oração' });
    }

    const prayed = prayers && prayers.length > 0;
    res.json({ prayed: prayed });
  } catch (error) {
    console.error('Error checking if prayed today:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Conectado ao Supabase: ${SUPABASE_URL}`);
});
