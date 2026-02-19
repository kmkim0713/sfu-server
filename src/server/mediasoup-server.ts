import * as mediasoup from 'mediasoup';
import type { Worker, Router } from 'mediasoup/node/lib/types';
import type { MediaCodecConfig } from '../types/mediasoup.types';

let worker: Worker | null = null;
let router: Router | null = null;

const mediaCodecs: MediaCodecConfig[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {},
  },
];

export async function initMediasoup(): Promise<void> {
  if (worker && router) {
    console.log('[MEDIASOUP] Mediasoup already initialized');
    return;
  }

  try {
    console.log('[MEDIASOUP] Initializing mediasoup worker...');
    worker = await mediasoup.createWorker({
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp'],
    });
    console.log('[MEDIASOUP] ✓ Worker created successfully');

    // Worker event listeners
    worker.on('died', () => {
      console.error('[MEDIASOUP] ✗ Worker died, exiting in 2 seconds...');
      setTimeout(() => process.exit(1), 2000);
    });

    console.log('[MEDIASOUP] Creating router with media codecs...');
    router = await worker.createRouter({
      mediaCodecs,
    });
    console.log('[MEDIASOUP] ✓ Router created successfully');

    // Router event listeners
    router.on('close', () => {
      console.log('[MEDIASOUP] ℹ Router closed');
    });

    console.log('[MEDIASOUP] ✓ Mediasoup SFU server ready');
  } catch (error) {
    console.error('[MEDIASOUP] ✗ Failed to initialize mediasoup:', error);
    throw error;
  }
}

export function getWorker(): Worker {
  if (!worker) {
    console.error('[MEDIASOUP] ✗ Mediasoup worker not initialized');
    throw new Error('Mediasoup worker not initialized');
  }
  return worker;
}

export function getRouter(): Router {
  if (!router) {
    console.error('[MEDIASOUP] ✗ Mediasoup router not initialized');
    throw new Error('Mediasoup router not initialized');
  }
  return router;
}

export async function closeMediasoup(): Promise<void> {
  if (worker) {
    console.log('[MEDIASOUP] Closing mediasoup worker...');
    worker.close();
    worker = null;
    router = null;
    console.log('[MEDIASOUP] ✓ Mediasoup closed');
  } else {
    console.log('[MEDIASOUP] Mediasoup already closed or not initialized');
  }
}
