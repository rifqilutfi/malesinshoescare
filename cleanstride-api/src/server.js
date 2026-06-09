const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`CleanStride API running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
