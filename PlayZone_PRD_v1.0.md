**PlayZone**

Multiplayer Mini-Games Platform

Product Requirements Document  •  v1.0

| Document Status | Draft |
| :---- | :---- |
| Version | 1.0 |
| Prepared By | Product Team |
| Target Audience | Engineering, Design, Stakeholders |
| Last Updated | March 2026 |

# **1\. Executive Summary**

PlayZone is a browser-based multiplayer gaming platform that lets friends play casual mini-games together in real time from separate devices. Players create or join game rooms via a short code, choose a game, and start playing instantly — no downloads, no accounts required.

The v1.0 launch includes four games:

* Snake (2–4 players, competitive arena)

* Tic Tac Toe (2 players)

* Snakes & Ladders (2–4 players)

* Ludo (2–4 players)

The platform is built for low-latency real-time interaction using WebSockets, with a lightweight Node.js backend and a React/TypeScript frontend. Deployment targets will be finalised in Phase 2\.

# **2\. Goals & Non-Goals**

## **2.1 Goals**

* Enable 2–4 friends to play real-time multiplayer games from different devices with minimal setup friction.

* Support at least 4 games at launch with a pluggable architecture for future additions.

* Deliver sub-100ms round-trip latency for game state sync under normal network conditions.

* Provide a mobile-responsive UI that works on phones, tablets, and desktops.

* Achieve zero-auth guest play via shareable room codes.

## **2.2 Non-Goals (v1.0)**

* Persistent user accounts, profiles, or ELO/ranking systems.

* AI/bot opponents.

* Monetisation or in-app purchases.

* Native mobile apps (iOS/Android).

* Spectator mode.

* Persistent game history or replays.

# **3\. User Personas**

### **Persona 1 — Rohan, The Casual Gamer (Primary)**

| Age | 22 |
| :---- | :---- |
| Context | College student, plays during free periods with friends on campus |
| Devices | Android phone, laptop |
| Pain Points | Download fatigue, laggy WebRTC tools, complicated lobbies |
| Goal | Jump into a game with friends in under 30 seconds, no sign-up |

### **Persona 2 — Priya, The Host (Secondary)**

| Age | 28 |
| :---- | :---- |
| Context | Working professional, organises Friday evening game nights over video call |
| Devices | MacBook, iPhone |
| Pain Points | Wants one link to share, hates switching between multiple apps |
| Goal | Create a room, share a code, pick a game, and switch games mid-session |

### **Persona 3 — Arjun, The Remote Player (Secondary)**

| Age | 35 |
| :---- | :---- |
| Context | Remote worker joining a game night from a different city |
| Devices | iPad, home desktop |
| Pain Points | High-latency games, choppy UI on mobile browsers |
| Goal | Smooth, responsive gameplay despite 100–150ms network latency |

# **4\. User Stories**

## **4.1 Lobby & Room Management**

* **US-01:** As a host, I can create a game room and receive a 6-character room code so I can share it with friends.

* **US-02:** As a player, I can join a room by entering a room code and a display name without creating an account.

* **US-03:** As a host, I can see a waiting lobby that lists all joined players and their ready status.

* **US-04:** As a host, I can select which game to play from the available list.

* **US-05:** As a host, I can start the game once at least the minimum number of players are ready.

* **US-06:** As a player, I can see a live player list and connection status indicators.

## **4.2 In-Game**

* **US-07:** As a player, I can see game state updates from other players in real time (\<100ms).

* **US-08:** As a player, I receive a clear notification when it is my turn.

* **US-09:** As a player, I can see when another player disconnects and understand what happens next.

* **US-10:** As a player, I can view the scoreboard after a game ends.

## **4.3 Post-Game**

* **US-11:** As a host, I can start a rematch with the same players.

* **US-12:** As a host, I can switch to a different game without re-sharing the room code.

* **US-13:** As a player, I can leave the room at any time.

# **5\. Functional Requirements**

## **5.1 Room & Session System**

* Room codes are 6 alphanumeric characters, uppercase, case-insensitive on entry.

* Rooms expire 30 minutes after all players leave or the host disconnects.

* Maximum 4 players per room across all games.

* The host has moderator rights: kick players, start game, switch game.

* Player names are 2–16 characters, no special characters.

## **5.2 Game: Snake (Multiplayer Arena)**

* 2–4 players share a single arena board (minimum 30x30 grid).

* Each snake has a distinct colour assigned on join.

