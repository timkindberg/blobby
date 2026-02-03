# Blobby Event Pre-Flight Checklist

A step-by-step guide for running a successful Blobby game event with 50 players.

---

## Before the Event (1-2 Days Prior)

### System Requirements

**Host Computer:**
- Modern computer (Mac, Windows, or Linux)
- Chrome, Firefox, Safari, or Edge browser (latest version recommended)
- Stable internet connection (minimum 10 Mbps upload/download)
- Large display or projector for spectator view (recommended resolution: 1920x1080 or higher)
- External speakers for sound effects (optional but adds to the experience)
- Power adapter to prevent battery drain during event

**Participant Devices:**
- Any smartphone, tablet, or computer with a modern web browser
- Internet connection (WiFi or mobile data)
- No app installation required

### Network Requirements

- Reliable WiFi for all participants
- Test WiFi bandwidth with expected number of devices
- Have backup WiFi network credentials ready (if available)
- Consider mobile hotspot as emergency backup
- Ensure firewall/network allows WebSocket connections (required for Convex real-time sync)

### Question Preparation

1. **Create Questions:**
   - Prepare at least 10-15 questions for a 30-minute game
   - Each question needs:
     - Clear, concise question text
     - 2-5 answer options (3-4 options recommended)
     - One correct answer marked
   - Test questions for clarity and difficulty

2. **Question Guidelines:**
   - Keep questions short (1-2 sentences)
   - Avoid ambiguous wording
   - Make sure options are distinct and clear
   - Mix difficulty levels to keep all players engaged
   - Theme questions for your event/team (inside jokes work great)

3. **Question Format Examples:**
   ```
   Q: What year was the company founded?
   A) 2010  B) 2015  C) 2018  D) 2020
   Correct: C

   Q: Which office has the most employees?
   A) New York  B) London  C) Tokyo
   Correct: A
   ```

### Test Session Recommendations

**Run a complete test session 1-2 days before:**

1. Create a test session in the app
2. Add 3-5 test questions
3. Join with 2-3 test devices (phones, tablets, etc.)
4. Run through the complete flow:
   - Host creates session
   - Players join with code
   - Host starts game
   - Answer questions on player devices
   - Watch spectator view animations
   - Test sound effects (and mute toggle)
   - Complete game and view results

5. Verify:
   - Session join link works
   - All devices can join simultaneously
   - Screen sharing captures spectator view correctly
   - Audio works on host computer
   - Questions display correctly
   - Timer and animations work smoothly

---

## Day of Event (30 Minutes Before)

### Setup Checklist

#### 1. Host Computer Setup (15 minutes before)

1. **Open the Blobby application:**
   - Navigate to your Blobby deployment URL
   - Bookmark it for quick access

2. **Create new session:**
   - Click "Host a Session"
   - Click "Create New Session"
   - Note the 4-letter session code (e.g., "ABCD")

3. **Add questions:**
   - Questions added in "lobby" phase
   - Use the "Add Question" form or import prepared questions
   - For each question:
     - Enter question text
     - Add 2-5 answer options
     - Select correct answer (radio button)
     - Click "Add Question"
   - Reorder questions using up/down arrows if needed
   - Disable questions you want to skip (toggle switch)

4. **Get session join link:**
   - Share the session code: "ABCD"
   - Players join by selecting "Join as Player" and entering the code
   - Display session code prominently (write on whiteboard/slide)

#### 2. Screen Sharing Setup (10 minutes before)

1. **Set up projection:**
   - Connect computer to projector/large display
   - Test that spectator view is visible to all participants
   - The host view shows the mountain with all players' blob avatars

2. **Screen sharing options:**
   - For in-person events: Direct HDMI/display connection
   - For hybrid events: Use Zoom/Teams screen sharing
   - Share entire browser window (not entire screen to avoid distractions)

3. **Optimize display:**
   - Full-screen the browser (F11 on Windows/Linux, Cmd+Ctrl+F on Mac)
   - Zoom browser if needed (Cmd/Ctrl + Plus to enlarge text/UI)
   - Ensure mountain visualization is clearly visible

