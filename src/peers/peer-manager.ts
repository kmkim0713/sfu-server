import type { PeerId, PeerData, ProducerInfo } from '../types/peer.types';

const peers = new Map<PeerId, PeerData>();

export function createPeer(peerId: PeerId): void {
  if (!peers.has(peerId)) {
    peers.set(peerId, {
      peerId,
      transports: [],
      producers: [],
    });
  }
}

export function getPeer(peerId: PeerId): PeerData | undefined {
  return peers.get(peerId);
}

export function getPeerOrThrow(peerId: PeerId): PeerData {
  const peer = peers.get(peerId);
  if (!peer) {
    throw new Error(`Peer not found: ${peerId}`);
  }
  return peer;
}

export function deletePeer(peerId: PeerId): void {
  peers.delete(peerId);
}

export function getAllPeers(): Map<PeerId, PeerData> {
  return new Map(peers);
}

export function getPeerProducers(peerId: PeerId): ProducerInfo[] {
  const peer = getPeer(peerId);
  if (!peer) {
    return [];
  }
  return peer.producers.map((producer) => ({
    id: producer.id,
    kind: producer.kind,
  }));
}

export async function cleanupPeer(peerId: PeerId): Promise<void> {
  const peer = getPeer(peerId);
  if (!peer) {
    return;
  }

  // Close all producers
  const producersToClose = [...peer.producers];
  for (const producer of producersToClose) {
    try {
      await producer.close();
    } catch (error) {
      console.error(`Error closing producer ${producer.id}:`, error);
    }
  }

  // Close all transports
  const transportsToClose = [...peer.transports];
  for (const transport of transportsToClose) {
    try {
      await transport.close();
    } catch (error) {
      console.error(`Error closing transport ${transport.id}:`, error);
    }
  }

  // Remove peer
  deletePeer(peerId);
}