* Collision with another snake's body results in death; the eliminated player can spectate.

* Food items spawn randomly; consuming food grows the snake and increments score.

* Game ends when only one snake remains alive; that player wins.

* Tick rate: 10 frames/second server-authoritative.

## **5.3 Game: Tic Tac Toe**

* 2 players; one is assigned X, the other O.

* Standard 3x3 grid; first to complete a row, column, or diagonal wins.

* A draw is declared if the board fills with no winner.

* The losing player gets to go first in the next round.

## **5.4 Game: Snakes & Ladders**

* 2–4 players on a standard 10x10 (100-square) board.

* Players roll a virtual die on their turn; the server validates and broadcasts the result.

* Classic snake and ladder positions as per the standard board.

* First player to reach or exceed square 100 wins.

* Turn timeout: 30 seconds per player; auto-roll if exceeded.

## **5.5 Game: Ludo**

* 2–4 players, each assigned a colour (Red, Blue, Green, Yellow).

* Each player has 4 tokens starting in their home base.

* A token enters the board on rolling a 6\.

* Tokens can capture opponents (send them back to base) except when on safe squares.

* A player who rolls a 6 gets an additional roll (max 3 consecutive 6s before losing turn).

* First player to move all 4 tokens to the finish wins.

* Turn timeout: 30 seconds; auto-pass if exceeded.

## **5.6 Disconnection Handling**

* Players are given a 10-second reconnection grace window.

* For turn-based games, a disconnected player's turn is auto-skipped after the grace window.

* For Snake, a disconnected player's snake is eliminated immediately.

* If the host disconnects, the longest-connected other player is promoted to host.

# **6\. Non-Functional Requirements**

| Category | Requirement | Target |
| :---- | :---- | :---- |
| Performance | Game state sync latency | \< 100ms RTT (median) |
| Performance | Room creation time | \< 500ms |
| Scalability | Concurrent rooms per server instance | 500+ |
| Reliability | Uptime SLA | 99.5% monthly |
| Availability | Browser support | Chrome, Safari, Firefox, Edge (latest 2 versions) |
| Responsiveness | Mobile layout breakpoint | 320px minimum viewport |
| Accessibility | WCAG compliance | Level AA |
| Security | Input sanitisation | All player inputs sanitised server-side |
| Security | Rate limiting | Max 10 room-create requests/min per IP |

# **7\. Recommended Tech Stack**

| Layer | Technology | Rationale |
| :---- | :---- | :---- |
| Frontend | React 18 \+ TypeScript | Component reuse across games; type safety |
| Styling | Tailwind CSS | Utility-first; fast responsive layouts |
| Game Rendering | HTML5 Canvas (Snake/Ludo) \+ DOM (TicTacToe/S\&L) | Canvas for frame-heavy games; DOM for board games |
| Real-time | Socket.IO (WebSocket) | Rooms, namespaces, fallback to polling |
| Backend | Node.js \+ Express \+ TypeScript | Shared types with frontend; non-blocking I/O |
| State | In-memory (Redis optional for scale) | Redis for multi-instance room sync |
| Deployment | Vercel (FE) \+ Railway / Fly.io (BE) | Low-ops, WebSocket-friendly |
| CI/CD | GitHub Actions | Lint \+ test \+ deploy on merge to main |

# **8\. High-Level Architecture**

## **8.1 System Components**

* Client (React SPA): Renders UI, captures player input, sends events via Socket.IO.

* Game Server (Node.js): Manages rooms, validates moves, runs authoritative game loops, broadcasts state.

* Room Manager: In-memory store of active rooms, player sessions, and game states.

* Game Engine Modules: One module per game, each implementing a common IGameEngine interface.

## **8.2 Real-Time Event Model**

**Events flow in two directions:**

Client → Server (Actions):

* room:create, room:join, room:leave

* game:ready, game:start

* game:action (move, roll, place)

Server → Client (State):

* room:state (player list, game selection)

* game:state (full board/game state snapshot)

* game:delta (incremental update for performance)

* game:end (winner, scores, next actions)

* player:disconnected, player:reconnected

## **8.3 IGameEngine Interface (TypeScript)**

All game modules implement a common interface to ensure pluggability:

| interface IGameEngine {   initialState(players: Player\[\]): GameState;   applyAction(state: GameState, action: PlayerAction): GameState;   isTerminal(state: GameState): boolean;   getWinner(state: GameState): Player | null;   minPlayers: number;   maxPlayers: number; } |
| :---- |

