# Validation Findings for 50-Player Live Event

## Date: 2026-01-31
## Event Date: ~5 days from now
## Expected Participants: ~50 people

---

## Critical Analysis (Direct Code Review)

### ⚠️ HIGH PRIORITY - Performance Bottleneck Found

**Location**: `convex/answers.ts` - `getRopeClimbingState` query (lines 430-444)

**Issue**: This query fetches **ALL answers for ALL players across ALL questions**:
```typescript
const allAnswersForPlayers = await ctx.db
  .query("answers")
  .collect();  // 🚨 No filtering!
```

**Impact with 50 players**:
- After 10 questions: 500+ answer records fetched
- After 20 questions: 1000+ answer records fetched
- This query runs on EVERY player view AND spectator view update
- Real-time subscriptions mean this runs frequently

**Why it exists**: To find each player's last answer for maintaining column position between questions

**Recommendation**:
1. Add filtering: `.withIndex("by_player")` for each player individually
2. Or cache last answer optionIndex directly on the player record
3. Test with realistic question count (10-20 questions)

---

### ✅ GOOD - Heartbeat System

**Implementation**:
- Each player sends heartbeat every 5 seconds
- 50 players = 10 mutations/second steady state
- Uses indexes properly
- Has unload detection for immediate disconnect

**Convex Limits Check Needed**:
- Standard plan mutation rate limits
- WebSocket connection limits (52 concurrent: 50 players + spectator + admin)

---

### ✅ GOOD - Answer Submission

**Implementation**:
- Proper race condition protection (checks for existing answer)
- Uses compound index for fast lookups
- Phase-based acceptance (only during "answers_shown")
- Timer validation works correctly

---

### 🔍 TO VERIFY - Concurrent Answer Bursts

**Scenario**: 50 players submit answers within 1-2 seconds
- All hit the `submit` mutation simultaneously
- Need to test database write throughput
- Check for any lock contention

---

## Testing in Progress

6 specialized agents are running comprehensive validation tests:

1. **50-Player End-to-End Test** - Simulating full game with 50 concurrent players
2. **Mobile Compatibility** - Testing on iPhone sizes (375x667, 390x844, 414x896)
3. **Edge Cases** - Late joiners, disconnects, browser refresh, concurrent submissions
4. **Convex Performance** - Rate limits, subscription limits, query performance
5. **Spectator View** - Rendering 50 blobs, animations, frame rate
6. **Event Checklist** - Step-by-step guide for running the live event

*Agents are running in background. Results will be compiled when complete.*

---

## Initial Recommendations

### Before Event Day:

1. **FIX THE CRITICAL BOTTLENECK** - Optimize `getRopeClimbingState` query
   - This could cause lag/timeout with many questions
   - Should be fixed before the event

2. **Load Test** - Run a full game with 50+ simulated players
   - Test with 10-20 questions (realistic game length)
   - Monitor Convex dashboard for errors/throttling

3. **Check Convex Plan** - Verify you're on a plan that supports:
   - 52+ concurrent WebSocket connections
   - 10+ mutations/second sustained
   - Database read/write throughput for 50 players

4. **Prepare Backup Questions** - Have extra questions ready in case you need to extend/adjust

### Day of Event:

1. **Test Session 30 mins before** - Create session, test join flow with 2-3 people
2. **Monitor Admin View** - Watch player count, active status during game
3. **Have Convex Dashboard Open** - Monitor for errors in real-time

---

## Next Steps

Waiting for agent test results to complete comprehensive validation...


---

## Additional Analysis: Real-time Subscription Load

### Subscription Counts Per Client

**PlayerView** (each player): 12 active subscriptions
- checkStoredSession, getByCode, session, player, players, currentQuestion, hasAnswered, results, timingInfo, leaderboard, ropeClimbingState

**SpectatorView**: 7 active subscriptions  
- session, players, currentQuestion, questions, timingInfo, leaderboard, ropeClimbingState

**Estimated Total with 50 Players**:
- 50 players × 12 subscriptions = **600 subscriptions**
- 1 spectator × 7 subscriptions = **7 subscriptions**
- 1 admin × ~10 subscriptions = **10 subscriptions**
- **Total: ~617 concurrent real-time subscriptions**

### Convex Limits to Verify:
- Free tier: Typically 100 concurrent connections
- Pro tier: Typically 1,000+ concurrent connections
- Need to confirm current plan supports 617 subscriptions

### Recommendation:
Check Convex dashboard and current plan limits. May need Pro tier for 50-player events.

