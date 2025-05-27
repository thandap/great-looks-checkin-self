const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Admin token validation middleware
function verifyAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  next();
}

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
  const { name, phone, service, stylist, time, notes, email, checkInMethod } = req.body;
  console.log('New check-in:', { name, phone, service, stylist, time, checkInMethod });

  try {
    const result = await pool.query(
      `INSERT INTO checkins (name, phone, service, stylist, preferred_time, notes, checkin_method) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, phone, service, stylist, time, notes, checkInMethod]
    );
    const checkin = result.rows[0];

    if (email) {
      const msg = {
        to: email,
        from: 'thandap@gmail.com',
        subject: 'Your Great Looks Check-In Confirmation',
        text: `Hi ${name},\n\nYou've successfully checked in at Great Looks.\n\nStylist: ${stylist}\nServices: ${service}\n\nWe’ll notify you when you're next.\n\nThanks for choosing us!`
      };
      try {
        await sgMail.send(msg);
        console.log(`📧 Confirmation email sent to ${email}`);
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr);
      }
    }

    res.json(checkin);
  } catch (err) {
    console.error('Error inserting check-in:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save stylist note (admin required for admin notes)
app.post('/checkins/:id/stylist-notes', async (req, res) => {
  const checkinId = req.params.id;
  const { notes, note_type = 'stylist', created_by = 'unknown' } = req.body;

  if (note_type === 'admin') {
    const token = req.headers['x-admin-token'];
    if (token !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO stylist_notes (checkin_id, note_type, note_text, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [checkinId, note_type, notes, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving stylist note:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get stylist notes
app.get('/stylist-notes/:phone/:stylist', async (req, res) => {
  const { phone, stylist } = req.params;

  try {
    const result = await pool.query(
      `SELECT sn.note_text, sn.note_type, sn.created_at
       FROM stylist_notes sn
       JOIN checkins c ON sn.checkin_id = c.id
       WHERE c.phone = $1 AND c.stylist = $2 AND sn.note_type = 'stylist'
       ORDER BY sn.created_at DESC`,
      [phone, stylist]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stylist notes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get waiting check-ins
app.get('/checkins', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, stylist, service, status, created_at, phone, notes, checkin_method
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
      `SELECT id, name, price, duration FROM services WHERE is_active = true ORDER BY name`
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

// Get all services (for admin view)
app.get('/admin/services', verifyAdmin, async (req, res) => {
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
app.put('/admin/services/:id', verifyAdmin, async (req, res) => {
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
// Create a new service (admin add)
app.post('/admin/services', verifyAdmin, async (req, res) => {
  const { name, price, duration } = req.body;
  if (!name || isNaN(price) || isNaN(duration)) {
    return res.status(400).json({ error: 'Invalid name, price, or duration' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO services (name, price, duration, is_active)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [name, price, duration]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding service:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const totalCheckinsRes = await pool.query(`SELECT COUNT(*) FROM checkins WHERE DATE(created_at) = CURRENT_DATE`);
    const onlineCheckinsRes = await pool.query(`SELECT COUNT(*) FROM checkins WHERE checkin_method = 'online' AND DATE(created_at) = CURRENT_DATE`);
    const walkinCheckinsRes = await pool.query(`SELECT COUNT(*) FROM checkins WHERE (checkin_method IS NULL OR checkin_method != 'online') AND DATE(created_at) = CURRENT_DATE`);

    const topServicesRes = await pool.query(`
      SELECT service, COUNT(*) as count
      FROM checkins
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY service
      ORDER BY count DESC
      LIMIT 5
    `);

    const topStylistsRes = await pool.query(`
      SELECT stylist, COUNT(*) as count
      FROM checkins
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY stylist
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      totalCheckins: Number(totalCheckinsRes.rows[0].count),
      onlineCheckins: Number(onlineCheckinsRes.rows[0].count),
      walkinCheckins: Number(walkinCheckinsRes.rows[0].count),
      topServices: topServicesRes.rows,
      topStylists: topStylistsRes.rows
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: err.message });
  }
});
app.put('/checkins/:id/cancel', (req, res) => {
  const { id } = req.params;
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  pool.query(`UPDATE checkins SET status = 'Canceled' WHERE id = $1`, [id])
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error('Error cancelling check-in:', err);
      res.status(500).json({ error: err.message });
    });
});
// Inventory Routes
app.get('/admin/inventory', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, stock, cost, price, barcode, is_active, created_at
      FROM inventory
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/admin/inventory', verifyAdmin, async (req, res) => {
  const { name, stock, cost, price,barcode } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO inventory (name, stock, cost, price,barcode) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, stock || 0, cost || 0, price || 0, barcode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding inventory item:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/admin/inventory/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, stock, cost, price, barcode, is_active } = req.body;
  try {
    await pool.query(
      `UPDATE inventory SET name = $1, stock = $2, cost = $3, price = $4, barcode = $5, is_active = $6 WHERE id = $7`,
      [name, stock, cost, price, barcode, is_active, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/admin/inventory/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM inventory WHERE id = $1`, [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/barcode/:upc', verifyAdmin, async (req, res) => {
  const upc = req.params.upc;

  try {
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`, {
      headers: { Accept: 'application/json' }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Server-side barcode fetch failed:', err);
    res.status(500).json({ error: 'Barcode lookup failed' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
