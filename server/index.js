const express = require('express');
const cors = require('cors');
const app = express();
const bloodRoutes = require('./routes/bloodRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/blood', bloodRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));