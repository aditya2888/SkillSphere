// Initialize Application Insights (must run before other modules)
const { initAppInsights } = require('./src/utils/appInsights');
initAppInsights();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Configure middleware and CORS
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '10mb' }))
// Structured request logging
const { requestLogger, errorLogger } = require('./src/middleware/logger');
app.use(requestLogger);

// Serve uploads locally when Azure Storage is not configured
if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// API routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/skills', require('./src/routes/skillRoutes'));
app.use('/api/courses', require('./src/routes/courseRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/media', require('./src/routes/mediaRoutes'));
app.use('/api/vm', require('./src/routes/vmRoutes'));

// Health-check route
app.get('/', (req, res) => {
  res.send('SkillSphere API is running');
});

// Error logging and handlers
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
app.use(errorLogger);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
