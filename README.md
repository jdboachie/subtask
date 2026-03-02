# Subtask

![Kanban Board Preview](preview.jpg)

A Kanban task management web app built with Angular, NgRx, and the Angular CDK.

---

## Table of Contents

- [Getting started](#getting-started)
- [Testing](#testing)
  - [Running tests](#running-tests)
  - [Coverage report](#coverage-report)
  - [File naming and organisation](#file-naming-and-organisation)
  - [Test categories](#test-categories)
  - [Writing tests alongside features](#writing-tests-alongside-features)
  - [CI/CD integration](#cicd-integration)

---

## Getting started

```bash
npm install
npm start          # dev server at http://localhost:4200
npm run build      # production build
```

---

## Testing

The project uses [Jest](https://jestjs.io/) via [jest-preset-angular](https://thymikee.github.io/jest-preset-angular/) as its test runner. Karma and Jasmine are not used.

### Running tests

| Command | Description |
|---|---|
| `npm test` | Run all tests once |
| `npm run test:watch` | Re-run tests on file change (interactive) |
| `npm run test:coverage` | Run all tests and generate a coverage report |

Pass any Jest CLI flag after `--` to target a specific file or suite:

```bash
# Run a single spec file
npx jest src/app/ui/board/board.spec.ts

# Run all specs whose path contains "sidebar"
npx jest sidebar

# Run in watch mode for one directory
npx jest --watch src/app/store/
```

### Coverage report

After running `npm run test:coverage`, open the HTML report in a browser:

```bash
# Windows
start coverage/lcov-report/index.html

# macOS / Linux
open coverage/lcov-report/index.html
```

Jest is configured to collect coverage from every `src/**/*.ts` file, excluding spec files and `main.ts` (see `jest.config.js`).

Coverage thresholds to maintain (configured in `jest.config.js`):

| Metric | Minimum |
|---|---|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

To add or tighten thresholds, add a `coverageThreshold` block to `jest.config.js`:

```js
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
},
```

---

### File naming and organisation

#### Spec file location

Every spec file lives **beside the source file it tests**, in the same directory. Do not create a separate `__tests__` folder.

```
src/app/ui/button/
  button.ts
  button.spec.ts         ← unit tests for Button

src/app/ui/board/
  board.ts
  board.spec.ts          ← unit tests for BoardView
  board-view.integration.spec.ts  ← integration tests involving ColumnView + TaskCard

src/app/store/effects/
  auth.effects.ts
  auth.effects.spec.ts   ← async/effect tests
```

#### Naming convention

| File suffix | Use for |
|---|---|
| `*.spec.ts` | Unit tests — a single component, service, reducer, guard, or pipe |
| `*.integration.spec.ts` | Integration tests — multiple real collaborators wired through `TestBed` |

#### `describe` / `it` naming

- The outer `describe` label matches the class or function name: `describe('BoardView', ...)`.
- Nested `describe` groups cover one logical concern: `describe('when board is empty', ...)`.
- `it` labels read as a plain English sentence starting with a verb: `it('renders a task card for each task', ...)`.
- Never describe implementation details in an `it` label — describe observable behaviour.

#### One assertion focus per test

Each `it` block should have a single clear assertion focus. Multiple `expect` calls are fine when they together confirm one behaviour (e.g. checking both sides of a toggle).

---

### Test categories

The suite is divided into five layers, each in a dedicated spec type:

| Layer | Spec suffix | What is tested | Dependencies |
|---|---|---|---|
| **Unit — UI components** | `*.spec.ts` | Inputs, outputs, template bindings, change detection | Store / Router replaced with manual mocks |
| **Unit — Services & reducers** | `*.spec.ts` | Pure logic, localStorage, state transitions | `TestBed` with `provideMockStore` or no module at all |
| **Unit — Async (effects & guards)** | `*.spec.ts` | Observable pipelines, `fetch()` calls, `router.navigate`, `localStorage` side-effects | `provideMockActions`, `firstValueFrom`, `jest.fn()` |
| **Integration** | `*.integration.spec.ts` | Data flow across a real component tree — inputs, outputs, shared signals | Real child components; store driven by `provideMockStore({ initialState })` |

---

### Writing tests alongside features

#### The recommended workflow

1. **Before coding**: write a failing `it` that describes the behaviour you are about to add.
2. **Implement** the minimum code needed to make it pass.
3. **Refactor** with confidence, keeping tests green.

This is the core TDD loop. Even when full TDD isn't practical (e.g. exploratory UI work), aim for **test-alongside**: write the spec in the same commit as the feature code.

#### Practical rules

- Every new Angular component gets a `*.spec.ts` covering at minimum: creation, required inputs, and one meaningful behaviour.
- Every new NgRx action gets a reducer test and, if it has an effect, an effect test.
- Every new guard or pipe gets a unit spec.
- Bug fixes ship with a regression test that would have caught the bug.
- Do not commit code that drops the overall coverage below the thresholds above.

#### What not to test

- Angular framework internals (lifecycle hooks fire, DI resolves).
- Styles or CSS class names — test behaviour and state, not presentation details.
- Private methods directly — test them through their public surface.

---

### CI/CD integration

Automated testing runs on every push and pull request via a GitHub Actions workflow. Add the following file to the repository to enable it:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage -- --forceExit --ci

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/lcov-report/
```

Key points:

- `--ci` tells Jest to fail immediately on the first test suite failure and disables the interactive watch mode.
- `--forceExit` prevents Jest from hanging on open NgRx store subscriptions after all tests complete.
- Coverage artifacts are uploaded so the HTML report can be reviewed without re-running the build.
- Add a [Codecov](https://codecov.io/) or [Coveralls](https://coveralls.io/) step to track coverage trends across PRs and block merges that reduce coverage below the configured thresholds.

#### Blocking merges on failure

In the GitHub repository settings, enable **branch protection rules** on `main`:

- ✅ Require status checks to pass before merging
- ✅ Select the `test` job as a required check
- ✅ Require branches to be up to date before merging

This ensures no code reaches `main` without a fully passing test suite.
