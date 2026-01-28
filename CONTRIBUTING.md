# Contributing to Robot PU MakeCode Extension

Thanks for your interest in contributing to **pxt-robotpu**.

This repository is a MakeCode extension for BBC micro:bit, and contributions typically fall into these areas:

- Bug fixes and reliability improvements
- New Blocks / API surface (in `main.ts` and supporting code)
- Tutorials and documentation (especially `tutorials/JavaScripts/*.md`)
- Examples and remote-control protocols

---

## Development setup

### 1) Prerequisites

- Node.js (LTS recommended)
- Git

### 2) Get the code

- Fork this repository
- Clone your fork

### 3) Open in MakeCode

MakeCode supports importing extensions by URL.

- Open https://makecode.microbit.org
- Extensions → Import URL
- Paste the URL of your fork (or a branch)

---

## Repository layout

- `main.ts`
  - User-facing **Blocks** wrapper (MakeCode `//%` annotations)
- `robotpu.ts`
  - Core Robot PU implementation (behaviors, state machine, sensors)
- `tutorials/JavaScripts/`
  - JavaScript / TypeScript tutorials and learning path
- `assets/`
  - Images used in READMEs

---

## Contribution types

### Documentation and tutorials

- Tutorials live in `tutorials/JavaScripts/*.md`.
- Prefer a **tutorial style**:
  - clear goals
  - prerequisites
  - step-by-step runnable MakeCode TypeScript
  - tuning/troubleshooting sections

### Blocks / API changes

- The MakeCode blocks surface is defined in `main.ts`.
- Keep blocks:
  - stable and beginner-friendly
  - grouped appropriately (see `//% groups=...`)
  - with safe parameter ranges (`.min/.max/.defl`) when applicable

If you change block IDs or block text, check that:

- tutorials still match the new blocks
- existing projects won’t break unnecessarily

---

## Coding guidelines

- Keep changes focused (avoid unrelated refactors).
- Prefer readability and consistent naming.
- Do not introduce blocking loops in foreground code when a background task is more appropriate.
- Avoid unnecessary allocations inside tight loops.

---

## Testing checklist

Before opening a PR, verify in MakeCode:

- The extension compiles.
- The Blocks render without errors.
- Basic behaviors still work:
  - `walk`, `explore`, `dance`, `rest`
- Remote control forwarding still works:
  - `robotPu.runKeyValueCommand(name, value)`
  - `robotPu.runStringCommand(text)`

If you changed tutorials:

- Copy/paste each provided code snippet into MakeCode and confirm it compiles.

---

## Pull request checklist

- Describe the change and motivation.
- Link any related issues.
- Include screenshots/GIFs for UI or tutorial improvements if helpful.
- Confirm:
  - [ ] Compiles in MakeCode
  - [ ] Blocks are grouped and named clearly
  - [ ] Tutorials (if affected) are updated
  - [ ] No new secrets/keys are committed

---

## Getting help

If you’re unsure where a change should live:

- Blocks/API surface: `main.ts`
- Robot behavior implementation: `robotpu.ts`
- Learning materials: `tutorials/JavaScripts/`
