  
**PRODUCT REQUIREMENTS DOCUMENT**

**PlayZone v2.0**

Multiplayer Mini-Games Web Platform

Version 2.0  |  March 2026

**Status: Final Review**

*Confidential*

# **1\. Product Overview**

## **1.1 Executive Summary**

PlayZone is a browser-based, real-time multiplayer gaming platform that lets friends play classic mini-games together across different devices — no downloads, no sign-ups required. Players create or join a room with a 6-digit code, pick a game, and start playing instantly.

*Key Differentiator: PlayZone leverages lightweight WebSockets to ensure sub-100ms latency, providing a "near-native" feel for arcade-style games in a mobile browser.*

## **1.2 Problem Statement**

Friends who want to play casual games together online face three pain points:

* Existing platforms require app installations, account creation, or paid subscriptions.

* Most mini-game sites only support single-player or local hot-seat play.

* There is no simple, shareable link-based experience for 2–5 players to jump into classic board/arcade games instantly.

## **1.3 Product Vision**

**"The ultimate frictionless playground — where classic games meet modern connectivity."**

## **1.4 Scope**

| Attribute | Detail |
| :---- | :---- |
| Product Type | Web Application (Browser-based) |
| Target Audience | Casual gamers, friend groups (ages 12+) |
| Players / Room | 2 – 5 players |
| Launch Games | Snake, Tic Tac Toe, Snakes & Ladders, Ludo, Chess |
| Multiplayer | Online real-time (WebSocket / Socket.IO) |
| Deployment | TBD — recommended: Vercel (frontend) \+ Railway (backend) \+ Upstash Redis |
| MVP Timeline | Phase 1: 8 weeks |

# **2\. User Personas**

## **2.1 The Casual Friend Group**

| Attribute | Description |
| :---- | :---- |
| Name | Arjun & Friends (college group) |
| Age | 18–26 |
| Context | Playing remotely across cities during free time |
| Goal | Quick, fun session with zero setup friction |
| Pain Point | Complex onboarding kills the vibe before the game starts |
| Device | Mix of phones and laptops |

## **2.2 The Family Player**

| Attribute | Description |
| :---- | :---- |
| Name | Priya (parent, 35\) |
| Age | 35, playing with kids aged 8–14 |
| Context | Family game night, different rooms of the house |
| Goal | Simple games that kids know, running on tablets |
| Pain Point | Unfamiliar UIs confuse young players |
| Device | Tablets and smart TVs |

## **2.3 The Competitive Gamer**

| Attribute | Description |
| :---- | :---- |
| Name | Rohan (young professional, 24\) |
| Age | 24 |
| Context | Wants to track wins, challenge friends repeatedly |
| Goal | Leaderboard, rematch options, fair game logic |
| Pain Point | Casual platforms lack competitive feedback |
| Device | Laptop / desktop |

# **3\. User Stories**

## **3.1 Lobby & Room Management**

| ID | As a… | I want to… | So that… |
| :---- | :---- | :---- | :---- |
| US-01 | Player | Create a game room and get a shareable code | Friends can join without signing up |
| US-02 | Player | Join a room using a 6-digit code | I can connect to my friend's session |
| US-03 | Host | Select a game from the lobby | Everyone in the room plays the same game |
| US-04 | Player | See who is in the lobby in real time | I know when all friends have joined |
| US-05 | Host | Kick an inactive player from the room | The session does not get stuck |
| US-06 | Player | Set a display name before entering | My friends recognise me in-game |

## **3.2 Gameplay**

| ID | As a… | I want to… | So that… |
| :---- | :---- | :---- | :---- |
| US-07 | Player | See whose turn it is clearly highlighted | I do not miss my move |
| US-08 | Player | Play Snake in multiplayer (each player controls one snake) | We compete on the same board |
| US-09 | Player | Play Tic Tac Toe with a friend (2P) | We have a classic head-to-head match |
| US-10 | Player | Play Snakes & Ladders with up to 4 players | The whole friend group can join |
| US-11 | Player | Play Ludo with up to 4 players | We get a longer, strategic session |
| US-12 | Player | Play Chess 1v1 with move validation | Illegal moves are prevented |
| US-13 | Player | See the game state update in real time | Lag and stale boards do not cause confusion |
| US-14 | Player | Use swipe / D-pad controls on mobile for Snake | I can play comfortably on a phone |

## **3.3 Post-Game**

