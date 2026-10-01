const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Helper: Haversine distance in km between two lat/long points
function haversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find matching units for a blood group (with optional geo-distance sorting)
router.get("/match", async (req, res) => {
  const { blood_group, units_needed, hospital_id, sort_by } = req.query;
  try {
    const [rows] = await pool.query("CALL FindMatchingUnits(?, ?)", [
      blood_group,
      units_needed,
    ]);
    let units = rows[0];

    if (hospital_id && units.length > 0) {
      const [[hospital]] = await pool.query(
        "SELECT latitude, longitude FROM Hospital WHERE hospital_id = ?",
        [hospital_id],
      );
      if (hospital) {
        const [banks] = await pool.query(
          `SELECT u.unit_id, b.latitude, b.longitude
           FROM BloodUnit u JOIN BloodBank b ON u.bank_id = b.bank_id
           WHERE u.unit_id IN (${units.map(() => "?").join(",")})`,
          units.map((u) => u.unit_id),
        );
        const bankMap = Object.fromEntries(banks.map((b) => [b.unit_id, b]));

        units = units.map((u) => {
          const bank = bankMap[u.unit_id];
          const distance_km = bank
            ? haversineKm(
                hospital.latitude,
                hospital.longitude,
                bank.latitude,
                bank.longitude,
              )
            : null;
          return {
            ...u,
            distance_km:
              distance_km !== null ? Math.round(distance_km * 10) / 10 : null,
          };
        });

        if (sort_by === "distance") {
          units.sort(
            (a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity),
          );
        }
      }
    }

    res.json(units);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Allot a specific unit to a request
router.post("/allot", async (req, res) => {
  const { request_id, unit_id } = req.body;
  try {
    await pool.query("CALL AllotBloodUnit(?, ?, @p_result)", [
      request_id,
      unit_id,
    ]);
    const [result] = await pool.query("SELECT @p_result AS result");
    res.json({ message: result[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Allotment failed" });
  }
});

// Create a new blood request
router.post("/requests", async (req, res) => {
  const { hospital_id, blood_group, units_needed, urgency } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO BloodRequest (hospital_id, blood_group, units_needed, urgency)
       VALUES (?, ?, ?, ?)`,
      [hospital_id, blood_group, units_needed, urgency || "normal"],
    );
    res.json({ message: "Request created", request_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create request" });
  }
});

// List all requests
router.get("/requests", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.request_id, r.hospital_id, r.blood_group, r.units_needed, r.urgency, r.status, r.request_time,
              h.name AS hospital_name
       FROM BloodRequest r
       JOIN Hospital h ON r.hospital_id = h.hospital_id
       ORDER BY r.request_time DESC`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// --- ADMIN: Donors ---
router.get("/donors", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Donor ORDER BY donor_id DESC",
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch donors" });
  }
});

router.post("/donors", async (req, res) => {
  const { name, blood_group, phone, latitude, longitude } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Donor (name, blood_group, phone, latitude, longitude, last_donated)
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [name, blood_group, phone, latitude || null, longitude || null],
    );
    res.json({ message: "Donor added", donor_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add donor" });
  }
});

// --- ADMIN: Blood Units (Inventory) ---
router.get("/units", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.unit_id, u.blood_group, u.status, u.collected_date, u.expiry_date,
              d.name AS donor_name, b.name AS bank_name
       FROM BloodUnit u
       JOIN Donor d ON u.donor_id = d.donor_id
       JOIN BloodBank b ON u.bank_id = b.bank_id
       ORDER BY u.expiry_date ASC`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch units" });
  }
});

router.post("/units", async (req, res) => {
  const { donor_id, bank_id, blood_group, shelf_life_days } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO BloodUnit (donor_id, bank_id, blood_group, collected_date, expiry_date, status)
       VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'available')`,
      [donor_id, bank_id, blood_group, shelf_life_days || 42],
    );
    res.json({ message: "Unit added", unit_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add unit" });
  }
});

// --- ADMIN: Banks & Hospitals (for dropdowns) ---
router.get("/banks", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM BloodBank");
  res.json(rows);
});

router.get("/hospitals", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM Hospital");
  res.json(rows);
});

module.exports = router;
