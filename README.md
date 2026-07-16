# Smart Queue & Token Management System (Frontend)

A frontend-only Government Smart Queue & Token Management System built with React + Vite. All data
is currently mocked/simulated locally; the app is structured to drop in a real Express + MongoDB
backend with minimal changes (see `TODO(backend)` comments throughout the codebase).

## Tech Stack

- React 18 + Vite
- React Router DOM (routing, route protection)
- Tailwind CSS (styling, dark mode)
- Zustand (state management + real-time simulation engine, persisted to localStorage)
- TanStack Query (server-state caching around the mock API layer)
- React Hook Form + Zod (form validation)
- Socket.IO Client (wired but not connected — placeholder for future real-time backend)
- Framer Motion (animations)
- Recharts (analytics/reports charts)
- Axios (HTTP client, ready for real API)
- React Hot Toast (toast notifications)
- Lucide React (icons)
- qrcode.react (QR code rendering for tokens)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Citizen | citizen@example.com  | citizen123  |
| Staff   | staff@example.com    | staff123    |
| Admin   | admin@example.com    | admin123    |

Citizens can also self-register from `/register`.

## Key Routes

- `/` — Public landing page
- `/display` — Large public TV display (add `?dept=dept-1` to target a department)
- `/citizen/*` — Citizen dashboard (booking, tracking, history, notifications, profile)
- `/staff/*` — Staff counter dashboard & queue monitor
- `/admin/*` — Admin dashboard, department/service/counter management, analytics, reports

## Simulated Real-Time Behavior

Since there's no backend yet, `src/store/queueStore.js` acts as the single source of truth for
queue state and includes a timer-based simulation (`startAutoSimulation`) that injects new "walk-in"
tokens periodically so dashboards and the public display feel live. Components subscribe to this
store directly or via the `useLiveQueue` hook.

## System Behavior Notes

- **Catalog store** (`src/store/catalogStore.js`) holds departments/services as mutable state.
  Admin CRUD (Departments, Services, Token Limits & Service Timings pages) writes here, and the
  booking flow, queue engine, staff views, and public display all read from it — so admin changes
  take effect immediately app-wide.
- **Conflict-free token allocation**: `queueStore.createToken` uses a per-department, per-day
  monotonic sequence (`dailySequences`) to guarantee two simultaneous bookings never collide.
- **Daily token limits & service timings**: enforced in `createToken` (throws once a department's
  `tokenLimit` is hit) and in the citizen slot picker (respects each department's configured
  `operatingHours`).
- **Wait-time prediction**: `getEstimatedWaitMins` derives an estimate from queue position, average
  service duration, and the number of currently active counters for that department.
- **Notifications**: `notificationStore` is recipient-scoped (`recipientId`/`recipientRole`) and
  simulates SMS/Email/push channels as metadata on each entry. `queueStore` triggers notifications
  for: token confirmation, approaching-turn (top 3 in queue), delays (counter paused), counter
  reassignment, and being called to a counter.
- **Exception handling**: staff can mark a called token as **No Show**; admins can **Expedite** a
  waiting token (escalates it to emergency priority) or reassign it to a different counter via
  `queueStore.reassignTokenCounter`.
- **Reports**: `getAverageWaitMinutes`, `getTokensServedPerCounter`, and `getPeakHoursHistogram`
  power the Reports page (average wait time, tokens served per counter, peak hours).
- **Multiple offices**: `src/mock/offices.js` + each department's `officeId` demonstrate how the
  same catalog/queue engine scales to multiple physical locations.

## Backend Integration Path

Search the codebase for `TODO(backend)` to find every seam intended for replacement:

- `src/services/httpClient.js` — Axios instance ready for a real API base URL
- `src/services/socketClient.js` — Socket.IO client, not yet connected
- `src/services/*Service.js` — mock functions to swap for real REST calls
- `src/store/authStore.js` — simulated auth to replace with JWT/session-based auth
- `src/store/queueStore.js` — in-memory queue mutations to replace with API calls + socket events

Copy `.env.example` to `.env` and populate `VITE_API_BASE_URL` / `VITE_SOCKET_URL` once the backend
exists.

## Folder Structure

```
src/
├── assets/
├── components/       # ui/, shared/, citizen/, staff/ component groups
├── constants/        # roles, token status, navigation config
├── hooks/            # React Query hooks, useAuth, useLiveQueue
├── layouts/          # Citizen/Staff/Admin/Auth layouts
├── lib/              # queryClient
├── mock/             # seed data (departments, services, counters, users)
├── pages/            # route-level pages grouped by role
├── routes/           # AppRouter, ProtectedRoute
├── services/         # mock + real API clients
├── store/            # Zustand stores (auth, queue, notifications, ui)
└── utils/            # cn, date helpers, token generator
```
