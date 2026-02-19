import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initMediasoup, closeMediasoup } from './server/mediasoup-server';
import { registerRtpCapabilitiesRoute } from './routes/rtp-capabilities.route';
import { registerTransportRoutes } from './routes/transport.route';
import { registerProducerRoutes } from './routes/producer.route';
import { registerConsumerRoutes } from './routes/consumer.route';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nodeEnv = process.env.NODE_ENV || 'local';
const envFile = path.resolve(__dirname, `../.env.${nodeEnv}`);
dotenv.config({ path: envFile });

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const SIGNALING_SERVER_URL = process.env.SIGNALING_SERVER_URL || 'ws://localhost:3000';
const TURN_SERVER_URL = process.env.TURN_SERVER_URL || 'turn:localhost:3478';
const TURN_USERNAME = process.env.TURN_USERNAME || 'user';
const TURN_PASSWORD = process.env.TURN_PASSWORD || 'password';
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
registerRtpCapabilitiesRoute(app);
registerTransportRoutes(app);
registerProducerRoutes(app);
registerConsumerRoutes(app);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start(): Promise<void> {
  try {
    // Initialize mediasoup
    await initMediasoup();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`SFU server started at http://localhost:${PORT} [${nodeEnv.toUpperCase()}]`);
      console.log(`Signaling Server: ${SIGNALING_SERVER_URL}`);
      console.log(`TURN Server: ${TURN_SERVER_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await closeMediasoup();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await closeMediasoup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await closeMediasoup();
  process.exit(0);
});

// Start the server
start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
