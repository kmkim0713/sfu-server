import type { DtlsParameters, RtpParameters, MediaKind } from 'mediasoup/node/lib/types';
import type { TransportInfo, ConsumerInfo } from './mediasoup.types';

// Create WebRTC Transport
export interface CreateWebRtcTransportRequest {
  peerId: string;
}

export interface CreateWebRtcTransportResponse extends TransportInfo {}

// Connect Transport
export interface ConnectTransportRequest {
  peerId: string;
  transportId: string;
  dtlsParameters: DtlsParameters;
}

export interface ConnectTransportResponse {
  ok: boolean;
}

// Produce
export interface ProduceRequest {
  peerId: string;
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
}

export interface ProduceResponse {
  id: string;
}

// Consume
export interface ConsumeRequest {
  peerId: string;
  transportId: string;
  producerId: string;
  kind: MediaKind;
}

export interface ConsumeResponse extends ConsumerInfo {}

// Get Peer Producers
export interface GetPeerProducersQuery {
  peerId: string;
}

export interface GetPeerProducersResponse {
  peerId: string;
  producers: Array<{
    id: string;
    kind: 'audio' | 'video';
  }>;
}

// Error Response
export interface ErrorResponse {
  error: string;
}
