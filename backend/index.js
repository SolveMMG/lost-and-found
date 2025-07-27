require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');

const app = express();

app.use(cors());
app.use(express.json());

// Serve images statically
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'prisma/images')));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});