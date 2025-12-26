# test-ui-flow

## Purpose
To verify the UI behaviors of frontend and game modules.

## Trigger
- Pull Request to `main` or `develop`
- Manual dispatch

## Steps
1.  **Setup:**
    - Set up Node.js & .NET environment.
    - Install dependencies with `npm ci`.
2.  **Lint & Type Check:**
    - `npm run lint`
    - `npm run type-check` (tsc --noEmit)
3.  **Unit Tests:**
    - `npm run test:unit` (Vitest)
    - Check the accuracy of game logic (physics, score calculation).
4.  **E2E Tests (Playwright):**
    - Start local server: `npm run dev`
    - Run tests: `npx playwright test`
    - **Scenarios:**
        - User login/guest entry.
        - Selecting a game from the game list.
        - Game loading (rendering of Canvas).
        - A simple game action and score increase.
5.  **Reporting:**
    - In case of error, store Playwright trace file as an artifact.
