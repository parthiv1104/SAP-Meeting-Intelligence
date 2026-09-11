# ProjectIQ — SAP Project & Meeting Intelligence

A frontend prototype for an enterprise SaaS platform that helps SAP consulting
teams prepare for client meetings, track questions, and maintain a living
knowledge base for each engagement.

This is a **frontend-only prototype**. All data is mocked in
`src/data/mockData.js` and served through a thin async service layer in
`src/services/`, designed so each service method can later be swapped for a
real call to a Django REST API without touching any component code.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Recharts (charts)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    layout/       Sidebar, Topbar, AppShell, ProjectContextBar, search, notifications
    ui/            Button, Card, Badge, Modal, Tabs, Table, Dropdown, Skeleton, Toast, etc.
    dashboard/     MetricCard, InsightCard, RecentActivityList
    projects/      ProjectCard
    meetings/      MeetingCard
    questions/     RecommendedQuestionCard, PriorityBadge
    knowledge/     KnowledgeCard
  pages/           One file per route (Dashboard, Projects, Meetings, ...)
  pages/project/   Tabs nested under /projects/:id (Overview, Team)
  data/            mockData.js -- all realistic SAP consulting mock data
  services/        projectService, meetingService, questionService, ... (mock API layer)
  hooks/           useToast (toast notification context)
```

## Routing

```
/dashboard
/projects            /projects/new            /projects/:id
/projects/:id/team   /projects/:id/meetings   /projects/:id/questions
/projects/:id/knowledge   /projects/:id/requirements
/projects/:id/decisions   /projects/:id/documents

/meetings            /meetings/:id
/meetings/:id/preparation   /meetings/:id/live   /meetings/:id/analysis

/questions           /questions/:id
/questions/faq       /questions/missed        /questions/frequently-missed

/knowledge           /knowledge/timeline
/requirements        /decisions               /documents
/reports             /analytics               /settings
```

## Connecting a real backend later

Each file in `src/services/` currently wraps static data from
`src/data/mockData.js` in a `mockResolve()` helper that simulates network
latency and returns a Promise. To connect a Django REST API:

1. Replace the body of each service method with a `fetch()`/`axios` call to
   the corresponding endpoint.
2. Keep the same method names and return shapes -- components already consume
   these services through `useEffect` + `useState`, so no component changes
   are required as long as the response shape matches the mock data shape.
3. Add authentication (JWT/session) handling inside the service layer or a
   shared API client, then remove the `currentUser` mock in `mockData.js`.

## What's intentionally out of scope

Per the brief, this phase does **not** include: a real backend, real
authentication, real AI/LLM calls, or real Microsoft Teams/Graph integration.
All "AI" recommendations, confidence scores, and historical pattern
detection are realistic mock data meant to validate the UX before wiring up
a real intelligence pipeline.
