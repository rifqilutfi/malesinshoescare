const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const orderRoutes = require('./routes/order.routes');
const trackingRoutes = require('./routes/tracking.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// ── Global Middleware ──────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Swagger UI ─────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CleanStride API Docs',
}));

// ── Routes ─────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/orders', orderRoutes);
app.use('/track', trackingRoutes);
app.use('/ai', aiRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'CleanStride API' });
});

// ── Error Handler (must be last) ───────────────
app.use(errorHandler);

module.exports = app;
