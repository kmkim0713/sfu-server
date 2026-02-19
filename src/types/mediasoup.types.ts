import type { RtpCapabilities, IceCandidate, DtlsParameters } from 'mediasoup/node/lib/types';

export interface TransportInfo {
  id: string;
  iceParameters: unknown;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface ConsumerInfo {
  id: string;
  producerId: string;
  kind: 'audio' | 'video';
  rtpParameters: unknown;
}

export interface MediaCodecConfig {
  kind: 'audio' | 'video';
  mimeType: string;
  clockRate: number;
  channels?: number;
  parameters?: Record<string, unknown>;
  [key: string]: unknown;
}

export type RtpCapabilitiesType = RtpCapabilities;
