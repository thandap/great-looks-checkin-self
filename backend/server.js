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

// ✅ THIS IS THE FIXED DUMMY POST
app.post('/checkin', async (req, res) => {
  const { name, phone, service, stylist } = req.body;
  console.log('New check-in:', { name, phone, service, stylist });

  // ✅ bypass DB temporarily
  res.json({
    id: Math.floor(Math.random() * 1000),
    name,
    phone,
    service,
    stylist,
    status: 'Waiting'
  });
});

// ✅ DUMMY GET CHECKINS
app.get('/checkins', async (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', phone: '1234567890', service: 'Haircut', stylist: 'Mike', status: 'Waiting' },
    { id: 2, name: 'Jane Smith', phone: '9876543210', service: 'Eyebrow Threading', stylist: 'Anna', status: 'Waiting' }
  ]);
});

// ✅ DUMMY PUT CHECKINS
app.put('/checkins/:id', async (req, res) => {
  console.log(`Marking check-in ID ${req.params.id} as Served`);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
