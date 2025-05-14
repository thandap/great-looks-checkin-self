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

app.get('/', (req, res) => res.send('API running ✅'));

// ✅ POST - add new check-in
app.post('/checkin', async (req, res) => {
  const { name, phone, service, stylist } = req.body;
  console.log('New check-in:', { name, phone, service, stylist });

  try {
    const result = await pool.query(
      `INSERT INTO checkins (name, phone, service, stylist) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, phone, service, stylist]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET - list all waiting check-ins
app.get('/checkins', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM checkins 
       WHERE status = 'Waiting' 
       ORDER BY created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT - mark check-in as Served
app.put('/checkins/:id', async (req, res) => {
  try {
    await pool.query(
      `UPDATE checkins 
       SET status = 'Served' 
       WHERE id = $1`,
      [req.params.id]
    );
    console.log(`Marked check-in ID ${req.params.id} as Served`);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
