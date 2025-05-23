const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check
app.get('/', (req, res) => res.send('API running ✅'));

// Get stylists
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
  const { name, phone, service, stylist, time } = req.body;
  console.log('New check-in:', { name, phone, service, stylist, time });
  try {
    const result = await pool.query(
      `INSERT INTO checkins (name, phone, service, stylist, preferred_time) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, phone, service, stylist, time]
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
       WHERE status IN ('Waiting','Now Serving')
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

// Add an endpoint to mark a check-in as Now Serving
app.put('/checkins/:id/now-serving', async (req, res) => {
  try {
    await pool.query(
      `UPDATE checkins SET status = 'Now Serving' WHERE id = $1`,
      [req.params.id]
    );
    console.log(`✅ Check-in ID ${req.params.id} marked as Now Serving`);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating check-in to Now Serving:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark check-in as served
app.put('/checkins/:id', async (req, res) => {
  try {
    await pool.query(
      `UPDATE checkins SET status = 'Served' WHERE id = $1`,
      [req.params.id]
    );
    console.log(`✅ Check-in ID ${req.params.id} marked as Served`);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating check-in to Served:', err);
    res.status(500).json({ error: err.message });
  }
});

// REMOVE STATIC SLOT-BASED AVAILABILITY ENDPOINT
// (deprecated due to concern over appointment-like system)

// Get all services (for admin view)
app.get('/admin/services', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, price, duration FROM services ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin services:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a service (admin edit)
app.put('/admin/services/:id', async (req, res) => {
  const { price, duration } = req.body;
  if (isNaN(price) || isNaN(duration) || price < 0 || duration <= 0) {
    return res.status(400).json({ error: 'Invalid price or duration' });
  }
  try {
    await pool.query(
      `UPDATE services SET price = $1, duration = $2 WHERE id = $3`,
      [price, duration, req.params.id]
    );
    console.log(`🔧 Updated service ID ${req.params.id} → Price: $${price}, Duration: ${duration}min`);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
