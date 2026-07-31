require('dotenv').config();

const express = require('express');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

// Register all event listeners
require('./listeners/index');

const emergencyRoutes = require('./routes/emergencyRoutes');
const responderRoutes = require('./routes/responderRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ResQ API' }));

// API routes
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/responders', responderRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, error: { message: 'Route not found' } }));

// Centralized error handler
app.use(errorHandler);

module.exports = app;