| ID | As a… | I want to… | So that… |
| :---- | :---- | :---- | :---- |
| US-15 | Player | See a winner announcement screen | The result is clear and celebratory |
| US-16 | Player | Rematch with the same room | We do not have to re-share codes |
| US-17 | Player | View a session score summary | I can track wins across multiple rounds |
| US-18 | Host | Return to lobby and pick a different game | We can switch games mid-session |

# **4\. Game Specifications**

## **4.1 Snake (Multiplayer)**

| Attribute | Detail |
| :---- | :---- |
| Players | 2 – 4 |
| Board | 30×30 grid (scaled: 35×35 for 3P, 40×40 for 4P) |
| Mechanics | Each player controls one snake; eating food grows the snake; wall or snake collision ends that player |
| Win Condition | Last snake alive wins; simultaneous crash \= draw |
| Spawn Positions | Fixed per player count: 2P \= top-left & bottom-right; 3P \= top-left, top-right, bottom-centre; 4P \= four corners. Minimum 10-cell gap enforced. |
| Initial Direction | Away from nearest wall: top-left snake faces right+down, etc. |
| Speed | Starts at 150ms/tick; increases by 10ms every 30s; floor of 60ms |
| Food | 1 food item active per player on board; respawns within 500ms of consumption |
| Mobile Controls | On-screen D-pad rendered below canvas; swipe gestures also supported |
| Turn Model | Real-time simultaneous — no turns |
| Conflict Resolution | Moves timestamped server-side; if two snakes occupy same cell on same tick, both die |

## **4.2 Tic Tac Toe**

| Attribute | Detail |
| :---- | :---- |
| Players | 2 |
| Board | 3×3 grid |
| Mechanics | Alternating turns; first to place 3 in a row wins |
| Win Condition | 3 in a row (horizontal, vertical, diagonal) |
| Special Rules | Draw detected when board is full with no winner |
| Turn Timer | 15 seconds; timeout \= forfeit turn (cell stays empty) |
| Turn Model | Alternating — server enforces turn order |

## **4.3 Snakes & Ladders**

| Attribute | Detail |
| :---- | :---- |
| Players | 2 – 5 |
| Board | 10×10 standard board (100 tiles) |
| Mechanics | Dice roll moves token; ladder head \= advance; snake head \= go back |
| Win Condition | First to reach tile 100 (exact roll required) |
| Dice | Server-side CSPRNG; result broadcast to all players before animation |
| Special Rules | Overshoot tile 100 \= stay in place |
| Turn Model | Rotating; 30s timer per turn |

## **4.4 Ludo**

| Attribute | Detail |
| :---- | :---- |
| Players | 2 – 4 |
| Board | Standard Ludo board with 4 colour home zones |
| Mechanics | Roll 6 to move token out; navigate board to home; capture opponents |
| Win Condition | First player to get all 4 tokens home |
| Special Rules | Roll 6 \= extra turn; safe squares shown; capture sends opponent token home |
| Dice | Server-side CSPRNG — same as Snakes & Ladders |
| Turn Model | Rotating; 30s timer per turn |

## **4.5 Chess**

| Attribute | Detail |
| :---- | :---- |
| Players | 2 |
| Board | 8×8 standard chess board |
| Mechanics | Full standard chess rules; all move validation server-side via chess.js |
| Win Condition | Checkmate; draws: stalemate, threefold repetition, 50-move rule, insufficient material |
| Special Rules | En passant, castling, and pawn promotion all supported |
| Clock | Optional: 5 / 10 / 15 min; opt-in before game starts; default OFF |
| Turn Model | Alternating; server rejects moves submitted out of turn |

# **5\. Data Models & Socket Event Schema**

## **5.1 Core TypeScript Interfaces**

These interfaces live in packages/shared/types.ts and are imported by both frontend and backend.

### **PlayerState**

interface PlayerState {

  id:          string;          // Socket ID

  displayName: string;          // max 20 chars

  color:       string;          // assigned hex colour

  isHost:      boolean;

  isReady:     boolean;

  isConnected: boolean;

  score:       number;          // wins in this session

}

### **RoomState**

interface RoomState {

  roomCode:    string;          // 6-char alphanumeric

  players:     PlayerState\[\];

  spectators:  PlayerState\[\];  // reserved — Phase 2

  selectedGame: GameType | null;

