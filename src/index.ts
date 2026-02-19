import express from 'express';
import cors from 'cors';
import { initMediasoup, closeMediasoup } from './server/mediasoup-server';
import { registerRtpCapabilitiesRoute } from './routes/rtp-capabilities.route';
import { registerTransportRoutes } from './routes/transport.route';
import { registerProducerRoutes } from './routes/producer.route';
import { registerConsumerRoutes } from './routes/consumer.route';

const PORT = 3001;
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
      console.log(`SFU server started at http://localhost:${PORT}`);
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
