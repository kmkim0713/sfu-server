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
  const transport = getTransportOrThrow(peerId, transportId);
  const router = getRouter();

  const consumer = await transport.consume({
    producerId,
    rtpCapabilities: router.rtpCapabilities,
    paused: false,
  });

  return {
    id: consumer.id,
    producerId: consumer.producerId,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
  };
}
