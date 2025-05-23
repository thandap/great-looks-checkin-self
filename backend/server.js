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
  
  
  const { name, phone, service, stylist,time } = req.body;
  console.log('New check-in:', { name, phone, service, stylist,time });
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
WHERE status in('Waiting','Now Serving'
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

// Get available time slots for a given stylist
app.get('/availability/:stylist', async (req, res) => {
  const { stylist } = req.params;
  const slotInterval = 15; // in minutes
  const openHour = 9;  
  const closeHour = 18;

  try {
    // Step 1: Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Step 2: Fetch all check-ins for that stylist today
    const result = await pool.query(
      `SELECT time FROM checkins 
       WHERE stylist = $1 
         AND created_at >= $2 AND time < $3
         AND status = 'Waiting'`,
      [stylist, today.toISOString(), tomorrow.toISOString()]
    );

    const bookedTimes = result.rows.map(row => new Date(row.time).toISOString());

    // Step 3: Generate all possible slots
    const available = [];
    const now = new Date();
    const start = new Date();
    start.setHours(openHour, 0, 0, 0);
    const end = new Date();
    end.setHours(closeHour, 0, 0, 0);

    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + slotInterval)) {
      const iso = new Date(time).toISOString();
      if (!bookedTimes.includes(iso) && time > now) {
        available.push(iso);
      }
    }

    res.json(available);
  } catch (err) {
    console.error('Error getting availability:', err);
    res.status(500).json({ error: err.message });
  }
});
// Get available times for a stylist
app.get('/availability', async (req, res) => {
  const stylist = req.query.stylist;

  if (!stylist) {
    return res.status(400).json({ error: 'Stylist is required' });
  }

  try {
    const allSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
      "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
      "04:30 PM", "05:00 PM", "05:30 PM"
    ];
     const result = await pool.query(
      `SELECT preferred_time FROM checkins WHERE stylist = $1 AND status = 'Waiting'`,
      [stylist]
    );
    const bookedTimes = result.rows.map(r => r.preferred_time);

    const availableTimes = allSlots.filter(slot => !bookedTimes.includes(slot));
    
        res.json(availableTimes);
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
