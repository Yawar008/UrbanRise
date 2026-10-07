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
├── Backend.Tests/
│   ├── Backend.Tests.csproj
│   └── VisitsServiceTests.cs
├── .vscode/
│   ├── launch.json
│   └── tasks.json
│
├── .gitignore
├── README.md
└── run.ps1
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
  "outcome": "Interested",
  "nextAction": "Send price sheet"
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


## Phone number masking

The dashboard visits endpoint masks phone numbers before returning them from the backend. Only the last four digits are exposed.

For example:

```text
9876543210 → ******3210
```

The masking is applied to the API result and does not modify the underlying in-memory database value. The CSV download continues to export the current in-memory data.

## Automated backend test

The `Backend.Tests` project contains an xUnit test for `VisitsService.GetVisitsAsync()`.

The test uses a separate EF Core InMemory database and verifies that:

- the executive filter is applied;
- the date filter is applied;
- the expected visit is returned;
- phone-number masking is applied.

Run the backend tests with:

```powershell
dotnet test Backend.Tests/Backend.Tests.csproj
```

## One-command setup and run

On Windows PowerShell, from the project root, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

`run.ps1` restores the backend/test dependencies, installs the frontend dependencies with `npm ci`, starts the ASP.NET Core backend, waits for it to become available on port `7043`, and then starts the React/Vite frontend.

Press `Ctrl+C` to stop the frontend. The script also stops the backend process.

## What I would test next

1. **UpdateVisitAsync with valid data** — verifies that allowed outcome/next-action values are persisted correctly.
2. **UpdateVisitAsync with invalid values** — verifies that invalid user input is rejected and the existing visit remains unchanged.
3. **UpdateVisitAsync for a missing visit ID** — verifies the expected not-found behavior.
4. **GenerateCsvAsync after an update** — verifies that the downloaded CSV contains the latest in-memory values and the correct headers.
5. **GetVisitsAsync without filters and with boundary dates** — verifies unfiltered behavior and prevents date/time boundary regressions.
