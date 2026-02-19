import type { Router } from 'express';
import { getRouter } from '../server/mediasoup-server';

export function registerRtpCapabilitiesRoute(app: Router): void {
  app.get('/rtp-capabilities', (req, res) => {
    try {
      console.log('[RTP-CAPABILITIES] Getting RTP capabilities');
      const router = getRouter();
      console.log('[RTP-CAPABILITIES] ✓ RTP capabilities retrieved successfully');
      res.json(router.rtpCapabilities);
    } catch (error) {
      console.error('[RTP-CAPABILITIES] ✗ Error getting RTP capabilities:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