  status:      'LOBBY' | 'IN\_GAME' | 'GAME\_OVER' | 'PAUSED';

  createdAt:   number;          // Unix ms — TTL anchor

  expiresAt:   number;          // createdAt \+ 30 min

}

### **GameState (discriminated union per game)**

type GameState \=

  | SnakeState

  | TicTacToeState

  | SnakesLaddersState

  | LudoState

  | ChessState;

interface SnakeState {

  type:     'snake';

  tick:     number;

  snakes:   Record\<string, Snake\>;  // keyed by player ID

  food:     Position\[\];

  gridSize: number;

  alivePlayers: string\[\];

}

interface TicTacToeState {

  type:          'tictactoe';

  board:         (string | null)\[\]\[\];  // 3x3, null \= empty

  currentTurn:   string;               // player ID

  turnExpiresAt: number;               // Unix ms

  winner:        string | 'draw' | null;

}

interface ChessState {

  type:    'chess';

  fen:     string;    // Full FEN string — single source of truth

  pgn:     string;    // Move history

  turn:    'w' | 'b';

  clocks:  Record\<string, number\> | null;  // ms remaining

  status:  'active' | 'check' | 'checkmate' | 'stalemate' | 'draw';

}

## **5.2 Socket.IO Event Schema**

All events are typed in packages/shared/events.ts. Direction: C \= Client emits, S \= Server emits.

### **Room Events**

| Event | Dir. | Payload | Description |
| :---- | :---- | :---- | :---- |
| room:create | C | { displayName } | Create a new room; server responds with room:created |
| room:created | S | { roomCode, player: PlayerState } | Confirms creation; returns assigned room code |
| room:join | C | { roomCode, displayName } | Join an existing room |
| room:joined | S | { room: RoomState } | Broadcast to all players; full room snapshot |
| room:leave | C | {} | Player voluntarily leaves |
| room:player\_left | S | { playerId, room: RoomState } | Broadcast when a player leaves or times out |
| room:kick | C | { targetPlayerId } | Host only; kicks a player |
| room:error | S | { code: RoomErrorCode, message } | Room-level errors (see Section 9\) |

### **Lobby Events**

| Event | Dir. | Payload | Description |
| :---- | :---- | :---- | :---- |
| lobby:select\_game | C | { game: GameType } | Host selects a game; broadcast to room |
| lobby:game\_selected | S | { game: GameType } | Broadcast to all players |
| lobby:ready | C | {} | Player marks themselves ready |
| lobby:start | C | {} | Host starts the game (all players must be ready) |
| lobby:state | S | { room: RoomState } | Full lobby snapshot on connect/reconnect |

### **Game Events**

| Event | Dir. | Payload | Description |
| :---- | :---- | :---- | :---- |
| game:state | S | { state: GameState } | Full game state snapshot (on join/reconnect) |
| game:delta | S | { delta: Partial\<GameState\> } | Incremental update (preferred over full state) |
| game:move | C | { move: GameMove } | Player submits a move (typed per game) |
| game:move\_rejected | S | { reason: string } | Server rejects an illegal move |
| game:tick | S | { tick: number, snakes: … } | Snake-specific; emitted every game tick |
| game:turn\_change | S | { playerId, expiresAt } | Whose turn it is and timer deadline |
| game:over | S | { winner: string | 'draw', scores: Record\<string,number\> } | Game ended |
| game:roll\_dice | C | {} | Player requests a dice roll (Ludo/S\&L) |
| game:dice\_result | S | { value: number, playerId } | Server-side dice result broadcast |

### **Session Events**

| Event | Dir. | Payload | Description |
| :---- | :---- | :---- | :---- |
| session:rematch | C | {} | Host requests rematch; resets game state |
| session:new\_game | C | {} | Return to lobby; keep room and players |
| session:disconnect | S | { playerId, slotHeldUntil } | Player disconnected; slot held 60s |
| session:reconnect | C | { roomCode, displayName } | Rejoin after disconnect |
| session:reconnected | S | { room: RoomState, state: GameState } | Full snapshot on reconnect |

## **5.3 Conflict Resolution Strategy**

*Rule: The server is the single and final source of truth. Clients are rendering terminals only.*

The following strategies handle race conditions per game type:

