// Helper: Haversine distance in km between two lat/long points
function haversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find matching units — now with optional geo-distance sorting
router.get('/match', async (req, res) => {
  const { blood_group, units_needed, hospital_id, sort_by } = req.query;
  try {
    const [rows] = await pool.query(
      'CALL FindMatchingUnits(?, ?)',
      [blood_group, units_needed]
    );
    let units = rows[0];

    // If a hospital_id is given, attach distance from each unit's bank to that hospital
    if (hospital_id) {
      const [[hospital]] = await pool.query(
        'SELECT latitude, longitude FROM Hospital WHERE hospital_id = ?',
        [hospital_id]
      );
      if (hospital) {
        const [banks] = await pool.query(
          `SELECT u.unit_id, b.latitude, b.longitude
           FROM BloodUnit u JOIN BloodBank b ON u.bank_id = b.bank_id
           WHERE u.unit_id IN (${units.map(() => '?').join(',') || 'NULL'})`,
          units.map(u => u.unit_id)
        );
        const bankMap = Object.fromEntries(banks.map(b => [b.unit_id, b]));

        units = units.map(u => {
          const bank = bankMap[u.unit_id];
          const distance_km = bank
            ? haversineKm(hospital.latitude, hospital.longitude, bank.latitude, bank.longitude)
            : null;
          return { ...u, distance_km: distance_km !== null ? Math.round(distance_km * 10) / 10 : null };
        });

        // Optional: sort by nearest bank first, instead of pure FIFO
        if (sort_by === 'distance') {
          units.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
        }
      }
    }

    res.json(units);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});