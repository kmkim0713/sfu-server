# Project: SFU (Selective Forwarding Unit) Server

## 1. Project Overview

This project is a WebRTC-based SFU (Selective Forwarding Unit) server.

Responsibilities:

- Receive RTP streams from clients
- Selectively forward media tracks
- Deliver streams based on subscription (subscribe model)
- Manage peer connections and sessions
- Handle track addition and removal
- Adapt to network conditions (e.g., bitrate control)

This server:

- Does NOT perform media encoding/decoding (re-encoding must be avoided whenever possible)
- Is NOT a storage server
- Is NOT a simple signaling server

This is a real-time media server.
Stability, concurrency control, and memory management are critical.

---

## 2. TypeScript Migration Policy

The current project is JavaScript-based.
All new code and modifications must be written in TypeScript.

### Required Compiler Settings

- "strict": true
- "noImplicitAny": true
- "strictNullChecks": true
- "noUncheckedIndexedAccess": true
- ESLint rules for TypeScript must be enforced

### Prohibited Practices

- No usage of `any`
- No implicit `any`
- No excessive use of `@ts-ignore`
- No unnecessary type assertions (`as`)
- No omitted return types

### Mandatory Practices

- All functions must declare explicit return types
- External library types must be clearly defined
- RTP / Transport-related types must be explicitly declared
- EventEmitter events must be type-safe
- All Promise-returning functions must declare explicit types

### Example

Incorrect:

function handle(peer) { ... }

Correct:

function handle(peer: Peer): void { ... }

---

## 3. SFU Server Design Considerations

An SFU is not a simple WebSocket server.
It directly handles RTP streams and must adhere to the following constraints.

### 3.1 Memory Management

- Transports must be closed immediately on peer disconnect
- Producers and Consumers must always be cleaned up
- Orphaned transports are not allowed
- All timers must be cleared
- All event listeners must be removed

Memory leaks are strictly unacceptable.

### 3.2 Concurrency and State Consistency

- Peer state must be managed in a single-responsibility module
- Race conditions must always be considered
- Duplicate producer creation must be prevented
- Concurrent leave + publish scenarios must be handled safely
- Cleanup must be guaranteed in abnormal termination scenarios

### 3.3 Media Handling Constraints

- Re-encoding is prohibited unless explicitly required
- Bitrate control logic must be explicit and deterministic
- Simulcast layer management must be clearly defined
- Consumer pause/resume state must remain consistent
- RTP forwarding failures must be handled explicitly

### 3.4 Performance Principles

- Peer lookup must be O(1) (use Map or equivalent)
- Avoid `await` inside iterative loops when possible
- No blocking synchronous operations
- No deep object cloning
- Minimize unnecessary JSON stringify/parse operations

### 3.5 Network Failure Handling

- Handle ICE failure states
- Handle DTLS termination
- Always listen for transport close events
- Automatically clean up on network disconnection
- Prevent zombie peers

---

## 4. Project Structure Rules

src/
  server/
  peers/
  transports/
  producers/
  consumers/
  rooms/
  types/
  utils/
  tests/

Rules:

- No business logic inside the entry file
- Peer-related logic must exist only inside peers/
- Transport logic must be isolated inside transports/
- Media-related types must be declared in types/
- No monolithic files
- All shared state must be managed through a central manager module

---

## 5. Testing Policy

All new logic must include test code.
No feature may be added without tests.

### Required Test Coverage

- Peer creation and deletion
- Transport creation and termination
- Producer creation and removal
- Consumer subscribe/unsubscribe
- Cleanup verification on disconnect
- Resource cleanup verification during exception scenarios

### Test Types

1. Unit tests (core logic)
2. Integration tests (peer flow)
3. Disconnect scenario tests

### Mandatory Principles

- Avoid excessive mocking
- Prefer realistic flow-based testing
- Always assert cleanup behavior

Examples:

- After `leave`, the peer must not remain in the Map
- After `transport.close()`, event listeners must be removed

---

## 6. Prohibited Practices

- No usage of `any`
- No uncontrolled global mutable state
- No missing EventEmitter listener cleanup
- No silent error swallowing
- No resource closing without proper cleanup
- No feature addition without tests

---

## 7. AI Code Generation Guidelines

AI must strictly adhere to the following:

- Generate code compatible with TypeScript strict mode
- Define all types explicitly
- Include disconnect and exception flows
- Include full resource cleanup logic
- Generate accompanying test code for all new features
- Avoid unnecessary abstraction
- Prioritize stability over premature optimization

If uncertain, always choose the safer and more stable implementation.


## 8. Repository Safety Rule

Claude MUST NOT perform git commits, pushes, rebases, or any repository-modifying VCS operations autonomously.

Specifically:

- Do NOT run `git commit`
- Do NOT run `git push`
- Do NOT run `git rebase`
- Do NOT run `git reset`
- Do NOT create branches
- Do NOT modify git history in any way

Claude may suggest commit messages or version control strategies,  
but must never execute repository write operations.

All commit actions must be explicitly performed by a human developer.


Always review this CLAUDE.md before making changes.