| Scenario | Strategy |
| :---- | :---- |
| Two players move in same Snake tick | Server collects all moves for the tick, resolves simultaneously. Both snakes moving into the same cell \= both die. Head-on collision \= both die. |
| Client sends move after turn has expired | Server checks turnExpiresAt before processing; stale moves are silently dropped and game:move\_rejected emitted. |
| Two clients emit game:move for the same turn (e.g. double-tap) | Server uses a per-turn lock: first valid move wins; duplicate moves for same turn are rejected. |
| Dice roll requested twice (double click) | Server debounces roll requests per player per turn using a Redis lock (100ms TTL). |
| Chess move sent while opponent is also moving (impossible by rules but network edge case) | FEN-based validation on server means only the player whose turn matches the FEN's active colour can move. |
| Reconnect during active game | Server replays full GameState snapshot. No partial deltas on reconnect — always full state. |

# **6\. Recommended Tech Stack**

## **6.1 Architecture Overview**

Browser (React \+ Vite)  ←WS→  Node.js \+ Socket.IO  ←→  Redis (game state \+ pub/sub)

## **6.2 Frontend**

| Layer | Technology | Version | Reason |
| :---- | :---- | :---- | :---- |
| Framework | React | 18.x | Component-driven game UI, concurrent rendering |
| Build Tool | Vite | 5.x | Sub-second HMR |
| Language | TypeScript | 5.x | Type-safe game state and event schemas |
| Styling | Tailwind CSS | 3.x | Utility-first, responsive layouts |
| State | Zustand | 4.x | Lightweight; avoids Redux overhead |
| Canvas | HTML5 Canvas | — | Frame-by-frame Snake rendering |
| Chess Logic | chess.js | 1.x | Move validation, FEN/PGN parsing |
| Routing | React Router | 6.x | Lobby → Room → Game routes |
| Testing | Vitest \+ RTL | — | Unit \+ component tests |

## **6.3 Backend**

| Layer | Technology | Version | Reason |
| :---- | :---- | :---- | :---- |
| Runtime | Node.js | 20 LTS | Non-blocking I/O ideal for real-time |
| Language | TypeScript | 5.x | Shared types with frontend via monorepo |
| WebSocket | Socket.IO | 4.x | Rooms, reconnect, event broadcasting |
| HTTP | Express.js | 4.x | Health check \+ REST room metadata |
| Game State | Redis | 7.x | Fast in-memory state; pub/sub for scaling |
| Validation | Zod | 3.x | Runtime schema validation for all events |
| Testing | Jest \+ Supertest | — | Unit \+ integration tests |

## **6.4 Infrastructure**

| Component | Recommended | Alternative |
| :---- | :---- | :---- |
| Frontend | Vercel | Netlify, Cloudflare Pages |
| Backend | Railway | Render, Fly.io |
| Redis | Upstash (serverless) | Redis Cloud free tier |
| CI/CD | GitHub Actions | Vercel \+ Railway auto-deploy |
| Monitoring | Sentry (errors) \+ Axiom (logs) | Datadog, LogRocket |

## **6.5 Monorepo Structure**

playzone/

  apps/web/              — React frontend (Vite \+ TypeScript)

  apps/server/           — Node.js \+ Socket.IO backend

  packages/shared/       — TypeScript types & Zod schemas

  packages/game-logic/   — Pure, testable game engine functions

  packages/ui/           — Shared Tailwind \+ React component library

  .github/workflows/     — CI: lint, test, build, deploy

## **6.6 Third-Party Dependency Register**

All dependencies are pinned to exact versions in package.json. Licenses verified for commercial use.

| Package | Version | License | Used For | Risk |
| :---- | :---- | :---- | :---- | :---- |
| socket.io | 4.7.x | MIT | WebSocket server | Low |
| socket.io-client | 4.7.x | MIT | WebSocket client | Low |
| chess.js | 1.0.x | BSD-2 | Chess rule engine | Low |
| zustand | 4.5.x | MIT | Client state management | Low |
| zod | 3.22.x | MIT | Schema validation | Low |
| ioredis | 5.3.x | MIT | Redis client (Node.js) | Low |
| @upstash/redis | 1.x | MIT | Serverless Redis SDK | Low |
| tailwindcss | 3.4.x | MIT | Styling | Low |
| vitest | 1.x | MIT | Frontend testing | Low |
| jest | 29.x | MIT | Backend testing | Low |

# **7\. Functional Requirements**

## **7.1 Room & Lobby System**

* Generate a unique 6-character alphanumeric room code; verify uniqueness in Redis before issuing.

