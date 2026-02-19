import type { Router } from 'express';
import { getRouter } from '../server/mediasoup-server';

export function registerRtpCapabilitiesRoute(app: Router): void {
  app.get('/rtp-capabilities', (req, res) => {
    try {
      const router = getRouter();
      res.json(router.rtpCapabilities);
    } catch (error) {
      console.error('Error getting RTP capabilities:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
