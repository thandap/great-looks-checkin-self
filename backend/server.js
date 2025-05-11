const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/', (req, res) => res.send('API running'));

app.post('/checkin', async (req, res) => {
  const { name, phone, service, stylist } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO checkins (name, phone, service, stylist) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, service, stylist]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/checkins', async (req, res) => {
  const result = await pool.query('SELECT * FROM checkins WHERE status = $1 ORDER BY created_at ASC', ['Waiting']);
  res.json(result.rows);
});

app.put('/checkins/:id', async (req, res) => {
  await pool.query('UPDATE checkins SET status = $1 WHERE id = $2', ['Served', req.params.id]);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));