* Room supports 2–5 players; reject join when full (emit room:error with code ROOM\_FULL).

* Spectator slots reserved in RoomState.spectators from day 1 — not surfaced in UI until Phase 2\.

* Host can select game; selection broadcast via lobby:game\_selected.

* Room auto-expires after 30 minutes of inactivity; Redis TTL handles cleanup.

* Players can set display name (max 20 chars); no auth required.

* Disconnected player's slot held for 60 seconds; room pauses if mid-game.

## **7.2 Real-Time Communication**

* All game events via Socket.IO. Server is single source of truth.

* Dice rolls for Snakes & Ladders and Ludo computed server-side using CSPRNG.

* Move validation for Chess runs server-side via chess.js; invalid moves return game:move\_rejected.

* On reconnect, server always sends full GameState snapshot (never partial delta).

* All socket events validated against Zod schemas on receipt; malformed events silently dropped.

* Latency target: \< 100ms event round-trip (p95) on standard broadband.

## **7.3 Mobile Controls — Snake**

* On-screen D-pad rendered below canvas on viewport width \< 768px.

* Swipe gesture detection (min 30px threshold) maps to direction changes.

* D-pad and swipe both active simultaneously — whichever fires first wins.

* Canvas scales to viewport width; minimum playable size is 300×300px.

## **7.4 Game FSM**

| State | Trigger | Next State |
| :---- | :---- | :---- |
| LOBBY | All players ready \+ host starts | IN\_GAME |
| IN\_GAME | Win condition met | GAME\_OVER |
| IN\_GAME | Player disconnects | PAUSED |
| PAUSED | Player reconnects within 60s | IN\_GAME (resumed) |
| PAUSED | 60s slot expires | GAME\_OVER (forfeit) |
| GAME\_OVER | Host → Rematch | IN\_GAME (state reset) |
| GAME\_OVER | Host → New Game | LOBBY |

## **7.5 UI Requirements**

* Responsive: desktop (1024px+), tablet (768px), mobile (375px minimum).

* Persistent turn indicator banner: current player name \+ colour highlight.

* Countdown timer bar shown per turn for Tic Tac Toe and Chess.

* Toast notifications for: player joined, player disconnected, illegal move, turn timeout.

* Animated winner screen with confetti (canvas-confetti library) on game end.

* Dark mode via Tailwind dark: prefix; respects prefers-color-scheme.

* All game boards keyboard-navigable (see Section 8 Accessibility).

# **8\. Non-Functional Requirements**

## **8.1 Performance & Scalability**

| Category | Requirement | Target |
| :---- | :---- | :---- |
| Latency | WebSocket event round-trip (p95) | \< 100ms |
| Load Time | Initial page load on 4G | \< 2s |
| Scalability | Concurrent rooms per server instance | 500+ |
| Availability | Uptime SLA (post-launch) | 99.5% |
| Snake tick rate | Server tick interval | 150ms start → 60ms floor |
| Redis ops | Max latency for game state read/write | \< 5ms (Upstash avg) |

## **8.2 Security**

* All moves validated server-side — clients can never push state directly.

* Room access: only players with a valid room code can join.

* No user credentials stored; display names are ephemeral (session only).

* Socket events validated via Zod on arrival; schema violations dropped and logged.

* Rate-limit room creation: max 5 rooms per IP per 10 minutes (Redis counter).

* CORS restricted to own frontend domain in production.

## **8.3 Data Retention & Privacy**

PlayZone does not require user accounts, so PII exposure is minimal. The following retention rules apply:

| Data | Storage | TTL / Retention Policy |
| :---- | :---- | :---- |
| RoomState | Redis | 30 minutes of inactivity, then auto-deleted via Redis TTL |
| GameState | Redis | Deleted with RoomState on expiry |
| Display names | Redis (in RoomState) | Deleted with RoomState; never persisted to disk |
| Server-side event logs | Axiom / log drain | 30-day rolling retention, then auto-purged |
| Error traces | Sentry | 90-day retention; no game payloads captured |
| Analytics (Phase 2+) | TBD | Anonymised session counts only; no player identifiers |

*GDPR note: Because no PII is stored beyond ephemeral display names (deleted with the room), PlayZone operates with minimal GDPR surface area. If analytics or accounts are added in Phase 2, a formal privacy policy and GDPR assessment will be required.*

## **8.4 Accessibility (WCAG 2.1 AA)**

