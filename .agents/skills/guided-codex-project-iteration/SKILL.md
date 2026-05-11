---
name: guided-codex-project-iteration
description: Use when helping the user iteratively modify this project, especially when the task involves planning changes, editing code in small steps, explaining modified files, testing locally, or giving Git/commit guidance.
---

# Guided Codex Project Iteration

## When to use

Use this skill when working on this project with the user in an iterative way: UI tuning, code edits, behavior changes, local testing, or Git guidance.

Use it especially when the user is calibrating a visual result by screenshots or short instructions. Treat their latest screenshot or correction as the source of truth.

## Goal

Help the user make steady, understandable progress without unnecessary rewrites. Preserve what already works, make small changes, explain the reasoning plainly, and keep the project easy to test and commit.

## Workflow

1. Inspect the relevant files before changing code.
2. Identify the smallest useful change that addresses the latest request.
3. Explain briefly what will be changed before editing.
4. Edit only the files needed for the change.
5. Run a local check after meaningful code edits.
6. Summarize what changed and how to verify it.
7. If the user is visually tuning a parameter, make one adjustment at a time and report the exact value changed.

When the user says a visual direction is wrong, do not keep pushing the same assumption. Re-evaluate which coordinate, CSS offset, or transform layer actually controls the visible result.

## Coding rules

- Preserve existing functionality unless the user explicitly asks for a redesign or rewrite.
- Prefer scoped edits over broad refactors.
- Keep existing architecture and naming patterns when possible.
- For visual positioning, distinguish between model-space coordinates, screen-space CSS offsets, and transformed or billboarded elements.
- When a behavior must remain stable, such as an element keeping a fixed relative position while spacing changes, identify and preserve the mechanism that provides that stability.
- Avoid changing multiple visual axes at once unless the user asks for a combined adjustment.

## Explanation style

- Explain important changes in plain language.
- Name the exact file and parameter changed when useful.
- For learning-oriented explanations, describe the cause-and-effect relationship, not just the code diff.
- If a previous assumption was wrong, say so directly and explain the corrected model.
- Keep final summaries concise but concrete.

## Testing checklist

Use the lightest check that matches the change.

- For JavaScript-only edits, run `node --check .\app.js`.
- For HTML/CSS edits, inspect the changed selectors and describe how to verify visually.
- For interactive UI behavior, explain the local manual test path.
- If browser verification is unavailable or blocked, say so and report the checks that were run.

## Git guidance

- Do not commit unless the user asks or clearly wants a checkpoint.
- When committing, check `git status --short` and review the changed file list first.
- Stage only relevant files.
- Use a concise commit message describing the user-visible or structural change.
- After committing, report the commit hash and whether the working tree is clean.
- Do not push to GitHub unless the user explicitly asks.

## What not to do

- Do not perform large rewrites for small visual adjustments.
- Do not combine unrelated cleanup with the requested change.
- Do not hide uncertainty when a visual transform behaves unexpectedly.
- Do not keep tuning the same parameter if screenshots show it does not affect the visible issue.
- Do not push to a remote repository without explicit user permission.
