const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Find matching units for a blood group
router.get('/match', async (req, res) => {
  const { blood_group, units_needed } = req.query;
  try {
    const [rows] = await pool.query(
      'CALL FindMatchingUnits(?, ?)',
      [blood_group, units_needed]
    );
    res.json(rows[0]); // stored proc results come back as rows[0]
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Allot a specific unit to a request
router.post('/allot', async (req, res) => {
  const { request_id, unit_id } = req.body;
  try {
    await pool.query('CALL AllotBloodUnit(?, ?, @p_result)', [request_id, unit_id]);
    const [result] = await pool.query('SELECT @p_result AS result');
    res.json({ message: result[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Allotment failed' });
  }
});

// Create a new blood request (hospital raises an emergency request)
router.post('/requests', async (req, res) => {
  const { hospital_id, blood_group, units_needed, urgency } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO BloodRequest (hospital_id, blood_group, units_needed, urgency)
       VALUES (?, ?, ?, ?)`,
      [hospital_id, blood_group, units_needed, urgency || 'normal']
    );
    res.json({ message: 'Request created', request_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// List all pending requests (for a dashboard view)
router.get('/requests', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.request_id, r.blood_group, r.units_needed, r.urgency, r.status, r.request_time,
              h.name AS hospital_name
       FROM BloodRequest r
       JOIN Hospital h ON r.hospital_id = h.hospital_id
       ORDER BY r.request_time DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

module.exports = router;