#### 3. Audio Setup (5 minutes before)

1. **Test sound effects:**
   - Click the mute toggle icon (speaker icon in UI) to unmute
   - Sound effects include:
     - Player join sounds (pop/giggle)
     - Question reveal sound
     - Answer submit sound (boop)
     - Rope cutting sound (snip)
     - Blob reactions (happy/sad)
   - Adjust computer volume to comfortable level

2. **Audio backup:**
   - Have manual "ding" or sound effect ready if technical issues arise
   - Consider muting if sound system has issues (toggle in top-right)

#### 4. Player Join Process (10-15 minutes before game starts)

1. **Share join instructions** (display on screen or verbally):
   ```
   TO JOIN:
   1. Open your phone/device browser
   2. Go to: [YOUR_BLOBBY_URL]
   3. Click "Join as Player"
   4. Enter code: ABCD
   5. Enter your name
   6. Click "Join"
   ```

2. **Monitor player list:**
   - Watch the "Players" section on host view
   - Players appear in real-time as they join
   - You'll see their blob avatars on the mountain (all at 0m elevation)

3. **Troubleshooting during join:**
   - If player can't find the app: Share direct URL via chat/email
   - If join code doesn't work: Double-check code is correct (shown in session header)
   - If player sees "already joined" error: They may have joined previously - use "rejoin" option
   - Maximum capacity: Test with 50+ but be aware of potential network limits

#### 5. Final Pre-Flight Check

- [ ] All expected players have joined
- [ ] Questions are loaded and enabled (check question list)
- [ ] Screen sharing is working and visible to all
- [ ] Audio is tested and at good volume
- [ ] Session code is correct and visible
- [ ] Backup plan reviewed (see Troubleshooting section)

---

## During the Event

### Game Flow Step-by-Step

#### Phase 1: Lobby (Before Game Starts)
- **Host view:** Shows all joined players and their blob avatars at base of mountain
- **Player view:** "Waiting for host to start..." screen with lobby animations
- **Host actions:**
  - Wait for all players to join
  - Review question list one final time
  - When ready, click "Start Game" button

#### Phase 2: Pre-Game (Get Ready)
- **Triggered by:** Host clicks "Start Game"
- **Host view:** Mountain view with all players at base (0m)
- **Player view:** "Get Ready! The climb is about to begin..." screen
- **Host actions:**
  - Wait 3-5 seconds for dramatic effect
  - Click "Next Question" to show first question

#### Phase 3: Question Shown (Question Text Revealed)
- **Triggered by:** Host clicks "Next Question"
- **Host view:** Question text appears with options visible
- **Player view:** Question text appears, "Waiting for host to show answers..."
- **Host actions:**
  - Read the question aloud (optional, builds suspense)
  - When ready for players to answer, click "Show Answers" button

#### Phase 4: Answers Shown (Players Answer)
- **Triggered by:** Host clicks "Show Answers"
- **Host view:**
  - Timer starts when first player answers
  - Shows answer count in real-time
  - Shows players grabbing ropes (climbing animation)
- **Player view:**
  - Answer buttons appear (A, B, C, D)
  - Players tap their choice
  - After answering: "Waiting for results..."
  - Timer shows countdown
- **Host actions:**
  - Wait for most players to answer (monitor answer count)
  - Or wait for timer to expire (default: 30 seconds)
  - When ready, click "Reveal Answer" to show results

#### Phase 5: Revealed (Dramatic Answer Reveal)
- **Triggered by:** Host clicks "Reveal Answer"
- **Host view:**
  - Scissors appear above wrong ropes
  - Wrong ropes cut one by one with animation
  - Correct rope players climb to new elevation
  - Shows elevation gains
- **Player view:**
  - Tension animation (scissors)
  - Results revealed in sync with animation:
    - Wrong answer: "WRONG! +0m" + snip sound + sad blob sound
    - Correct answer: "CORRECT! +100m" + happy blob sound
  - Shows all answer options with correct answer highlighted
- **Host actions:**
  - Let animations complete (3-4 seconds)
  - Enjoy the drama
  - Click "Show Results" to display leaderboard

