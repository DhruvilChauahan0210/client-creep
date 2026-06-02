Output demo.gif

Set Theme "Catppuccin Mocha"
Set Shell "zsh"
Set FontSize 14
Set Width 1200
Set Height 700
Set Padding 20
Set BorderRadius 12
Set WindowBar Rings
Set TypingSpeed 60ms
Set PlaybackSpeed 1

# ── Setup ──────────────────────────────────────────────────
Hide
Type "cd /tmp/dub/apps/web && clear"
Enter
Sleep 300ms
Show

# ── Scene 1: basic run ─────────────────────────────────────
Sleep 600ms
Type "npx client-creep"
Sleep 700ms
Enter
Sleep 4s

# Hold on summary — the shocking numbers
Sleep 2.5s

# Scroll through boundaries + creep section
ScrollDown 4
Sleep 500ms
ScrollDown 4
Sleep 500ms
ScrollDown 4
Sleep 500ms
ScrollDown 4
Sleep 500ms
ScrollDown 4
Sleep 400ms
ScrollDown 4
Sleep 400ms
ScrollDown 5
Sleep 400ms
ScrollDown 5
Sleep 400ms

# Hold on a "why" trace
Sleep 2s

# ── Scene 2: --html ────────────────────────────────────────
Hide
Type "clear"
Enter
Sleep 200ms
Show

Sleep 500ms
Type "npx client-creep --html report.html"
Sleep 700ms
Enter
Sleep 4s

# Hold on the ✓ success line
Sleep 2.5s

# ── Scene 3: --watch ───────────────────────────────────────
Hide
Type "clear"
Enter
Sleep 200ms
Show

Sleep 500ms
Type "npx client-creep --watch"
Sleep 700ms
Enter

# Wait for first scan
Sleep 4.5s

# Hold on the output + "Watching for changes…" line
Sleep 3s

# Exit watch mode
Ctrl+C
Sleep 800ms