Accessibility requirements broken down by component:

| Component | Requirement | Implementation |
| :---- | :---- | :---- |
| All boards | Keyboard navigation | Tab through cells; Enter/Space to select or move |
| Snake | Keyboard arrow keys | Arrow keys change direction; canvas has aria-label with game status |
| Chess board | Screen reader move announcements | Each move announced via aria-live='polite' region |
| Turn indicator | Colour not the only signal | Player name \+ icon used in addition to colour coding |
| Dice button | Accessible label | aria-label='Roll dice' \+ keyboard activatable |
| Winner screen | Focus management | Focus moves to winner announcement on game over |
| Toasts | Non-visual announcements | Injected into aria-live='assertive' region |
| Colour contrast | Text on backgrounds | All text meets 4.5:1 ratio; game tokens meet 3:1 on board |
| Snake canvas | Alt text | aria-label updated each tick: 'Snake game, Arjun leading, 3 players alive' |
| Mobile D-pad | Touch target size | Minimum 44×44px per button (WCAG 2.5.5) |

## **8.5 Browser & Device Support**

| Category | Target |
| :---- | :---- |
| Desktop browsers | Chrome 110+, Firefox 110+, Safari 15+, Edge 110+ |
| Mobile browsers | Chrome Android 110+, Safari iOS 15+ |
| Minimum viewport | 375×667px (iPhone SE) |
| Touch input | All games fully playable via touch |
| Network | Playable on 4G; degrades gracefully on 3G (slower tick rate for Snake) |

# **9\. Error States & Edge Cases**

## **9.1 Room-Level Error Codes**

| Error Code | Trigger | UI Treatment |
| :---- | :---- | :---- |
| ROOM\_NOT\_FOUND | Room code does not exist or has expired | Inline form error: 'Room not found. Check the code or ask your host to create a new one.' |
| ROOM\_FULL | Room already has 5 players | Toast: 'This room is full (5/5 players).' |
| ROOM\_IN\_PROGRESS | Game already started (no spectator mode yet) | Toast: 'A game is in progress. Wait for it to end or ask for a new room.' |
| DISPLAY\_NAME\_TAKEN | Name already in use in the room | Inline error on name input: 'That name is taken in this room.' |
| ROOM\_EXPIRED | Room TTL elapsed (30 min inactive) | Full-page message: 'This room expired. Create a new one.' with CTA button. |
| HOST\_ONLY | Non-host tries to start/kick/change game | Toast: 'Only the host can do that.' |

## **9.2 Game-Level Error States**

| Scenario | Server Behaviour | Client Treatment |
| :---- | :---- | :---- |
| Illegal chess move | Emit game:move\_rejected { reason } | Piece snaps back; toast shows reason (e.g. 'That move puts your king in check.') |
| Move submitted out of turn | Emit game:move\_rejected { reason: 'NOT\_YOUR\_TURN' } | Toast: 'It is not your turn yet.' |
| Turn timer expires | Server auto-advances turn; emits game:turn\_change | Flashing red countdown in last 5s; toast: 'Arjun's turn timed out.' |
| All players disconnect simultaneously | Room enters PAUSED; auto-closes after 60s | N/A — no clients to notify |
| Server restart mid-game | Redis persists RoomState and GameState; clients reconnect via session:reconnect | Reconnect banner shown; full snapshot replayed |
| Redis unavailable | Express health check returns 503; new room creation blocked | Full-page error: 'Service temporarily unavailable. Please try again shortly.' |

## **9.3 Network Edge Cases**

| Scenario | Behaviour |
| :---- | :---- |
| WebSocket fails to establish (firewall/proxy) | Socket.IO falls back to HTTP long-polling automatically |
| Player on very high latency (\> 500ms) | Latency indicator shown next to their avatar; turn timers not paused (fairness) |
| Player refreshes the page mid-game | Browser reconnects via session:reconnect; full state snapshot restored |
| Room code collision (two rooms get same code) | Server checks Redis before issuing; retries with new code up to 5 times before returning 500 |

# **10\. UI Flow & Screen Map**

## **10.1 Screen Inventory**

