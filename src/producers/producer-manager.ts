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
  const transport = getTransportOrThrow(peerId, transportId);
  const peer = getPeerOrThrow(peerId);

  const producer = await transport.produce({
    kind,
    rtpParameters,
  });

  peer.producers.push(producer);

  return producer.id;
}

export function getPeersProducers(peerId: PeerId): Array<{ id: string; kind: MediaKind }> {
  const peer = getPeerOrThrow(peerId);
  return peer.producers.map((p) => ({
    id: p.id,
    kind: p.kind,
  }));
}
