import type { Router } from 'express';
import { createProducer, getPeersProducers } from '../producers/producer-manager';
import { getPeerProducers } from '../peers/peer-manager';
import type { ProduceRequest, GetPeerProducersQuery } from '../types/api.types';

export function registerProducerRoutes(app: Router): void {
  app.post('/produce', async (req, res) => {
    try {
      const { peerId, transportId, kind, rtpParameters } = req.body as ProduceRequest;

      if (!peerId || !transportId || !kind || !rtpParameters) {
        console.warn('[PRODUCER] ✗ peerId, transportId, kind, and rtpParameters are required');
        res.status(400).json({ error: 'peerId, transportId, kind, and rtpParameters are required' });
        return;
      }

      console.log(`[PRODUCER] Creating producer - Peer: ${peerId}, Transport: ${transportId}, Kind: ${kind}`);
      const producerId = await createProducer(peerId, transportId, kind, rtpParameters);
      console.log(`[PRODUCER] ✓ Producer created: ${producerId}`);
      res.json({ id: producerId });
    } catch (error) {
      console.error('[PRODUCER] ✗ Error creating producer:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/peer-producers', (req, res) => {
    try {
      const peerId = req.query.peerId as string | undefined;

      if (!peerId) {
        console.warn('[PRODUCER] ✗ peerId is required');
        res.status(400).json({ error: 'peerId is required' });
        return;
      }

      console.log(`[PRODUCER] Getting producers for peer: ${peerId}`);
      const producers = getPeerProducers(peerId);
      console.log(`[PRODUCER] ✓ Found ${producers.length} producers for peer: ${peerId}`);

      res.json({
        peerId,
        producers,
      });
    } catch (error) {
      console.error('[PRODUCER] ✗ Error getting peer producers:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
