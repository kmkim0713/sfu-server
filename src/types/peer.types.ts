import type { WebRtcTransport, Producer } from 'mediasoup/node/lib/types';

export type PeerId = string;

export interface PeerData {
  peerId: PeerId;
  transports: WebRtcTransport[];
  producers: Producer[];
}

export interface ProducerInfo {
  id: string;
  kind: 'audio' | 'video';
}
