# Project Instructions

This project should be modified in small, reviewable steps.

Preserve existing functionality unless the user explicitly asks for a redesign or rewrite. Prefer local, targeted changes over broad refactors.

Explain important changes in plain language because the user is using this project to learn. When behavior is visual or interactive, describe what changed and why it affects the visible result.

After each meaningful change, summarize:

1. files changed
2. what changed
3. how to test locally
4. whether a Git commit is recommended

When iterating on UI placement or visual tuning, make one focused adjustment at a time, report the exact parameter changed, and wait for the next user direction when they are calibrating by sight.

Run an appropriate local check after code edits. For this project, `node --check .\app.js` is a useful minimum check when JavaScript changes.

Use Git locally when requested. Do not push to GitHub unless the user explicitly asks.
