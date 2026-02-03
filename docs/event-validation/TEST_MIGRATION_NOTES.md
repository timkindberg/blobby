# Test Migration Notes - Answer Submission API Change

## Background

The `answers.submit` mutation was changed to implement two-phase scoring:
1. **Answer Phase**: Players submit answers (stored with timestamp and elevation)
2. **Reveal Phase**: Host reveals answer, scoring is calculated with minority bonus

**Old Behavior**:
```typescript
const result = await submit({ questionId, playerId, optionIndex });
// result = { correct: true, elevationGain: 100, newElevation: 100, reachedSummit: false }
```

**New Behavior**:
```typescript
const result = await submit({ questionId, playerId, optionIndex });
// result = { submitted: true }

// Scoring happens later during reveal:
await sessions.revealAnswer({ sessionId });

// Then query the player to see their new elevation:
const player = await players.get({ playerId });
// player.elevation = 100
```

## Tests That Need Updates

### 1. `calculates elevation correctly for fast vs slow answers`
**Location**: `tests/convex/fullSession.test.ts:282`

**Current Issue**:
```typescript
const result1 = await t.mutation(api.answers.submit, { ... });
expect(result1.correct).toBe(true); // ❌ correct is undefined
expect(result1.elevationGain).toBe(100); // ❌ elevationGain is undefined
```

**Fix**:
```typescript
const result1 = await t.mutation(api.answers.submit, { ... });
expect(result1.submitted).toBe(true); // ✅ Check submission acknowledged

// Answer doesn't have score yet - wait for reveal
await t.mutation(api.sessions.revealAnswer, { sessionId });

// Now check the answer record has scoring
const answers = await t.query(api.answers.getByQuestion, { questionId: question._id });
const answer1 = answers.find(a => a.playerId === playerIds[0]);
expect(answer1?.elevationGain).toBe(100); // ✅ Scoring calculated during reveal

// Or check player elevation directly
const player1 = await t.query(api.players.get, { playerId: playerIds[0] });
expect(player1?.elevation).toBe(100); // ✅ Elevation updated
```

### 2. `wrong answers give zero elevation gain`
**Location**: `tests/convex/fullSession.test.ts:319`

**Current Issue**: Same as above - expects immediate scoring.

**Fix**: Same pattern - submit, reveal, then check.

### 3. `poll mode (no correct answer) gives small participation elevation`
**Location**: `tests/convex/fullSession.test.ts:396`

**Current Issue**: Expects `result.correct === null` for poll questions.

**Fix**:
```typescript
const result = await t.mutation(api.answers.submit, { ... });
expect(result.submitted).toBe(true);

await t.mutation(api.sessions.revealAnswer, { sessionId });

// Check elevation gain (10m for poll participation)
const player = await t.query(api.players.get, { playerId });
expect(player?.elevation).toBe(10);
```

### 4. `players can join mid-game`
**Location**: `tests/convex/fullSession.test.ts:490`

**Current Issue**: After late joiner submits answer, test expects elevation > 0 immediately.

**Fix**:
```typescript
await t.mutation(api.answers.submit, {
  questionId: questions[1]!._id,
  playerId: lateJoiner,
  optionIndex: questions[1]!.correctOptionIndex!,
});

// Need to reveal before elevation is updated
await t.mutation(api.sessions.revealAnswer, { sessionId });

// Now check elevation
const player = await t.query(api.players.get, { playerId: lateJoiner });
expect(player?.elevation).toBeGreaterThan(0);
```

### 5. `backToLobby resets all game state`
**Location**: `tests/convex/fullSession.test.ts:539`

**Current Issue**: After players answer, expects elevation > 0 before reveal.

**Fix**:
```typescript
// Play first question
await t.mutation(api.sessions.showAnswers, { sessionId });
for (const playerId of playerIds) {
  await t.mutation(api.answers.submit, { ... });
}

// Reveal answer so elevation is calculated
await t.mutation(api.sessions.revealAnswer, { sessionId });

// NOW verify players have elevation
const leaderboard = await t.query(api.players.getLeaderboard, { sessionId });
expect(leaderboard[0]!.elevation).toBeGreaterThan(0);

// Continue with backToLobby test...
```

### 6. `elevation caps at summit (1000m)`
**Location**: `tests/convex/fullSession.test.ts:717`

**Current Issue**: Expects `result.reachedSummit` and `result.newElevation` from submit.

**Fix**:
```typescript
await t.mutation(api.answers.submit, {
  questionId: questions[i]!._id,
  playerId: playerIds[0]!,
  optionIndex: questions[i]!.correctOptionIndex!,
});

await t.mutation(api.sessions.revealAnswer, { sessionId });
await t.mutation(api.sessions.showResults, { sessionId });

// Check player elevation after reveal
const player = await t.query(api.players.get, { playerId: playerIds[0]! });

// After 10 correct answers (10 * 100 = 1000), should reach summit
if (i >= 9) {
  expect(player?.elevation).toBe(1000);
}

if (i < questions.length - 1) {
  await t.mutation(api.sessions.nextQuestion, { sessionId });
}
```

## Pattern for Future Tests

When testing answer submission and scoring:

```typescript
// 1. Setup: Start game and show question
await t.mutation(api.sessions.start, { sessionId });
await t.mutation(api.sessions.nextQuestion, { sessionId });
await t.mutation(api.sessions.showAnswers, { sessionId });

// 2. Submit answers
const result = await t.mutation(api.answers.submit, {
  questionId,
  playerId,
  optionIndex,
});
expect(result.submitted).toBe(true);

// 3. Reveal answer to trigger scoring
await t.mutation(api.sessions.revealAnswer, { sessionId });

// 4. NOW check scoring results
const player = await t.query(api.players.get, { playerId });
expect(player?.elevation).toBeGreaterThan(0);

// Or check the answer record
const answers = await t.query(api.answers.getByQuestion, { questionId });
const answer = answers.find(a => a.playerId === playerId);
expect(answer?.elevationGain).toBeGreaterThan(0);
```

## Why This Change Was Made

The two-phase system allows:
1. **Minority Bonus**: Can't calculate until all answers are in
2. **Dynamic Cap**: Calculated based on current leader elevation
3. **Better UX**: Reveal answer = calculate scores = single atomic operation
4. **Performance**: Batch scoring for 50+ players at once during reveal

## Status

- ❌ 6 tests need updates in `tests/convex/fullSession.test.ts`
- ✅ New load test (`tests/convex/load-50-players.test.ts`) uses correct pattern
- ✅ System functionality is correct - only tests need updating

## Recommendation

Update the 6 failing tests to follow the new pattern. The fixes are straightforward:
1. Add `revealAnswer` call after answer submissions
2. Query player/answer data to check scoring results
3. Remove expectations of `correct`, `elevationGain`, etc. from submit response

**Estimated Time**: 15-30 minutes to fix all 6 tests.

---

*Notes created during 50-player load test development - 2026-01-31*
