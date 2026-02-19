import type { WebRtcTransport, DtlsParameters } from 'mediasoup/node/lib/types';
import { getRouter } from '../server/mediasoup-server';
import { getPeerOrThrow, createPeer } from '../peers/peer-manager';
import type { TransportInfo } from '../types/mediasoup.types';
import type { PeerId } from '../types/peer.types';

export async function createWebRtcTransport(peerId: PeerId): Promise<TransportInfo> {
  // Ensure peer exists
  createPeer(peerId);
  const peer = getPeerOrThrow(peerId);

  const router = getRouter();
  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: '0.0.0.0',
        announcedIp: '127.0.0.1', // Replace with actual public IP in production
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });

  peer.transports.push(transport);

  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  };
}

export async function connectTransport(
  peerId: PeerId,
  transportId: string,
  dtlsParameters: DtlsParameters
): Promise<void> {
  const peer = getPeerOrThrow(peerId);
  const transport = peer.transports.find((t) => t.id === transportId);

  if (!transport) {
    throw new Error(`Transport not found: ${transportId}`);
  }

  await transport.connect({ dtlsParameters });
}

export function getTransport(peerId: PeerId, transportId: string): WebRtcTransport | undefined {
  const peer = getPeerOrThrow(peerId);
  return peer.transports.find((t) => t.id === transportId);
}

export function getTransportOrThrow(peerId: PeerId, transportId: string): WebRtcTransport {
  const transport = getTransport(peerId, transportId);
  if (!transport) {
    throw new Error(`Transport not found: ${transportId}`);
  }
  return transport;
}
