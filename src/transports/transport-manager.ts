import type { WebRtcTransport, DtlsParameters } from 'mediasoup/node/lib/types';
import { getRouter } from '../server/mediasoup-server';
import { getPeerOrThrow, createPeer } from '../peers/peer-manager';
import type { TransportInfo } from '../types/mediasoup.types';
import type { PeerId } from '../types/peer.types';

export async function createWebRtcTransport(peerId: PeerId): Promise<TransportInfo> {
  console.log(`[TRANSPORT-MGR] createWebRtcTransport called - peerId: ${peerId}`);

  // Ensure peer exists
  createPeer(peerId);
  const peer = getPeerOrThrow(peerId);
  console.log(`[TRANSPORT-MGR] Peer ensured/created - peerId: ${peerId}`);

  const router = getRouter();
  console.log(`[TRANSPORT-MGR] Creating WebRTC transport...`);
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
  console.log(`[TRANSPORT-MGR] ✓ WebRTC transport created and stored - transportId: ${transport.id}, total transports for peer: ${peer.transports.length}`);

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
  console.log(`[TRANSPORT-MGR] connectTransport called - peerId: ${peerId}, transportId: ${transportId}`);

  const peer = getPeerOrThrow(peerId);
  const transport = peer.transports.find((t) => t.id === transportId);

  if (!transport) {
    console.error(`[TRANSPORT-MGR] ✗ Transport not found: ${transportId}`);
    throw new Error(`Transport not found: ${transportId}`);
  }

  console.log(`[TRANSPORT-MGR] Connecting transport with DTLS parameters...`);
  await transport.connect({ dtlsParameters });
  console.log(`[TRANSPORT-MGR] ✓ Transport connected successfully`);
}

export function getTransport(peerId: PeerId, transportId: string): WebRtcTransport | undefined {
  console.log(`[TRANSPORT-MGR] getTransport called - peerId: ${peerId}, transportId: ${transportId}`);
  const peer = getPeerOrThrow(peerId);
  return peer.transports.find((t) => t.id === transportId);
}

export function getTransportOrThrow(peerId: PeerId, transportId: string): WebRtcTransport {
  const transport = getTransport(peerId, transportId);
  if (!transport) {
    console.error(`[TRANSPORT-MGR] ✗ Transport not found: ${transportId}`);
    throw new Error(`Transport not found: ${transportId}`);
  }
  return transport;
}
