# SFU Server - WebRTC Selective Forwarding Unit

A TypeScript-based Selective Forwarding Unit (SFU) server for WebRTC multiparty video conferencing. This server receives media streams from clients and selectively forwards them to other participants based on subscription.

## Project Overview

### Responsibilities

- **Receive RTP streams** from clients
- **Selectively forward media tracks** to subscribed participants
- **Manage peer connections** and sessions
- **Handle track addition and removal** dynamically
- **Adapt to network conditions** (bitrate control, etc.)

### What This Server Is NOT

- ❌ Does NOT perform media encoding/decoding (re-encoding is avoided)
- ❌ NOT a storage server
- ❌ NOT a simple signaling server

This is a real-time media server where stability, concurrency control, and memory management are critical.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Express HTTP Server             │
├─────────────────────────────────────────┤
│  Routes                                 │
│  ├── GET  /rtp-capabilities             │
│  ├── POST /create-web-rtc-transport     │
│  ├── POST /connect-transport            │
│  ├── POST /produce                      │
│  ├── POST /consume                      │
│  └── GET  /peer-producers               │
├─────────────────────────────────────────┤
│  Managers (TypeScript Modules)          │
│  ├── PeerManager (Peer state)           │
│  ├── TransportManager (Transport mgmt)  │
│  ├── ProducerManager (Producer mgmt)    │
│  └── ConsumerManager (Consumer mgmt)    │
├─────────────────────────────────────────┤
│  Mediasoup                              │
│  ├── Worker (RTP handling)              │
│  └── Router (Media routing)             │
└─────────────────────────────────────────┘
```

---

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

---

## Installation

```bash
# Install dependencies
npm install

# Install dev dependencies (TypeScript, tsx, etc.)
npm install
```

---

## Running the Server

### Development Mode

Run with hot reload using tsx:

```bash
npm run dev
```

This will start the server in development mode with TypeScript support and auto-reload on file changes.

### Production Mode

Build and run the compiled JavaScript:

```bash
# Compile TypeScript to JavaScript
npm run build

# Run the compiled server
npm start
```

### Type Checking

Verify TypeScript types without building:

```bash
npm run type-check
```

---

## Configuration

### Server Settings

Edit the following values in `src/index.ts`:

- **PORT**: Server port (default: `3001`)

### Mediasoup Settings

Edit the following values in `src/server/mediasoup-server.ts`:

- **rtcMinPort**: Minimum RTC port (default: `40000`)
- **rtcMaxPort**: Maximum RTC port (default: `49999`)
- **announcedIp**: Public IP for ICE candidates (default: `127.0.0.1`)
- **logLevel**: Mediasoup log level (default: `warn`)

---

## API Documentation

### 1. Get RTP Capabilities

**Endpoint:** `GET /rtp-capabilities`

**Response:**
```json
{
  "codecs": [...],
  "rtcpFeedback": [...],
  "extensions": [...]
}
```

---

### 2. Create WebRTC Transport

**Endpoint:** `POST /create-web-rtc-transport`

**Request:**
```json
{
  "peerId": "peer-1"
}
```

**Response:**
```json
{
  "id": "transport-id",
  "iceParameters": {...},
  "iceCandidates": [...],
  "dtlsParameters": {...}
}
```

---

### 3. Connect Transport (DTLS Handshake)

**Endpoint:** `POST /connect-transport`

**Request:**
```json
{
  "peerId": "peer-1",
  "transportId": "transport-id",
  "dtlsParameters": {...}
}
```

**Response:**
```json
{
  "ok": true
}
```

---

### 4. Produce (Send Media)

**Endpoint:** `POST /produce`

**Request:**
```json
{
  "peerId": "peer-1",
  "transportId": "transport-id",
  "kind": "video",
  "rtpParameters": {...}
}
```

**Response:**
```json
{
  "id": "producer-id"
}
```

---

### 5. Consume (Receive Media)

**Endpoint:** `POST /consume`

**Request:**
```json
{
  "peerId": "peer-2",
  "transportId": "transport-id",
  "producerId": "producer-id",
  "kind": "video"
}
```

**Response:**
```json
{
  "id": "consumer-id",
  "producerId": "producer-id",
  "kind": "video",
  "rtpParameters": {...}
}
```

---

### 6. Get Peer Producers

**Endpoint:** `GET /peer-producers?peerId=peer-1`

**Response:**
```json
{
  "peerId": "peer-1",
  "producers": [
    {"id": "producer-1", "kind": "video"},
    {"id": "producer-2", "kind": "audio"}
  ]
}
```

---

## Project Structure

```
src/
├── index.ts                    # Entry point
├── server/
│   └── mediasoup-server.ts    # Mediasoup worker & router initialization
├── peers/
│   └── peer-manager.ts        # Peer state management (Map-based)
├── transports/
│   └── transport-manager.ts   # Transport creation and lifecycle
├── producers/
│   └── producer-manager.ts    # Producer management
├── consumers/
│   └── consumer-manager.ts    # Consumer management
├── routes/
│   ├── rtp-capabilities.route.ts
│   ├── transport.route.ts
│   ├── producer.route.ts
│   └── consumer.route.ts
├── types/
│   ├── peer.types.ts          # Peer data structures
│   ├── mediasoup.types.ts     # Mediasoup-related types
│   └── api.types.ts           # HTTP API request/response types
├── utils/
│   └── logger.ts              # Logging utility
└── tests/                     # Test files (to be implemented)

tsconfig.json                  # TypeScript configuration
package.json                   # Project dependencies and scripts
```

---

## Development Guidelines

### TypeScript Standards

This project follows strict TypeScript standards as defined in `CLAUDE.md`:

- ✅ Strict mode enabled (`"strict": true`)
- ✅ No implicit `any` types
- ✅ Explicit return types for all functions
- ✅ Full null-checking enabled
- ✅ Explicit type definitions for external libraries

### Code Quality

- All functions must declare explicit return types
- EventEmitter events must be type-safe
- No usage of `any` type
- No excessive use of `@ts-ignore`

### Memory Management

- Transports are closed immediately on peer disconnect
- Producers and Consumers are properly cleaned up
- No orphaned resources are left behind
- All event listeners are removed

---

## Testing

### Run Tests (Future Implementation)

```bash
npm test
```

Currently, the test infrastructure is set up but not yet implemented. Tests will be added incrementally for:

- Peer creation and deletion
- Transport creation and termination
- Producer creation and removal
- Consumer subscription and unsubscription
- Resource cleanup on disconnect

---

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, change the PORT variable in `src/index.ts`.

### ICE Connection Failed

Verify the `announcedIp` value in `src/server/mediasoup-server.ts` matches your server's public IP.

### Type Errors

Run type checking to identify issues:

```bash
npm run type-check
```

---

## Performance Considerations

- Peer lookup is O(1) using `Map` data structure
- No blocking synchronous operations
- Minimal JSON serialization/deserialization
- Event-driven architecture for scalability

---

## Known Limitations

- No simulcast support yet
- No bitrate control implementation
- No peer state persistence
- Cleanup on abnormal disconnection needs integration with signaling server

---

## Future Enhancements

- [ ] Simulcast layer management
- [ ] Bitrate adaptation
- [ ] SDP filtering
- [ ] Event-based peer cleanup
- [ ] Comprehensive test suite
- [ ] Metrics and monitoring

---

## License

This project is part of the WEB_RTC multiparty video conferencing service.

---

## Contributing

When contributing, ensure:

1. All code is written in TypeScript
2. Types are explicitly defined (no `any`)
3. Functions have explicit return types
4. Tests are included for new features
5. The code passes `npm run type-check`