#### Phase 6: Results (Leaderboard)
- **Triggered by:** Host clicks "Show Results"
- **Host view:** Full mountain view with updated player positions
- **Player view:** Mini leaderboard showing top 5 and player's position
- **Host actions:**
  - Allow 5-10 seconds for players to check standings
  - Click "Next Question" to continue, or "End Game" to finish

#### Repeat Phases 3-6 for Each Question

#### End Game
- **Triggered by:** Host clicks "End Game" or all questions completed
- **Host view:** Final leaderboard with all players
- **Player view:** "Game Over!" with final elevation and full leaderboard
- **Host actions:**
  - Announce winner(s)
  - Celebrate anyone who reached the summit (1000m)

### Host Keyboard Shortcuts
- None currently - all controls are via buttons in the UI
- Use mouse/trackpad to click buttons

### What to Watch For

**Common Issues During Gameplay:**

1. **Player disconnections:**
   - Players can rejoin using their original name and session code
   - Their progress is saved (elevation preserved)
   - Heartbeat system tracks active players

2. **Slow answers:**
   - Timer starts on first answer, not when options shown
   - Fast answers get more elevation (+100m)
   - Slow answers get less (+50m)

3. **No one answering:**
   - Check if players' screens are stuck
   - Ask players to refresh their browser
   - Timer will expire after 30 seconds automatically

4. **Animation lag:**
   - If spectator view stutters, close other browser tabs
   - Check WiFi connection stability
   - Reduce browser zoom if needed

5. **Sound issues:**
   - Use mute toggle (speaker icon) to disable if problematic
   - Individual players can mute on their own devices

---

## Troubleshooting

### Player Can't Join

**Symptoms:** "Game not found" error or join code doesn't work

**Checks:**
1. Verify the session code is correct (case-insensitive)
2. Check that session is in "lobby" status (not finished)
3. Ensure player is using the correct app URL
4. Check player's internet connection
5. Try refreshing the player's browser

**Solutions:**
- Re-share the correct session code
- If session was deleted, create a new one
- Have player clear browser cache and retry

### Spectator View Not Updating

**Symptoms:** Host view frozen, players not appearing, mountain not animating

**Checks:**
1. Check host computer internet connection
2. Look for browser console errors (F12 -> Console tab)
3. Verify Convex backend is running (check for red error messages in UI)

**Solutions:**
- Refresh the host browser page (data persists in database)
- Close other browser tabs to free up resources
- Switch to a different browser if issue persists
- Worst case: Create a new session and have players rejoin

### Player Disconnected Mid-Game

**Symptoms:** Player's device loses connection, app closes, battery dies

**Solutions:**
1. Player reopens the app URL
2. Player will see "Welcome Back!" screen with rejoin option
3. Click "Rejoin as [NAME]" to resume
4. Player's elevation and progress are preserved
5. If rejoin fails, player can "Start Fresh" and rejoin with same name

### Game Stuck - Can't Advance Question

**Symptoms:** "Next Question" button does nothing, game won't progress

**Checks:**
1. Verify all questions are enabled (toggle switches in question list)
2. Check if any browser errors appear (F12 console)
3. Ensure session status is "active"

**Solutions:**
- Refresh host browser
- If stuck on reveal phase, host can manually click through:
  - "Reveal Answer" -> "Show Results" -> "Next Question"
- If completely stuck, use "Back to Editing" button to reset session to lobby
  - WARNING: This resets all player scores to 0m
  - Only use as last resort

### Network/WiFi Issues

**Symptoms:** Players can't connect, frequent disconnections, slow updates

**Prevention:**
- Test WiFi with expected player count beforehand
- Have backup WiFi network ready
- Share mobile hotspot credentials as emergency backup

**Solutions:**
- Ask players to switch to mobile data if available
- Pause game while network issues are resolved
- Consider reducing player count if network can't handle load

### Emergency Recovery Procedure

**If everything breaks and game is unplayable:**

1. **Pause and communicate:**
   - "We're experiencing technical difficulties, give us 2 minutes"

