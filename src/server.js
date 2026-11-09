require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI
  || 'mongodb://127.0.0.1:27017/express_mongoose_starter';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

async function startServer() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start the server:', error);
  process.exitCode = 1;
});
