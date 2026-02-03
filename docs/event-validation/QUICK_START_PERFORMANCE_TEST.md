# Quick Start: Spectator Performance Test

## TL;DR - Run the Test

```bash
# Terminal 1
bun run dev

# Terminal 2
bun run convex:dev

# Terminal 3
npx playwright test spectator-performance --reporter=list
```

**Duration**: ~2 minutes
**Result**: Screenshots in `test-results/`

## What It Tests

✅ 50 players rendering in spectator view
✅ Lobby animations
✅ Pre-game phase
✅ Rope climbing with all 50 players
✅ Scissors + falling animations
✅ Leaderboard display
✅ Performance metrics (FPS, memory)
✅ Visual quality at 1920x1080

## Success Criteria

- All 8 tests pass ✅
- FPS > 30
- No console errors
- All screenshots look good
- No visual overlapping or glitches

## If It Fails

1. Check both servers are running
2. Try with UI mode: `npx playwright test spectator-performance --ui`
3. Look for errors in browser console
4. Review screenshots in `test-results/`
5. See `PERFORMANCE_TEST_SUMMARY.md` for detailed troubleshooting

## After the Test

1. **Review screenshots** in `test-results/` folder
2. **Test sounds manually** (automated test can't verify audio)
3. **Test on actual projector** if possible
4. **Do a dry run** with real participants

## Common Issues

**Timeout Error**
- Servers not running
- Increase timeout in test file
- Check network connectivity

**Players Not Rendering**
- Convex not connected
- Check Convex dashboard for errors
- Try manually creating a session first

**Low FPS**
- Close other applications
- Try on more powerful machine
- Consider reducing player count

## Full Documentation

- Detailed guide: `tests/e2e/PERFORMANCE_TEST_README.md`
- Complete summary: `PERFORMANCE_TEST_SUMMARY.md`

---

**Need help?** Run with `--headed` to see what's happening:
```bash
npx playwright test spectator-performance --headed
```
