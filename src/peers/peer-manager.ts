import type { PeerId, PeerData, ProducerInfo } from '../types/peer.types';

const peers = new Map<PeerId, PeerData>();

export function createPeer(peerId: PeerId): void {
  if (!peers.has(peerId)) {
    console.log(`[PEER-MGR] Creating new peer - peerId: ${peerId}`);
    peers.set(peerId, {
      peerId,
      transports: [],
      producers: [],
    });
    console.log(`[PEER-MGR] ✓ Peer created - total peers: ${peers.size}`);
  } else {
    console.log(`[PEER-MGR] Peer already exists - peerId: ${peerId}`);
  }
}

export function getPeer(peerId: PeerId): PeerData | undefined {
  const peer = peers.get(peerId);
  console.log(`[PEER-MGR] getPeer called - peerId: ${peerId}, exists: ${peer !== undefined}`);
  return peer;
}

export function getPeerOrThrow(peerId: PeerId): PeerData {
  const peer = peers.get(peerId);
  if (!peer) {
    console.error(`[PEER-MGR] ✗ Peer not found: ${peerId}`);
    throw new Error(`Peer not found: ${peerId}`);
  }
  return peer;
}

export function deletePeer(peerId: PeerId): void {
  console.log(`[PEER-MGR] Deleting peer - peerId: ${peerId}`);
  peers.delete(peerId);
  console.log(`[PEER-MGR] ✓ Peer deleted - remaining peers: ${peers.size}`);
}

export function getAllPeers(): Map<PeerId, PeerData> {
  console.log(`[PEER-MGR] getAllPeers called - total peers: ${peers.size}`);
  return new Map(peers);
}

export function getPeerProducers(peerId: PeerId): ProducerInfo[] {
  console.log(`[PEER-MGR] getPeerProducers called - peerId: ${peerId}`);
  const peer = getPeer(peerId);
  if (!peer) {
    console.log(`[PEER-MGR] Peer not found, returning empty producers`);
    return [];
  }
  const producers = peer.producers.map((producer) => ({
    id: producer.id,
    kind: producer.kind,
  }));
  console.log(`[PEER-MGR] ✓ Retrieved ${producers.length} producers for peer: ${peerId}`);
  return producers;
}

export async function cleanupPeer(peerId: PeerId): Promise<void> {
  console.log(`[PEER-MGR] Cleaning up peer - peerId: ${peerId}`);
  const peer = getPeer(peerId);
  if (!peer) {
    console.log(`[PEER-MGR] Peer not found during cleanup`);
    return;
  }

  // Close all producers
  console.log(`[PEER-MGR] Closing ${peer.producers.length} producers...`);
  const producersToClose = [...peer.producers];
  for (const producer of producersToClose) {
    try {
      console.log(`[PEER-MGR] Closing producer - producerId: ${producer.id}`);
      await producer.close();
      console.log(`[PEER-MGR] ✓ Producer closed - producerId: ${producer.id}`);
    } catch (error) {
      console.error(`[PEER-MGR] ✗ Error closing producer ${producer.id}:`, error);
    }
  }

  // Close all transports
  console.log(`[PEER-MGR] Closing ${peer.transports.length} transports...`);
  const transportsToClose = [...peer.transports];
  for (const transport of transportsToClose) {
    try {
      console.log(`[PEER-MGR] Closing transport - transportId: ${transport.id}`);
      await transport.close();
      console.log(`[PEER-MGR] ✓ Transport closed - transportId: ${transport.id}`);
    } catch (error) {
      console.error(`[PEER-MGR] ✗ Error closing transport ${transport.id}:`, error);
    }
  }

  // Remove peer
  deletePeer(peerId);
  console.log(`[PEER-MGR] ✓ Peer cleanup completed - peerId: ${peerId}`);
}
