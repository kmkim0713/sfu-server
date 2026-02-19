import type { Router } from 'express';
import { createConsumer } from '../consumers/consumer-manager';
import type { ConsumeRequest } from '../types/api.types';

export function registerConsumerRoutes(app: Router): void {
  app.post('/consume', async (req, res) => {
    try {
      const { peerId, transportId, producerId, kind } = req.body as ConsumeRequest;

      if (!peerId || !transportId || !producerId || !kind) {
        res.status(400).json({ error: 'peerId, transportId, producerId, and kind are required' });
        return;
      }

      const consumer = await createConsumer(peerId, transportId, producerId, kind);
      res.json(consumer);
    } catch (error) {
      console.error('Error creating consumer:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
