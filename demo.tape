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

Hide
Type "cd /tmp/dub/apps/web && clear"
Enter
Sleep 500ms
Show

Sleep 800ms

# Scene 1: basic run — shocking summary
Type "npx client-creep"
Sleep 800ms
Enter
Sleep 4s

# Hold on summary numbers
Sleep 2.5s

# Scroll through boundaries
ScrollDown 3
Sleep 500ms
ScrollDown 3
Sleep 500ms
ScrollDown 3
Sleep 500ms
ScrollDown 3
Sleep 500ms

# Hold on a boundary with its deps
Sleep 1.5s

# Scroll to creep section
ScrollDown 5
Sleep 400ms
ScrollDown 5
Sleep 400ms
ScrollDown 5
Sleep 400ms
ScrollDown 5
Sleep 400ms

# Hold on a "why" trace
Sleep 2.5s

# Scene 2: --html flag
Hide
Type "clear"
Enter
Sleep 300ms
Show

Sleep 600ms
Type "npx client-creep --html report.html"
Sleep 800ms
Enter
Sleep 4s

# Hold on the success message
Sleep 2s

# Open the file
Type "open report.html"
Sleep 500ms
Enter
Sleep 2s
