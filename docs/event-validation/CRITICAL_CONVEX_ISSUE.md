# 🚨 CRITICAL: Convex Concurrent Query Limit SHOWSTOPPER

## Event Status: ⛔ BLOCKED - REQUIRES IMMEDIATE ACTION

**Date**: 2026-01-31
**Event in**: 5 days
**Severity**: CRITICAL - Game will not work with 50 players

---

## The Problem

Your application requires **~568 concurrent real-time queries** with 50 players:
- 50 players × 11 subscriptions = 550
- 1 spectator × 8 subscriptions = 8
- 1 admin × 10 subscriptions = 10
- **Total: 568 concurrent queries**

### Convex Limits:
- **Free tier**: 16 concurrent queries ❌
- **Professional tier**: 256 concurrent queries ❌
- **Your needs**: 568 concurrent queries

**The game will fail** when the concurrent query limit is hit. Players will see loading states, updates will stall, and the game will be unplayable.

---

## Required Actions (Priority Order)

### 1. ⚡ IMMEDIATE - Contact Convex Support (TODAY)

Email: support@convex.dev

```
Subject: Urgent: Need concurrent query limit increase for live event

Hi Convex team,

I'm running a live team event in 5 days with ~50 concurrent users using Convex 
for real-time game state. My application needs approximately 568 concurrent query 
subscriptions, but the Professional plan limit is 256.

Can you:
1. Confirm Professional plan can handle this with a limit increase?
2. Increase my concurrent query limit to 600-700?
3. Provide guidance on optimizing if increase isn't possible?

Event date: [5 days from now]
Current plan: [Free/Pro?]
Application: Real-time trivia game (Blobby)

Thank you!
```

### 2. 🔧 Code Optimization - Reduce Subscriptions

**Current**: 11 queries per player
**Target**: 6 queries per player (saves 250 subscriptions)

Merge redundant queries - many are fetching data already in `getRopeClimbingState`:

**In `src/views/PlayerView.tsx`, REMOVE these queries:**
- `players.listBySession` (data in ropeClimbingState)
- `players.getLeaderboard` (only needed in results phase)
- `answers.getResults` (duplicate data)
- `answers.hasAnswered` (derive from ropeClimbingState)
- `answers.getTimingInfo` (already in ropeClimbingState)

This optimization: 50 × 6 = 300 queries + 18 (admin/spectator) = **318 total**

Still over 256, but much better. May work with Convex support increase.

### 3. 💰 Upgrade to Professional Plan

**Cost**: $25/month + usage
**Required**: Minimum to even attempt 50 players
**Action**: Upgrade at convex.dev/dashboard before the event

### 4. 🧪 Load Test (After Optimization)

Before the event:
```bash
# Open Convex dashboard
# Run load test with 50+ browser tabs
# Watch "Concurrent Queries" metric
# Look for rate limit errors
```

---

## Backup Plan

If Convex cannot support 50 players even with optimizations:

**Option A**: Reduce participant count to 20-25 players
- 25 × 6 = 150 queries (within Pro limits)

**Option B**: Hybrid architecture
- Keep Convex for host/admin
- Use simple WebSocket server for player updates
- More work, but guaranteed to scale

**Option C**: Different backend
- Firebase Realtime Database (proven at scale)
- Supabase with WebSockets
- Custom solution with Socket.io

---

## Timeline

**Day 1 (TODAY)**: 
- Contact Convex support
- Upgrade to Professional plan
- Start code optimizations

**Day 2**:
- Complete subscription optimization
- Deploy changes
- Initial load testing

**Day 3**:
- Full load test with 50+ tabs
- Monitor Convex dashboard
- Decide on backup plan if needed

**Day 4**:
- Final testing
- Prepare backup plan materials

**Day 5 (EVENT DAY)**:
- Cross fingers or execute backup plan

---

## Questions for Convex Support

1. Can you increase concurrent query limit to 600-700 for our account?
2. What's the typical turnaround for limit increase requests?
3. Are there alternative architectures you recommend for 50+ concurrent users?
4. What happens when query limit is hit? (Queue? Error? Throttle?)
5. Can we pay for higher limits if standard Pro doesn't suffice?

---

## Reference

Full analysis: See agent output in `/private/tmp/claude/-Users-tim-kindberg-projects-blobby/tasks/ad17e0b.output`

Convex Limits Docs: https://docs.convex.dev/production/state/limits
Convex Pricing: https://www.convex.dev/pricing