| Screen | Route | Description |
| :---- | :---- | :---- |
| Home |   / | Hero CTA: Create Room or Join Room. Minimal — name input \+ code input. |
| Lobby |   /room/:code | Shows room code, player list, game selector (host only), Ready buttons, Start button. |
| Game — Snake |   /room/:code/snake | Canvas \+ scoreboard \+ mobile D-pad overlay. |
| Game — TicTacToe |   /room/:code/tictactoe | 3×3 grid \+ turn banner \+ 15s timer bar. |
| Game — S\&L |   /room/:code/snakesladders | Board \+ player tokens \+ dice button \+ move log. |
| Game — Ludo |   /room/:code/ludo | Board \+ four home zones \+ dice \+ token selector. |
| Game — Chess |   /room/:code/chess | Board \+ captured pieces \+ optional clock \+ move history panel. |
| Game Over |   /room/:code/result | Winner banner \+ session scores \+ Rematch / New Game / Leave buttons. |
| Error |   /error | Full-page error for expired rooms or server errors. |

## **10.2 Navigation Flow**

The diagram below describes the high-level player journey:

Home  →  \[Create Room\]  →  Lobby (as host)

Home  →  \[Join Room\]   →  Lobby (as guest)

Lobby  →  \[Host starts\]  →  Game Screen  →  Game Over Screen

Game Over  →  \[Rematch\]    →  Game Screen (same players, reset state)

Game Over  →  \[New Game\]   →  Lobby

Game Over  →  \[Leave\]      →  Home

*Wireframes: High-fidelity wireframes for Home, Lobby, and Game screens to be produced in Figma during Week 1 of Phase 1\. Design review required before frontend implementation begins (Week 2).*

# **11\. Phased Roadmap**

## **11.1 Phase 1 — MVP (Weeks 1–8)**

| Week | Milestone | Deliverables |
| :---- | :---- | :---- |
| 1–2 | Foundation | Monorepo setup, Socket.IO server, room create/join flow, lobby UI, Figma wireframes |
| 3–4 | Core Games 1 | Tic Tac Toe (2P), Snakes & Ladders (4P) — fully playable with error states |
| 5–6 | Core Games 2 | Ludo (4P), Chess (2P) with full rule validation |
| 7 | Snake Multiplayer | Real-time Snake with 2–4 players, mobile D-pad, conflict resolution |
| 8 | Polish \+ Launch | Responsive UI, reconnection, accessibility pass, deployment, load test |

### **Phase 1 — Definition of Done**

* All 5 games playable end-to-end with 2 real browsers on different machines.

* Reconnect tested: kill browser tab mid-game, rejoin within 60s, state restored.

* All Room-level and Game-level error states (Section 9\) are handled and tested.

* Lighthouse accessibility score \>= 85 on all game screens.

* Load test passing: 500 concurrent rooms with \< 100ms p95 latency (see Section 13).

* Zero TypeScript errors in CI; all Zod schemas enforced end-to-end.

* Unit test coverage \>= 80% on packages/game-logic.

## **11.2 Phase 2 — Enhancement (Weeks 9–14)**

| Week | Milestone | Deliverables |
| :---- | :---- | :---- |
| 9–10 | Profiles & History | Optional accounts, session win history, per-player stats dashboard |
| 11–12 | New Games | Checkers, Connect Four |
| 13 | Spectator Mode | Non-player viewers via spectator socket namespace |
| 14 | Social Features | In-room chat, emoji reactions, WhatsApp/link share button |

### **Phase 2 — Definition of Done**

* Spectator socket namespace does not degrade game performance (load tested separately).

* GDPR privacy policy published if user accounts are introduced.

* All new games pass same DoD criteria as Phase 1 games.

## **11.3 Phase 3 — Scale (Weeks 15–20)**

| Week | Milestone | Deliverables |
| :---- | :---- | :---- |
| 15–16 | Tournaments | Bracket-based mini-tournament mode for 4–8 players |
| 17–18 | Custom Rooms | Password-protected rooms, custom rules (timer, board size) |
| 19–20 | PWA | Installable Progressive Web App for iOS and Android |

### **Phase 3 — Definition of Done**

* PWA installable on iOS (Safari) and Android (Chrome) with offline lobby screen.

* Tournament bracket correctly handles bye rounds and concurrent games.

# **12\. Success Metrics**

