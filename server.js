const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const startedAt = new Date();

app.use(express.static(path.join(__dirname, 'public')));

// Railway health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'test123',
    node: process.version,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || 'local',
    serverTime: new Date().toISOString(),
  });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`test123 listening on port ${PORT}`));
}

module.exports = app;
