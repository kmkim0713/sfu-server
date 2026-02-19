import type { MediaKind, RtpParameters } from 'mediasoup/node/lib/types';
import { getPeerOrThrow } from '../peers/peer-manager';
import { getTransportOrThrow } from '../transports/transport-manager';
import type { PeerId } from '../types/peer.types';

export async function createProducer(
  peerId: PeerId,
  transportId: string,
  kind: MediaKind,
  rtpParameters: RtpParameters
): Promise<string> {
  console.log(`[PRODUCER-MGR] createProducer called - peerId: ${peerId}, transportId: ${transportId}, kind: ${kind}`);

  const transport = getTransportOrThrow(peerId, transportId);
  const peer = getPeerOrThrow(peerId);

  console.log(`[PRODUCER-MGR] Producing media on transport - kind: ${kind}`);
  const producer = await transport.produce({
    kind,
    rtpParameters,
  });

  peer.producers.push(producer);
  console.log(`[PRODUCER-MGR] ✓ Producer created and stored - producerId: ${producer.id}, total producers for peer: ${peer.producers.length}`);

  return producer.id;
}

export function getPeersProducers(peerId: PeerId): Array<{ id: string; kind: MediaKind }> {
  console.log(`[PRODUCER-MGR] getPeersProducers called - peerId: ${peerId}`);
  const peer = getPeerOrThrow(peerId);
  const result = peer.producers.map((p) => ({
    id: p.id,
    kind: p.kind,
  }));
  console.log(`[PRODUCER-MGR] ✓ Retrieved ${result.length} producers for peer: ${peerId}`);
  return result;
}
