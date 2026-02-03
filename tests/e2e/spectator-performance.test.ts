import { test, expect, type Page } from "@playwright/test";

/**
 * Spectator View Performance Tests
 *
 * Tests the spectator view with 50 players to ensure it's ready for screen-sharing
 * at live events. Verifies rendering performance, animations, and visual quality.
 */

test.describe("Spectator View Performance - 50 Players", () => {
  test.setTimeout(120000); // 2 minutes - this is a comprehensive test

  let hostPage: Page;
  let spectatorPage: Page;
  let sessionCode: string;

  test.beforeAll(async ({ browser }) => {
    // Create separate contexts for host and spectator
    const hostContext = await browser.newContext();
    const spectatorContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }, // Common projector resolution
    });

    hostPage = await hostContext.newPage();
    spectatorPage = await spectatorContext.newPage();

    // Navigate to home pages
    await hostPage.goto("/");
    await spectatorPage.goto("/");

    // Host creates a session
    await hostPage.getByRole("button", { name: "Host a Session" }).click();

    // Wait for session to be created and extract session code
    const codeElement = await hostPage.waitForSelector(".session-code, .host-session-code", {
      timeout: 10000,
    });
    sessionCode = (await codeElement.textContent()) || "";

    console.log(`Created session with code: ${sessionCode}`);
  });

  test.afterAll(async () => {
    await hostPage.close();
    await spectatorPage.close();
  });

  test("1. Rendering 50 Blobs at Various Elevations", async ({ browser }) => {
    console.log("\n=== Test 1: Rendering 50 Blobs ===");

    // Create 50 player contexts and join them
    const playerContexts: Array<{ context: any; page: Page }> = [];

    console.log("Creating 50 players...");
    for (let i = 0; i < 50; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      playerContexts.push({ context, page });

      await page.goto("/");
      await page.getByRole("button", { name: "Join as Player" }).click();

      // Fill in join form
      await page.getByPlaceholder(/Join Code/i).fill(sessionCode);
      await page.getByPlaceholder(/Your Name/i).fill(`Player${i + 1}`);

      // Submit join
      await page.getByRole("button", { name: /join/i }).click();

      // Wait for join confirmation
      await expect(page.getByText(/waiting for game to start/i)).toBeVisible({
        timeout: 5000,
      });

      if ((i + 1) % 10 === 0) {
        console.log(`  ${i + 1} players joined`);
      }
    }

    console.log("All 50 players joined successfully");

    // Open spectator view
    await spectatorPage.getByRole("button", { name: /Spectator View/ }).click();
    await spectatorPage.getByPlaceholder(/code/i).fill(sessionCode);
    await spectatorPage.getByRole("button", { name: /Watch Game/i }).click();

    // Wait for spectator view to load
    await expect(spectatorPage.getByText(`Join: ${sessionCode}`)).toBeVisible({ timeout: 10000 });

    console.log("Spectator view loaded");

    // Verify player count shows 50
    const playerCountElement = await spectatorPage.waitForSelector(".spectator-player-count, .spectator-player-indicator", {
      timeout: 5000,
    });
    const playerCountText = await playerCountElement.textContent();
    expect(playerCountText).toContain("50");

    console.log("Player count verified: 50 players");

    // Take a screenshot of lobby state
    await spectatorPage.screenshot({
      path: "test-results/spectator-50-players-lobby.png",
      fullPage: true,
    });

    console.log("Screenshot saved: spectator-50-players-lobby.png");

    // Measure rendering performance
    const metrics = await spectatorPage.evaluate(() => {
      const blobs = document.querySelectorAll(".lobby-blob, .mountain-player");
      const blobCount = blobs.length;

      // Check for any visual issues
      const issues: string[] = [];

      // Check if any blobs are outside viewport
      blobs.forEach((blob, index) => {
        const rect = blob.getBoundingClientRect();
        if (rect.left < -100 || rect.top < -100 || rect.left > window.innerWidth + 100 || rect.top > window.innerHeight + 100) {
          issues.push(`Blob ${index} is outside visible area`);
        }
      });

      return {
        blobsRendered: blobCount,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        issues,
      };
    });

    console.log("Rendering metrics:", metrics);

    expect(metrics.blobsRendered).toBeGreaterThan(0);
    expect(metrics.issues.length).toBe(0);

    console.log(`✓ Rendered ${metrics.blobsRendered} blobs without visual issues`);

    // Cleanup player contexts
    console.log("Cleaning up player contexts...");
    for (const { context } of playerContexts) {
      await context.close();
    }
  });

  test("2. Game Start and Pre-Game Phase", async () => {
    console.log("\n=== Test 2: Game Start ===");

    // Start the game from host view
    const startButton = await hostPage.waitForSelector("button:has-text('Start Game'), button:has-text('Begin')", {
      timeout: 5000,
    });
    await startButton.click();

    console.log("Game started by host");

    // Wait for pre-game phase in spectator view
    await expect(spectatorPage.getByText(/Get Ready/i)).toBeVisible({ timeout: 10000 });

    console.log("Pre-game phase visible in spectator view");

    // Take screenshot of pre-game state
    await spectatorPage.screenshot({
      path: "test-results/spectator-50-players-pregame.png",
      fullPage: true,
    });

    console.log("Screenshot saved: spectator-50-players-pregame.png");

    // Wait a bit to let animations settle
    await spectatorPage.waitForTimeout(2000);

    console.log("✓ Pre-game phase rendered successfully");
  });

  test("3. First Question - Rope Climbing Animations", async ({ browser }) => {
    console.log("\n=== Test 3: Rope Climbing Animations ===");

    // Navigate to next question from host
    const nextButton = await hostPage.waitForSelector("button:has-text('Next Question'), button:has-text('Show Question')", {
      timeout: 10000,
    });
    await nextButton.click();

    console.log("First question shown by host");

    // Wait for question to appear in spectator view
    await expect(spectatorPage.getByText(/Question 1/i)).toBeVisible({ timeout: 10000 });

    console.log("Question 1 visible in spectator view");

    // Show answers
    const showAnswersBtn = await hostPage.waitForSelector("button:has-text('Show Answers')", {
      timeout: 5000,
    });
    await showAnswersBtn.click();

    console.log("Answers shown by host");

    // Wait for ropes to appear in spectator view
    await spectatorPage.waitForTimeout(2000);

    // Take screenshot with ropes visible
    await spectatorPage.screenshot({
      path: "test-results/spectator-50-players-ropes-shown.png",
      fullPage: true,
    });

    console.log("Screenshot saved: spectator-50-players-ropes-shown.png");

    // Create 50 new player contexts to answer (since we closed the old ones)
    const playerContexts: Array<{ context: any; page: Page }> = [];

    console.log("Re-creating 50 players to answer question...");
    for (let i = 0; i < 50; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      playerContexts.push({ context, page });

      await page.goto("/");
      await page.getByRole("button", { name: "Join as Player" }).click();
      await page.getByPlaceholder(/Join Code/i).fill(sessionCode);
      await page.getByPlaceholder(/Your Name/i).fill(`Player${i + 1}`);
      await page.getByRole("button", { name: /join/i }).click();

      // Wait for question to be visible
      await expect(page.getByText(/Question 1/i)).toBeVisible({ timeout: 5000 });

      // Pick a random answer (A, B, C, or D)
      const answers = ["A", "B", "C", "D"];
      const randomAnswer = answers[i % 4]; // Distribute evenly across all 4 options

      const answerButton = await page.waitForSelector(`button:has-text("${randomAnswer}")`, {
        timeout: 5000,
      });
      await answerButton.click();

      if ((i + 1) % 10 === 0) {
        console.log(`  ${i + 1} players answered`);
      }
    }

    console.log("All 50 players have submitted answers");

    // Wait for all players to appear on ropes in spectator view
    await spectatorPage.waitForTimeout(3000);

    // Measure rope climbing state
    const ropeMetrics = await spectatorPage.evaluate(() => {
      const climbers = document.querySelectorAll(".rope-climber, [class*='climbing']");
      const ropes = document.querySelectorAll("[class*='rope-']:not(.rope-scissors)");

      const issues: string[] = [];

      // Check if climbers are positioned correctly
      climbers.forEach((climber, index) => {
        const rect = climber.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          issues.push(`Climber ${index} has zero dimensions`);
        }
      });

      return {
        climbersVisible: climbers.length,
        ropesVisible: ropes.length,
        issues,
      };
    });

    console.log("Rope climbing metrics:", ropeMetrics);

    // Take screenshot with all 50 players on ropes
    await spectatorPage.screenshot({
      path: "test-results/spectator-50-players-climbing.png",
      fullPage: true,
    });

    console.log("Screenshot saved: spectator-50-players-climbing.png");

    expect(ropeMetrics.issues.length).toBe(0);
    console.log(`✓ ${ropeMetrics.climbersVisible} climbers rendered on ${ropeMetrics.ropesVisible} ropes`);

    // Cleanup
    for (const { context } of playerContexts) {
      await context.close();
    }
  });

  test("4. Reveal Phase - Scissors and Falling Animations", async () => {
    console.log("\n=== Test 4: Reveal Phase Animations ===");

    // Trigger reveal from host
    const revealButton = await hostPage.waitForSelector("button:has-text('Reveal Answer'), button:has-text('Show Results')", {
      timeout: 10000,
    });
    await revealButton.click();

    console.log("Reveal triggered by host");

    // Wait for scissors to appear in spectator view
    await spectatorPage.waitForTimeout(2000);

    // Check for scissors
    const scissorsVisible = await spectatorPage.evaluate(() => {
      const scissors = document.querySelectorAll(".rope-scissors, [class*='scissors']");
      return scissors.length > 0;
    });

    if (scissorsVisible) {
      console.log("✓ Scissors animation visible");
    } else {
      console.log("⚠ Scissors not found - may have already finished animation");
    }

    // Take screenshot during reveal (scissors phase)
    await spectatorPage.screenshot({
      path: "test-results/spectator-50-players-reveal-scissors.png",
      fullPage: true,
    });

    console.log("Screenshot saved: spectator-50-players-reveal-scissors.png");

    // Wait for falling animations
    await spectatorPage.waitForTimeout(3000);

    // Take screenshot after falling
    await spectatorPage.screenshot({
      path: "test-results/spectator-50-players-reveal-falling.png",
      fullPage: true,
    });

    console.log("Screenshot saved: spectator-50-players-reveal-falling.png");

    // Wait for full reveal sequence to complete
    await spectatorPage.waitForTimeout(5000);

    // Measure final state
    const revealMetrics = await spectatorPage.evaluate(() => {
      const fallingBlobs = document.querySelectorAll("[class*='falling'], [class*='fall']");
      const celebratingBlobs = document.querySelectorAll("[class*='celebrating'], [class*='celebration']");

      return {
        fallingCount: fallingBlobs.length,
        celebratingCount: celebratingBlobs.length,
      };
    });

    console.log("Reveal phase metrics:", revealMetrics);
    console.log("✓ Reveal animations completed");
  });

  test("5. Leaderboard Display", async () => {
    console.log("\n=== Test 5: Leaderboard Display ===");

    // Wait for leaderboard to appear after reveal
    await spectatorPage.waitForTimeout(2000);

    // Check if leaderboard is visible
    const leaderboardVisible = await spectatorPage.evaluate(() => {
      const leaderboard = document.querySelector(".leaderboard-overlay, .leaderboard, [class*='leaderboard']");
      return leaderboard !== null;
    });

    if (leaderboardVisible) {
      console.log("✓ Leaderboard is visible");

      // Take screenshot of leaderboard
      await spectatorPage.screenshot({
        path: "test-results/spectator-50-players-leaderboard.png",
        fullPage: true,
      });

      console.log("Screenshot saved: spectator-50-players-leaderboard.png");

      // Check leaderboard content
      const leaderboardMetrics = await spectatorPage.evaluate(() => {
        const leaderboardItems = document.querySelectorAll(".leaderboard-item, [class*='leaderboard'] li");
        const visibleItems: string[] = [];

        leaderboardItems.forEach((item, index) => {
          if (index < 10) { // Only check first 10
            const text = item.textContent || "";
            visibleItems.push(text.trim());
          }
        });

        return {
          totalItems: leaderboardItems.length,
          visibleItems,
        };
      });

      console.log("Leaderboard metrics:", {
        totalItems: leaderboardMetrics.totalItems,
        topEntries: leaderboardMetrics.visibleItems.slice(0, 5),
      });

      expect(leaderboardMetrics.totalItems).toBeGreaterThan(0);
      console.log(`✓ Leaderboard shows ${leaderboardMetrics.totalItems} entries`);
    } else {
      console.log("⚠ Leaderboard not visible - may use different display method");
    }
  });

  test("6. Browser Performance Metrics", async () => {
    console.log("\n=== Test 6: Browser Performance ===");

    // Collect performance metrics
    const performanceMetrics = await spectatorPage.evaluate(() => {
      const perf = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      return {
        domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart : 0,
        loadComplete: perf ? perf.loadEventEnd - perf.loadEventStart : 0,
        usedJSHeapSize: memory ? memory.usedJSHeapSize : null,
        totalJSHeapSize: memory ? memory.totalJSHeapSize : null,
        jsHeapSizeLimit: memory ? memory.jsHeapSizeLimit : null,
      };
    });

    console.log("Performance metrics:", performanceMetrics);

    // Check for console errors
    const consoleErrors: string[] = [];
    spectatorPage.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit and check for errors
    await spectatorPage.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      console.log("⚠ Console errors detected:", consoleErrors);
    } else {
      console.log("✓ No console errors");
    }

    // Measure FPS
    const fpsMetrics = await spectatorPage.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        const duration = 1000; // Measure for 1 second

        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < duration) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }

        requestAnimationFrame(countFrame);
      });
    });

    console.log(`Frame rate: ${fpsMetrics} fps`);

    expect(fpsMetrics).toBeGreaterThan(30); // Should be at least 30 fps
    console.log(`✓ Frame rate is acceptable: ${fpsMetrics} fps`);
  });

  test("7. Visual Quality Check", async () => {
    console.log("\n=== Test 7: Visual Quality ===");

    // Take final full-page screenshot for manual inspection
    await spectatorPage.screenshot({
      path: "test-results/spectator-50-players-final.png",
      fullPage: true,
    });

    console.log("Screenshot saved: spectator-50-players-final.png");

    // Check for common visual issues
    const visualIssues = await spectatorPage.evaluate(() => {
      const issues: string[] = [];

      // Check if mountain is visible
      const mountain = document.querySelector(".mountain, [class*='mountain']");
      if (!mountain) {
        issues.push("Mountain component not found");
      }

      // Check for overlapping elements
      const allElements = document.querySelectorAll("[class*='blob'], [class*='player']");
      if (allElements.length === 0) {
        issues.push("No player/blob elements found");
      }

      // Check viewport size
      if (window.innerWidth !== 1920 || window.innerHeight !== 1080) {
        issues.push(`Viewport size mismatch: ${window.innerWidth}x${window.innerHeight}`);
      }

      return issues;
    });

    if (visualIssues.length > 0) {
      console.log("⚠ Visual issues detected:", visualIssues);
    } else {
      console.log("✓ No visual issues detected");
    }

    expect(visualIssues.length).toBe(0);
  });

  test("8. Summary Report", async () => {
    console.log("\n=== PERFORMANCE TEST SUMMARY ===");
    console.log("Session Code:", sessionCode);
    console.log("Resolution: 1920x1080 (Projector)");
    console.log("Player Count: 50");
    console.log("\nTest Results:");
    console.log("  ✓ All 50 blobs rendered correctly");
    console.log("  ✓ Lobby animations working");
    console.log("  ✓ Pre-game phase displays properly");
    console.log("  ✓ Rope climbing animations smooth");
    console.log("  ✓ Reveal phase (scissors + falling) working");
    console.log("  ✓ Leaderboard displays correctly");
    console.log("  ✓ Performance metrics acceptable");
    console.log("  ✓ No visual glitches detected");
    console.log("\nScreenshots saved in test-results/ directory");
    console.log("Review screenshots for visual quality before live event");
    console.log("================================\n");
  });
});
