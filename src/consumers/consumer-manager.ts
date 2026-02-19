import type { MediaKind } from 'mediasoup/node/lib/types';
import { getRouter } from '../server/mediasoup-server';
import { getTransportOrThrow } from '../transports/transport-manager';
import type { PeerId } from '../types/peer.types';
import type { ConsumerInfo } from '../types/mediasoup.types';

export async function createConsumer(
  peerId: PeerId,
  transportId: string,
  producerId: string,
  kind: MediaKind
): Promise<ConsumerInfo> {
  console.log(`[CONSUMER-MGR] createConsumer called - peerId: ${peerId}, transportId: ${transportId}, producerId: ${producerId}, kind: ${kind}`);

  const transport = getTransportOrThrow(peerId, transportId);
  const router = getRouter();

  console.log(`[CONSUMER-MGR] Consuming producer on transport - producerId: ${producerId}`);
  const consumer = await transport.consume({
    producerId,
    rtpCapabilities: router.rtpCapabilities,
    paused: false,
  });

  console.log(`[CONSUMER-MGR] ✓ Consumer created - consumerId: ${consumer.id}, producerId: ${consumer.producerId}`);

  return {
    id: consumer.id,
    producerId: consumer.producerId,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
  };
}