2. **Quick reset:**
   - Host: Click "Back to Editing" (resets to lobby, clears scores)
   - Host: Review questions are still loaded
   - Host: Click "Start Game" again
   - Players: Should automatically reconnect (or refresh their browsers)

3. **Complete restart (last resort):**
   - Host: Create new session
   - Share new session code
   - Players: Join with new code
   - Re-add questions (if lost)
   - Start fresh

### Emergency Contact/Support

**Before event:**
- Identify someone technical on your team who can help troubleshoot
- Have their contact info ready

**During event:**
- Keep this checklist visible for quick reference
- Browser console (F12) can show error messages
- Most issues resolved by refreshing browser

**After event:**
- Report bugs or issues to development team with:
  - Description of what happened
  - Session code
  - Number of players
  - Browser and device info
  - Screenshots if possible

---

## Participant Instructions

**Share this with your team before the event:**

### How to Join Blobby

1. **Open your browser** on your phone, tablet, or computer
   - Works on any device with internet

2. **Go to:** [YOUR_BLOBBY_APP_URL]

3. **Click "Join as Player"**

4. **Enter the 4-letter code** shown on the main screen
   - Example: ABCD
   - Not case-sensitive

5. **Enter your name** and click "Join"
   - Use your real name or a fun nickname
   - Your unique blob avatar will be generated

6. **Wait for the game to start**
   - You'll see other players joining
   - Watch your blob avatar breathe in the lobby

### During the Game

- **Read the question** when it appears on your screen
- **Tap your answer** before time runs out
- **Watch the results** and see if you were right
- **Check your elevation** after each question
- **Climb to 1000m** to reach the summit and win

### Device Tips

- **Keep your screen on** - game lasts 20-30 minutes
- **Good WiFi/data** - you need stable internet
- **Portrait or landscape** - both work
- **Low battery?** - charge beforehand or bring a portable charger
- **Sound effects** - tap the speaker icon to mute your device

### What to Expect

- **Cute blob creatures** - your avatar is unique to your name
- **Real-time updates** - see other players climb as you play
- **Speed matters** - faster correct answers get more elevation
- **No mercy** - wrong answers keep you in place (no falling back)
- **Leaderboard** - check your ranking after each question
- **It's fun chaos** - enjoy the ride

### Troubleshooting for Players

**Can't join?**
- Check the session code is correct
- Try refreshing your browser
- Make sure you're connected to WiFi/data

**Got disconnected?**
- Reopen the app
- You'll see "Welcome Back!" screen
- Click "Rejoin" to continue where you left off

**Screen stuck?**
- Refresh your browser
- Your progress is saved

**Need help?**
- Raise your hand or ask in chat
- Technical support is available

---

## Post-Event Notes

### After the Event

- **Session data persists** - host can view past sessions
- **No automatic cleanup** - sessions stay in database
- **Delete old sessions** - host can manually delete from session list
- **Review questions** - note which questions worked well for next time
- **Gather feedback** - ask players what they enjoyed

### Tips for Next Time

- Questions that are too easy/hard can be adjusted
- Consider timing - 10-15 questions = ~25-30 minutes
- Themed questions increase engagement
- Mix trivia with team-specific inside jokes
- Test beforehand to catch issues early

---

## Quick Reference Card

**Print this section for event day:**

### Session Flow
1. Create session (Host)
2. Players join with code
3. Host: "Start Game"
4. For each question:
   - Host: "Next Question"
   - Host: "Show Answers"
   - Players answer
   - Host: "Reveal Answer" (watch animations)
   - Host: "Show Results" (show leaderboard)
5. Host: "End Game" (when finished)

### Emergency Commands
- **Refresh browser** - fixes most issues
- **Back to Editing** - resets game to lobby (clears scores)
- **Delete session** - nuclear option, start over
- **Mute toggle** - speaker icon (top-right on both host/player)

### Support Checklist
- [ ] Session code visible and correct
- [ ] WiFi credentials ready
- [ ] Backup plan reviewed
- [ ] Technical contact on standby
- [ ] This checklist accessible

---

**Version:** 1.0
**Last Updated:** 2026-01-31

Good luck with your event - have fun climbing!
