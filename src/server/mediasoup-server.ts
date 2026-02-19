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
    console.log('Mediasoup already initialized');
    return;
  }

  try {
    worker = await mediasoup.createWorker({
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp'],
    });

    router = await worker.createRouter({
      mediaCodecs,
    });

    console.log('Mediasoup SFU server ready');
  } catch (error) {
    console.error('Failed to initialize mediasoup:', error);
    throw error;
  }
}

export function getWorker(): Worker {
  if (!worker) {
    throw new Error('Mediasoup worker not initialized');
  }
  return worker;
}

export function getRouter(): Router {
  if (!router) {
    throw new Error('Mediasoup router not initialized');
  }
  return router;
}

export async function closeMediasoup(): Promise<void> {
  if (worker) {
    worker.close();
    worker = null;
    router = null;
    console.log('Mediasoup closed');
  }
}
