# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR (http://localhost:5173)
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint + TypeScript check + Prettier format check
npm run format    # Auto-format code with Prettier
npm run preview   # Serve production build locally
```

**Integration test** (requires a running server):

```bash
./tests/integration-test.sh <URL>
```

There is no unit test framework configured. Type checking and linting serve as the primary static validation (`npm run lint`).

## Architecture

**jettison-ui** is a React 18 + TypeScript SPA that visualizes CI/CD workflow execution as interactive DAG graphs. The backend pushes real-time updates via WebSocket.

### Data Flow

```
WebSocket → FlowWebSocket → ResourceEventHandler → Context Providers → Components
```

1. A single WebSocket connection (`src/providers/flowWebSocket.ts`) receives `ResourceList` messages from the backend.
2. `ResourceEventHandler` (`src/providers/resourceEventHandler.ts`) parses and merges updates into typed state maps.
3. Context providers in `src/providers/provider.tsx` hold the canonical state and distribute it.
4. Components read from contexts via `useContext()` — no global state library (Redux, Zustand) is used.

### State Shape

State is organized as nested maps for O(1) lookup:

```
Map<namespace, Map<name, Resource>>
```

Resources include: flows, applications, workflows, pods, container logs.

### Key Type Patterns

- **Discriminated unions** for `Step` types: `DockerBuildTestStep | DockerBuildTestPublishStep | ArgoCDStep`
- **Discriminated unions** for `Trigger` types: `GitHubPullRequest | GitHubPush`
- **`FlowMemo`** interface augments server data with client-computed fields (e.g., `isPrFlow`), computed once in `resourceEventMemo.ts` and stored alongside immutable server data

### Graph Visualization

`src/components/flow/graph/` uses `@dagrejs/dagre` to compute DAG layouts rendered as SVG. Trigger and step nodes are separate component types under `graph/nodes/`.

### Routing

React Router v7. Key routes defined in `src/routes.ts`:

- `/` — Home dashboard
- `/repos` — Repository list
- `/flows/:repoOrg/:repoName/:triggerRoute` — Flow visualization
- `/flows/:repoOrg/:repoName/:triggerRoute/workflows/:selectedWorkflow` — With workflow selected
- `/flows/:repoOrg/:repoName/:triggerRoute/workflows/:selectedWorkflow/:nodeName` — Node details

### Important Source Files

| File                                            | Role                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `src/main.tsx`                                  | React root, router setup, provider wrapping                               |
| `src/providers/provider.tsx`                    | All context definitions and WebSocket message dispatch                    |
| `src/providers/resourceEventHandler.ts`         | Parses WebSocket messages, merges into state                              |
| `src/components/flow/Flow.tsx`                  | Main flow page orchestrating graph + history                              |
| `src/components/flow/graph/graph/FlowGraph.tsx` | Dagre SVG graph rendering                                                 |
| `src/localState.ts`                             | localStorage wrapper for UI preferences (timestamp display, recent repos) |

### Deployment

Multi-stage Docker build: Node 24 (build) → Ubuntu (integration test) → Nginx 1.25.5 (serve). Nginx config in `rootfs/etc/nginx/` handles SPA routing (404 → index.html) and proxies `/ws` and `/api` to `jettison-api-service:2846`.
