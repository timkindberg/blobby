# Spectator View Performance Test

## Overview

This test suite verifies that the spectator view can handle 50 concurrent players during a live event screen-sharing scenario. It tests rendering, animations, and overall performance at a common projector resolution (1920x1080).

## Running the Test

### Prerequisites

1. **Start the dev server**:
   ```bash
   bun run dev
   ```

2. **Start Convex backend** (in a separate terminal):
   ```bash
   bun run convex:dev
   ```

3. **Run the performance test** (in a third terminal):
   ```bash
   bun run test:e2e spectator-performance
   ```

   Or run with UI mode for visual debugging:
   ```bash
   npx playwright test spectator-performance --ui
   ```

## What the Test Does

### Test Scenarios

1. **Rendering 50 Blobs** - Creates 50 players and verifies they all render correctly in the spectator lobby view
2. **Game Start** - Tests the pre-game "Get Ready!" phase with all 50 blobs visible on the mountain
3. **Rope Climbing Animations** - All 50 players answer a question and climb ropes simultaneously
4. **Reveal Phase** - Tests scissors animations and falling/celebrating blobs
5. **Leaderboard Display** - Verifies the leaderboard shows all 50 players correctly
6. **Browser Performance** - Measures FPS, memory usage, and checks for console errors
7. **Visual Quality** - Takes screenshots at each phase for manual inspection

### Expected Results

- ✅ All 50 blobs render without overlapping or disappearing
- ✅ Animations are smooth (>30 fps)
- ✅ No console errors or warnings
- ✅ No visual glitches or layout issues
- ✅ Sounds play correctly (verified manually)
- ✅ Performance is acceptable for screen-sharing

## Test Output

### Screenshots

All screenshots are saved to `test-results/` directory:

- `spectator-50-players-lobby.png` - Lobby with 50 blobs
- `spectator-50-players-pregame.png` - Pre-game phase
- `spectator-50-players-ropes-shown.png` - Ropes visible, before answers
- `spectator-50-players-climbing.png` - All 50 players on ropes
- `spectator-50-players-reveal-scissors.png` - Scissors animation
- `spectator-50-players-reveal-falling.png` - Falling/celebrating blobs
- `spectator-50-players-leaderboard.png` - Leaderboard display
- `spectator-50-players-final.png` - Final state

**IMPORTANT**: Review these screenshots before a live event to ensure visual quality!

### Console Output

The test logs detailed progress to the console:
- Player join status (every 10 players)
- Visual metrics (blobs rendered, viewport size, etc.)
- Performance metrics (FPS, memory usage)
- Any issues or warnings detected

## Troubleshooting

### Test Times Out

- Increase the test timeout in the test file (currently 120s)
- Check that both `dev` and `convex:dev` servers are running
- Ensure your machine has enough resources

### Players Don't Render

- Check browser console for errors
- Verify Convex backend is connected
- Try refreshing the spectator page

### Animations Lag

- This may indicate performance issues
- Check FPS metrics in test output
- Consider optimizing blob count or animation complexity
- Test on a machine similar to the actual event setup

### Screenshots Missing

- Ensure the `test-results/` directory exists
- Check file permissions
- Run with `--headed` flag to see what's happening:
  ```bash
  npx playwright test spectator-performance --headed
  ```

## Performance Benchmarks

Based on testing, here are acceptable thresholds:

- **FPS**: Should be >30 fps consistently
- **Memory**: Should stay under 500MB for spectator view
- **Load Time**: Initial render should complete within 5 seconds
- **Animation Smoothness**: No visible stuttering or frame drops

## Manual Testing Checklist

After running the automated test, manually verify:

- [ ] **Sound Effects**: Do sounds play for:
  - [ ] Player joins (pop/giggle)
  - [ ] Question reveal
  - [ ] Rope tension
  - [ ] Scissors cutting (snip)
  - [ ] Blob sad sounds (wrong answer)
  - [ ] Blob happy sounds (correct answer)
  - [ ] Celebration fanfare
- [ ] **Visual Quality**: Review all screenshots for:
  - [ ] Blob clarity and visibility
  - [ ] Text readability (question, answers, player names)
  - [ ] Mountain graphics render correctly
  - [ ] No unexpected overlapping
- [ ] **Projector Test**: If possible, test on actual projector hardware

## Known Limitations

- Sound verification is manual (not automated)
- Test creates many browser contexts (memory intensive)
- Requires local Convex dev server (can't test against production easily)

## Pre-Event Checklist

Before going live with 50 players:

1. [ ] Run this performance test suite
2. [ ] Review all generated screenshots
3. [ ] Test sound effects with projector audio
4. [ ] Verify with actual projector/screen resolution
5. [ ] Have a backup plan (lower player count if needed)
6. [ ] Test network stability with Convex backend