# **9\. UX & Design Requirements**

## **9.1 Core Screens**

| Screen | Key Elements |
| :---- | :---- |
| Home | Create Room button, Join Room input, display name entry |
| Lobby | Room code (shareable), player list with ready toggle, game selector, Start button |
| Game Board | Game canvas/board, player info panel, turn indicator, leave button |
| Results | Winner announcement, score summary, Rematch \+ Switch Game \+ Leave options |

## **9.2 Design Principles**

* Zero learning curve — visible affordances, no tutorial required for lobby flow.

* Mobile-first — all touch targets minimum 44x44px; game boards scale to viewport.

* Accessible — keyboard navigation in menus; ARIA labels on all interactive elements; colour is never the sole differentiator.

* Instant feedback — all server responses acknowledged with optimistic UI or loading states.

* Persistent room code — always visible in lobby so late-joining friends can still share.

# **10\. Phased Roadmap**

| Phase | Timeline | Scope | Outcome |
| :---- | :---- | :---- | :---- |
| Phase 1 | Weeks 1–3 | Core infrastructure: Node.js \+ Socket.IO server, React shell, room/lobby system, TicTacToe (simplest game as integration test) | Playable TicTacToe in-browser |
| Phase 2 | Weeks 4–6 | Add Snakes & Ladders \+ Ludo (turn-based engine reuse), deployment on Railway \+ Vercel, reconnect logic | 4-player board games live |
| Phase 3 | Weeks 7–9 | Snake multiplayer arena (Canvas \+ server tick loop), mobile polish, WCAG AA audit | All 4 games launched |
| Phase 4 | Weeks 10–12 | Load testing, Redis adapter for horizontal scaling, analytics (Mixpanel/PostHog), more games TBD | Production-ready |

# **11\. Success Metrics**

| Metric | Target (30 days post-launch) | Measurement |
| :---- | :---- | :---- |
| Room creation to first game start time | \< 60 seconds median | Client-side event timing |
| Average session duration | \> 15 minutes | Session analytics |
| D7 retention (returning players) | \> 25% | Cookie / local ID tracking |
| Game state sync p95 latency | \< 150ms | Server-side telemetry |
| Crash / error rate | \< 0.5% of sessions | Error tracking (Sentry) |
| Mobile sessions share | \> 50% | UA analytics |
| Game completion rate | \> 70% of started games | Room state events |

# **12\. Risks & Mitigations**

| \# | Risk | Severity | Mitigation |
| :---- | :---- | :---- | :---- |
| R1 | High latency degrades Snake gameplay | High | Server-authoritative tick rate \+ delta compression; degrade gracefully on high RTT |
| R2 | WebSocket blocked by corporate/campus firewalls | Medium | Socket.IO falls back to HTTP long-polling automatically |
| R3 | Host disconnect breaks the session | Medium | Host promotion logic (US-09); auto-save state for reconnect |
| R4 | Single server instance can't handle traffic spikes | Medium | Redis adapter for Socket.IO enables horizontal scaling without code changes |
| R5 | Cheating / state manipulation from client | Low | All game logic runs server-side; client sends only intentions, not state |
| R6 | Mobile Canvas performance for Snake | Low | Use requestAnimationFrame; cap render at 30fps on detected low-end devices |

# **13\. Open Questions**

* **OQ-01:** Should rooms require a password option for private sessions?

* **OQ-02:** Should we support a 'spectator' role in Phase 1 or defer to Phase 4?

* **OQ-03:** Do we want to persist scores across sessions (requires a lightweight auth)?

* **OQ-04:** Which deployment platform is preferred — Railway, Fly.io, or a VPS?

* **OQ-05:** Should Snake support team mode (2v2) in addition to free-for-all?

* **OQ-06:** What is the preferred analytics provider — PostHog (free, open-source) or Mixpanel?

# **14\. Glossary**

| Term | Definition |
| :---- | :---- |
| Room | A temporary session container identified by a 6-char code, holding 2–4 players |
| Host | The player who created the room; holds moderator privileges |
| Game State | The complete, authoritative snapshot of a game at a given tick, held server-side |
| Delta | A minimal diff of game state sent to clients to reduce payload size |
| RTT | Round-Trip Time — the time for an event to travel from client to server and back |
| Tick Rate | The frequency (per second) at which the server computes and broadcasts game state |
| IGameEngine | TypeScript interface all game modules must implement for pluggability |

*— End of Document —*