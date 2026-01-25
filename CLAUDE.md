# Survyay!

A fun real-time survey/quiz game for teams and events. Players climb a mountain by answering questions correctly - pick the right rope to ascend, pick wrong and watch it get cut!

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Park UI** - Component library for styling (planned)

### Backend
- **Convex** - Backend-as-a-service with real-time subscriptions (WebSocket-based reactivity built-in)

### Runtime & Tooling
- **Bun** - Runtime (use instead of Node.js for everything)
- **TypeScript** - Strict mode enabled

### Libraries
- **Effect.ts** - For type-safe error handling, services, and composition (planned)

## Game Design: Mountain Climb

### Core Concept
Players are blob creatures racing to climb a mountain. Each question = choosing a rope to climb. Correct answers ascend, wrong answers get their rope cut and stay put.

### Mechanics

#### Elevation System
- Players have continuous **elevation** (0 to 1000m) instead of discrete levels
- Mountain has visual **checkpoints/camps** every ~100m for clustering
- Speed of correct answer determines elevation gain:
  - Fast correct answer: +100m
  - Slow correct answer: +50m
  - Wrong answer: +0m (stay in place)

#### Question Flow
1. Question appears → ropes drop down (one per answer option)
2. Players pick a rope → their blob starts climbing
3. Early pickers climb higher on the rope (visual tension)
4. Timer runs out OR everyone answers → **REVEAL**
5. Correct rope: climbers complete ascent (elevation gain based on speed)
6. Wrong ropes: **SNIP** ✂️ → blobs fall back to their current elevation
7. Repeat until someone summits (1000m)

#### Catch-up Rules
- No mercy mode: Players stay where they are. Pure skill/speed wins.

### Visual Design

#### Blob Creatures (Player Avatars)
- Procedurally generated from player name (deterministic)
- Variables: body shape (round, tall, wide), color palette, eye style, tiny accessories
- SVG-based for crisp scaling and smooth animation

#### Host Screen (Screen-shared at events)
- Full chaos mode - blobs constantly moving, bouncing, climbing
- Shows top 2-3 elevation ranges, or zooms out as players spread apart
- Dramatic rope-cutting animations
- Celebrations when players reach checkpoints

#### Player Screen (Phones)
- Reactive chaos - calmer normally, bursts of activity on events
- Shows player's current elevation + ~150m above
- Can see nearby climbers
- Focused on their own rope choice and progress

#### Sound Design
- Tiny squeaks on movement/collision
- "Boop" on answer submit
- Rope tension sounds while climbing
- SNIP sound effect for wrong answers
- Celebration sounds for correct answers
- Gibberish voice clips for reactions (Animal Crossing / Minion style)
- Global mute toggle

## Architecture

### Views
- **Host View** - Create/manage sessions, display questions, show mountain with all climbers
- **Player View** - Join sessions, answer questions, see personal progress on mountain

### Requirements
- Support 50+ concurrent players per session
- Real-time updates (Convex handles this via subscriptions)
- Mobile-friendly player view (phones)
- Smooth animations at 60fps

## Project Structure

```
src/
├── main.tsx              # Entry point with Convex provider
├── App.tsx               # Mode selection (host/player)
├── index.css             # Global styles
├── vite-env.d.ts         # Vite types
└── views/
    ├── HostView.tsx      # Host session management
    └── PlayerView.tsx    # Player join and gameplay

convex/
├── schema.ts             # Database schema
├── sessions.ts           # Session CRUD and state management
├── players.ts            # Player join, scores, elevation
├── questions.ts          # Question CRUD
└── answers.ts            # Answer submission and scoring
```

## Commands

```bash
bun run dev          # Start Vite dev server
bun run convex:dev   # Start Convex dev server
bun run build        # Production build
bun run preview      # Preview production build
```

## Development Notes

- Convex provides real-time sync out of the box - no manual WebSocket management
- `convex.json` configures `VITE_CONVEX_URL` env var for Vite compatibility
- Players can join mid-game (only blocked when session is "finished")
- Blob generation should be deterministic (same name = same blob every time)

## TODO

- [x] Set up Convex schema and functions
- [x] Set up React with Vite
- [x] Create basic host and player views
- [x] Implement session/room joining
- [x] Add question/answer flow
- [x] Add scoring system
- [ ] Replace points with elevation system
- [ ] Create blob creature avatar generator
- [ ] Build mountain visualization component
- [ ] Add rope climbing animations
- [ ] Implement rope cutting animation
- [ ] Add sound effects system
- [ ] Polish host view (full chaos mode)
- [ ] Polish player view (reactive chaos)
- [ ] Add checkpoints/camps visual markers
