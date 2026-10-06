# .NET + React + EF Core InMemory Visits Dashboard

A full-stack project with an ASP.NET Core Web API backend and a React + Vite + TypeScript frontend.

The backend does **not** require SQL Server. On startup, it reads `backend/visits.csv` and seeds the records into an EF Core InMemory database. API operations then work against that in-memory database rather than modifying the CSV file.

## CSV structure

The current visit entity follows this CSV header exactly:

```text
visit_id,lead_id,customer_name,phone,project,config,visit_at,executive,outcome,next_action
```

## Folder structure

```text
DotNetReactVisitsInMemory/
├── backend/
│   ├── Controllers/
│   │   ├── HealthController.cs
│   │   └── VisitsController.cs
│   ├── Data/
│   │   └── CsvDataSeeder.cs
│   ├── Models/
│   │   └── Visit.cs
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── AppDbContext.cs
│   ├── Program.cs
│   ├── visits.csv
│   ├── appsettings.json
│   └── backend.csproj
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── GlobalLoader.tsx
│   │   ├── context/
│   │   │   └── LoaderContext.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   ├── types/
│   │   │   └── Visit.ts
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── .vscode/
│   ├── launch.json
│   └── tasks.json
│
├── .gitignore
└── README.md
```

## Frontend structure

`main.tsx` mounts `App` and loads the global stylesheet.

`App.tsx` only renders `Router`.

`Router.tsx` owns the application routes and wraps the routes with `LoaderProvider`. New pages/components can be added here as the application grows.

The current route is:

```text
/dashboard
```

Any unknown route redirects to `/dashboard`.

## Loader context

`LoaderContext` provides a shared application-level loader:

- `showLoader()` increments the active request count.
- `hideLoader()` decrements it.
- `isLoading` becomes true while one or more operations are running.

`GlobalLoader` displays a small loading indicator whenever `isLoading` is true.

## Dashboard behavior

The dashboard initially loads the distinct executive names from the visits table.

An executive **must** be selected before dashboard visit data is shown.

Once an executive is selected:

```text
GET /api/visits?executive=<executive>
```

The optional date filter adds:

```text
&date=YYYY-MM-DD
```

For example:

```text
GET /api/visits?executive=Rahul%20Mehta&date=2026-10-07
```

The backend filters by the executive name and the date portion of `visit_at`.

## API endpoints

### Get dashboard visits

```text
GET /api/visits
GET /api/visits?executive={executive}
GET /api/visits?executive={executive}&date={yyyy-MM-dd}
```

### Get distinct executives

```text
GET /api/visits/executives
```

### Get one visit

```text
GET /api/visits/{visit_id}
```

### Update a visit

Updates are identified by `visit_id`:

```text
PUT /api/visits/{visit_id}
```

The route ID and `visit_id` in the request body must match.

Example:

```json
{
  "visitId": 1,
  "leadId": 1001,
  "customerName": "Aarav Sharma",
  "phone": "9876543210",
  "project": "Green Valley",
  "config": "3 BHK",
  "visitAt": "2026-10-07T10:00:00",
  "executive": "Rahul Mehta",
  "outcome": "Interested",
  "nextAction": "Follow-up call"
}
```

## Data lifecycle

```text
backend/visits.csv
       │
       │ application startup
       ▼
CsvDataSeeder
       │
       ▼
EF Core InMemory database (VisitsDb)
       │
       ▼
ASP.NET Core Web API
       │
       ▼
React Dashboard
```

The CSV is the **initial seed/source data**. It is not modified by API updates.

Because the database is in memory, all changes are lost when the backend process stops. On the next startup, the CSV is read again and a fresh in-memory database is created.

## F5 startup

Open the root folder in VS Code and press **F5 → Full Stack (F5)**.

The configured startup flow is:

```text
dotnet clean
    ↓
dotnet restore
    ↓
dotnet build
    ↓
.NET backend starts
    ↓
CSV is loaded into InMemory database
    ↓
Backend becomes ready
    ↓
React/Vite starts
    ↓
Chrome opens the frontend
```

## Prerequisites

- .NET 10 SDK
- Node.js + npm
- VS Code
- C# Dev Kit extension for VS Code

No SQL Server installation or SQL Server database is required.

## Visit update flow

The Visits API follows a controller/service separation:

- `VisitsController` handles HTTP requests and maps service results to HTTP responses.
- `IVisitsService` defines the visits operations.
- `VisitsService` contains filtering, validation, lookup, and update logic.
- `IVisitsService` is registered with scoped lifetime in `Program.cs`.

The dashboard provides an edit action for each visit. The edit modal allows only `outcome` and `next_action` to be changed. Both values are validated in the React UI and validated again by `VisitsService` before the in-memory database is updated. The dashboard then reloads the current executive/date filter.

Allowed outcomes:
- Interested
- Needs time
- Not interested
- No show

Allowed next actions:
- Send price sheet
- Second visit with wife
- Second visit with Family
- Call on Monday
- Call on Tuesday
- Call on Wednesday
- Call on Thursday
- Call on Friday
- Call on Saturday
- Call on Sunday
