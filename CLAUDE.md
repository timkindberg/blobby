# Survyay!

A fun real-time survey tool for teams/groups to use during meetings or events. Live questions, audience answers on their phones, points collection, and lots of personality.

## Tech Stack

### Frontend
- **React** - UI library
- **Park UI** - Component library for styling
- **TanStack Start** - Framework if needed, raw React if we don't

### Backend
- **Convex** - Backend-as-a-service with real-time subscriptions (WebSocket-based reactivity built-in)

### Runtime & Tooling
- **Bun** - Runtime (use instead of Node.js for everything)
- **TypeScript** - Strict mode enabled

### Libraries
- **Effect.ts** - For type-safe error handling, services, and composition

## Architecture

### Views
- **Host View** - Create/manage surveys, display questions, show live results
- **Player View** - Join sessions, answer questions, see scores

### Requirements
- Support 50+ concurrent players per session
- Real-time updates (Convex handles this via subscriptions)
- Mobile-friendly player view (phones)

## Project Structure

```
src/
├── index.ts          # Entry point (placeholder for now)
```

## Commands

```bash
bun run build    # Compile TypeScript
bun run dev      # Watch mode
bun run start    # Run compiled app
```

## Development Notes

- Focus on functionality first, styling/animations/personality later
- Convex provides real-time sync out of the box - no manual WebSocket management
- Effect.ts for business logic - embrace the functional style even if it looks unfamiliar at first

## TODO

- [ ] Set up Convex
- [ ] Set up React with TanStack Start or Vite
- [ ] Create host and player views
- [ ] Implement session/room joining
- [ ] Add question/answer flow
- [ ] Add scoring system
