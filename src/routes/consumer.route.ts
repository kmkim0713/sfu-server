import type { Router } from 'express';
import { createConsumer } from '../consumers/consumer-manager';
import type { ConsumeRequest } from '../types/api.types';

export function registerConsumerRoutes(app: Router): void {
  app.post('/consume', async (req, res) => {
    try {
      const { peerId, transportId, producerId, kind } = req.body as ConsumeRequest;

      if (!peerId || !transportId || !producerId || !kind) {
        console.warn('[CONSUMER] ✗ peerId, transportId, producerId, and kind are required');
        res.status(400).json({ error: 'peerId, transportId, producerId, and kind are required' });
        return;
      }

      console.log(`[CONSUMER] Creating consumer - Peer: ${peerId}, Transport: ${transportId}, Producer: ${producerId}, Kind: ${kind}`);
      const consumer = await createConsumer(peerId, transportId, producerId, kind);
      console.log(`[CONSUMER] ✓ Consumer created: ${consumer.id}`);
      res.json(consumer);
    } catch (error) {
      console.error('[CONSUMER] ✗ Error creating consumer:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
