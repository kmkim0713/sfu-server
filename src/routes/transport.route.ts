import type { Router } from 'express';
import { createWebRtcTransport, connectTransport } from '../transports/transport-manager';
import type { CreateWebRtcTransportRequest, ConnectTransportRequest } from '../types/api.types';

export function registerTransportRoutes(app: Router): void {
  app.post('/create-web-rtc-transport', async (req, res) => {
    try {
      const { peerId } = req.body as CreateWebRtcTransportRequest;

      if (!peerId) {
        res.status(400).json({ error: 'peerId is required' });
        return;
      }

      const transport = await createWebRtcTransport(peerId);
      res.json(transport);
    } catch (error) {
      console.error('Error creating transport:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/connect-transport', async (req, res) => {
    try {
      const { peerId, transportId, dtlsParameters } = req.body as ConnectTransportRequest;

      if (!peerId || !transportId || !dtlsParameters) {
        res.status(400).json({ error: 'peerId, transportId, and dtlsParameters are required' });
        return;
      }

      await connectTransport(peerId, transportId, dtlsParameters);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error connecting transport:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
