# PlayZone

PlayZone is a real-time multiplayer mini-games platform built with React, Vite, TypeScript, Socket.IO, and Express.

Players can create or join rooms, ready up in a shared lobby, switch between games, and play live sessions over the network.

## What's Included

- Real-time room creation and joining
- Host controls for game selection, starting matches, and kicking players
- Shared lobby flow with ready-state tracking
- Server-authoritative game state updates
- Supported games:
  - Tic Tac Toe
  - Snakes and Ladders
  - Ludo
  - Snake
  - Chess

## Tech Stack

- Frontend: React, Vite, TypeScript, Framer Motion, Tailwind CSS
- Backend: Express, Socket.IO
- Game logic: custom engines in `src/games`
- Shared contracts: room, event, and validation types in `src/shared`

## Getting Started

### Prerequisites

- Node.js 22 or newer is recommended
- npm

### Install

```bash
npm install
```

### Local development (recommended)

Run the server and client in two terminals:

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev
```

Then open `http://localhost:5173`.

### Run the client

```bash
npm run dev
```

This starts the Vite app in development mode.

### Run the Socket.IO server

```bash
npm run dev:server
```

The server listens on port `3001` by default. Set `PORT` to override it.

## Configuration

### Environment variables

- Server:
  - `PORT` (default: `3001`)
- Client:
  - `VITE_SOCKET_URL` (default: `http://localhost:3001`)

Create a `.env.local` file to point the client at a different server:

```bash
VITE_SOCKET_URL=http://localhost:3001
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

Note: `preview` serves the built frontend only. Run the Socket.IO server separately if you want multiplayer to work.

### Run tests

```bash
npm run test
```

## Project Structure

- `src/client` - React UI and game screens
- `src/server` - Express and Socket.IO server
- `src/games` - game engine implementations
- `src/shared` - shared types, events, and validation helpers

## Runtime Notes

- The server exposes a health check at `/health`
- Rooms and game state are managed in memory, so restarting the server clears active sessions
- The client normalizes room codes before joining
- The client uses WebSocket transport for Socket.IO (no long-polling fallback)

## Development Notes

The codebase is organized around a room/session flow:

1. A host creates a room
2. Players join and mark themselves ready
3. The host selects a game and starts the match
4. The server validates actions and broadcasts updated state to all connected players

For implementation details, see the PRD documents in `docs/`:

- `docs/PlayZone_PRD_v1.0.md`
- `docs/PlayZone_PRD_v2.0.md`

## Troubleshooting

- Client cannot connect: confirm the server is running on `http://localhost:3001` or set `VITE_SOCKET_URL` in `.env.local`
- Port already in use:
  - change `PORT` for the server
  - change `server.port` in `vite.config.ts` for the client
- Corporate VPN/proxy issues: the client forces WebSockets, so make sure WebSocket connections are allowed