| Metric | Definition | Phase 1 | Phase 2 |
| :---- | :---- | :---- | :---- |
| Room Creation Rate | Rooms created per day | 50 / day | 200 / day |
| Session Completion | % of games played to end |   \> 70% |   \> 80% |
| Reconnect Success | % of disconnects that rejoin within 60s |   \> 60% |   \> 75% |
| Avg Session Duration | Start → game over |   \> 5 min |   \> 8 min |
| Return Players | Players with 3+ sessions |     20% |     35% |
| WebSocket Latency p95 | Round-trip event time |   \< 100ms |   \< 80ms |
| Mobile Playability | % mobile sessions with no reported issues |   \> 85% |   \> 92% |
| Accessibility Score | Lighthouse a11y on game screens |   \>= 85 |   \>= 90 |

# **13\. Load Testing Plan**

## **13.1 Objectives**

* Verify the 500 concurrent rooms target before Phase 1 launch.

* Confirm WebSocket p95 latency stays under 100ms under load.

* Identify the crash point (rooms at which latency or error rate degrades).

## **13.2 Tooling**

| Tool | Purpose |
| :---- | :---- |
| k6 (Grafana) | WebSocket load simulation — scripted room create \+ move events |
| Redis Monitor | Track Redis memory and ops/sec under load |
| Sentry | Capture errors and stack traces during test |
| Node.js \--inspect | CPU/heap profiling of server under load |

## **13.3 Test Scenarios**

| Scenario | Rooms | Players/Room | Duration | Pass Criteria |
| :---- | :---- | :---- | :---- | :---- |
| Baseline | 50 | 2 | 5 min | p95 \< 50ms, 0 errors |
| Target load | 500 | 3 | 10 min | p95 \< 100ms, error rate \< 0.1% |
| Stress test | 1000 | 4 | 5 min | No server crash; graceful degradation |
| Spike test | 0 → 500 in 30s | 3 | 2 min | Recovery within 60s of spike |
| Snake tick stress | 100 rooms | 4 | 5 min | All ticks delivered; no tick drops |

## **13.4 Schedule**

* First run: End of Week 7 (before polish sprint).

* Final run: End of Week 8 (launch gate — must pass to deploy to production).

* Re-run after any architectural change that touches the Socket.IO or Redis layer.

# **14\. Risks & Mitigations**

| Risk | Prob. | Impact | Mitigation |
| :---- | :---- | :---- | :---- |
| WebSocket drops on mobile (network switching) | High | High | Socket.IO auto-reconnect \+ 60s slot reservation in Redis |
| Client-side move manipulation / cheating | Med | High | All validation server-side; client is a render-only terminal |
| Server overload at peak concurrent rooms | Med | Med | Redis pub/sub \+ horizontal scaling; rate-limit room creation |
| Chess edge case bugs (en passant, promotion) | Low | Med | chess.js handles all rules; 100% unit test coverage on chess logic |
| High-latency player degrading game experience | Med | Med | Latency badge per player; turn timers not paused (fairness preserved) |
| Room code collision | Low | Low | Redis uniqueness check \+ 5 retries before 500 |
| Spectator architecture refactor | Med | Med | spectators array reserved in RoomState from Phase 1 — no breaking change needed |
| GDPR exposure if Phase 2 accounts added | Low | High | Privacy policy \+ GDPR assessment required before accounts launch |
| Redis unavailability (Upstash outage) | Low | High | Circuit breaker on room creation; health check endpoint returns 503 |

# **15\. Out of Scope (v1.0)**

* User authentication and persistent accounts (Phase 2 optional).

* Monetisation, ads, or in-app purchases.

* AI / bot opponents (single-player vs computer).

* Native iOS or Android applications (PWA in Phase 3).

* Voice or video chat integration.

* Game replays or full recorded move history.

* Cross-platform analytics beyond basic session counts.

# **16\. Open Questions**

| \# | Question | Owner | Needed By |
| :---- | :---- | :---- | :---- |
| OQ-01 | Should room codes expire after first game or persist for the whole session? | Product | Week 1 |
| OQ-02 | Guest vs registered account distinction at launch? | Product | Week 2 |
| OQ-03 | If host disconnects permanently, should room host transfer to next player? | Engineering | Week 2 |
| OQ-04 | Animated dice rolls or instant results for Ludo/S\&L? | Design | Week 4 |
| OQ-05 | Chess clock — enabled by default or opt-in? | Product | Week 6 |
| OQ-06 | Should Snake speed scaling be global (fastest player pace) or per-snake? | Engineering | Week 7 |
| OQ-07 | Privacy policy required at Phase 1 launch or only when accounts are added? | Legal | Week 8 |

*End of Document — PlayZone PRD v2.0*