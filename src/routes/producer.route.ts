import type { Router } from 'express';
import { createProducer, getPeersProducers } from '../producers/producer-manager';
import { getPeerProducers } from '../peers/peer-manager';
import type { ProduceRequest, GetPeerProducersQuery } from '../types/api.types';

export function registerProducerRoutes(app: Router): void {
  app.post('/produce', async (req, res) => {
    try {
      const { peerId, transportId, kind, rtpParameters } = req.body as ProduceRequest;

      if (!peerId || !transportId || !kind || !rtpParameters) {
        res.status(400).json({ error: 'peerId, transportId, kind, and rtpParameters are required' });
        return;
      }

      const producerId = await createProducer(peerId, transportId, kind, rtpParameters);
      res.json({ id: producerId });
    } catch (error) {
      console.error('Error creating producer:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/peer-producers', (req, res) => {
    try {
      const peerId = req.query.peerId as string | undefined;

      if (!peerId) {
        res.status(400).json({ error: 'peerId is required' });
        return;
      }

      const producers = getPeerProducers(peerId);

      res.json({
        peerId,
        producers,
      });
    } catch (error) {
      console.error('Error getting peer producers:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
