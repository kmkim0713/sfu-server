import type { Router } from 'express';
import { createWebRtcTransport, connectTransport } from '../transports/transport-manager';
import type { CreateWebRtcTransportRequest, ConnectTransportRequest } from '../types/api.types';

export function registerTransportRoutes(app: Router): void {
  app.post('/create-web-rtc-transport', async (req, res) => {
    try {
      const { peerId } = req.body as CreateWebRtcTransportRequest;

      if (!peerId) {
        console.warn('[TRANSPORT] ✗ peerId is required');
        res.status(400).json({ error: 'peerId is required' });
        return;
      }

      console.log(`[TRANSPORT] Creating WebRTC transport for peer: ${peerId}`);
      const transport = await createWebRtcTransport(peerId);
      console.log(`[TRANSPORT] ✓ WebRTC transport created: ${transport.id}`);
      res.json(transport);
    } catch (error) {
      console.error('[TRANSPORT] ✗ Error creating transport:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/connect-transport', async (req, res) => {
    try {
      const { peerId, transportId, dtlsParameters } = req.body as ConnectTransportRequest;

      if (!peerId || !transportId || !dtlsParameters) {
        console.warn('[TRANSPORT] ✗ peerId, transportId, and dtlsParameters are required');
        res.status(400).json({ error: 'peerId, transportId, and dtlsParameters are required' });
        return;
      }

      console.log(`[TRANSPORT] Connecting transport - Peer: ${peerId}, Transport: ${transportId}`);
      await connectTransport(peerId, transportId, dtlsParameters);
      console.log(`[TRANSPORT] ✓ Transport connected successfully`);
      res.json({ ok: true });
    } catch (error) {
      console.error('[TRANSPORT] ✗ Error connecting transport:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
