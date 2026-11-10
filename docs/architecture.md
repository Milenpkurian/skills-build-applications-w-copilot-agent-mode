# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Implement the data and service contracts first, then connect the presentation tier to those stable API responses. Keep the existing ports, relative `/api` requests, and separation of presentation, logic, and data responsibilities.

- Presentation tier decision: Use the shared frontend API client for relative `/api` requests. Each capability view owns its loading, empty, success, and accessible error states, and renders the contract fields without embedding API or persistence logic.
- Logic tier decision: Implement validation and capability behavior in the backend service layer, with Express routes translating expected validation and not-found failures into deliberate 4xx responses. Keep persistence details out of the React tier.
- Data tier decision: Add required fields, types, defaults, and references to the existing Mongoose models. Preserve unrelated records when seeding, link seeded users and teams consistently, and make repeated seeding idempotent.
- Activity tracking approach: Validate request fields and well-formed existing user/team IDs before writing. Store the supplied user, team, type, and minutes with computed points and an occurrence date; reject invalid input without allowing Mongoose cast errors to become 500 responses.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot, and default members to an empty array. Create and list teams through the service layer with member IDs exposed in API responses.
- Leaderboard approach: Aggregate activity points by team, sort totals descending, and return each team name, total points, and a 1-based rank.
- Workout suggestions approach: Find the user by email, use their fitness goal and recent activity to choose relevant workouts, and return a reason for the recommendation. Return a deliberate 4xx response if no user matches.

## Test plan

Run the contract tests and production builds for all tiers before merging. The final verification results are:

- Data tier — `npm run test:data --prefix octofit-tracker/backend`: **5 passed.**
- API — `npm run test:api --prefix octofit-tracker/backend`: **4 passed.**
- Presentation — `npm test --prefix octofit-tracker/frontend`: **15 passed.**
- Backend build — `npm run build --prefix octofit-tracker/backend`: **passed** (`tsc --noEmit`).
- Frontend build — `npm run build --prefix octofit-tracker/frontend`: **passed** (`tsc --noEmit` and `vite build`).
- Integration — seeded MongoDB data was returned successfully by all four API endpoints and displayed in each frontend journey. The frontend's accessible error state was also verified with a simulated `503` response.
