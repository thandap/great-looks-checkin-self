const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check
app.get('/', (req, res) => res.send('API running ✅'));

//Get stlylists
app.get('/stylists', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name FROM stylists WHERE is_active = true ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stylists:', err);
    res.status(500).json({ error: err.message });
  }
});


// Create check-in
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
    console.error('Error inserting check-in:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get waiting check-ins
app.get('/checkins', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, stylist, service, status, created_at
FROM checkins
WHERE status = 'Waiting'
ORDER BY created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching check-ins:', err);
    res.status(500).json({ error: err.message });
  }
});
// Get list of active services
app.get('/services', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name FROM services WHERE is_active = true ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark check-in as served
app.put('/checkins/:id', async (req, res) => {
  try {
    await pool.query(
      `UPDATE checkins 
       SET status = 'Served' 
       WHERE id = $1`,
      [req.params.id]
    );
    console.log(`Check-in ID ${req.params.id} marked as served`);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating check-in:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
