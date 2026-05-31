# Remove Mock Data - Phase 1 Design

## Goal

Prevent active application routes from presenting fabricated business or medical data as if it came from the database. Keep unfinished business modules behind the existing backlog screen until phase 2 adds real persistence and API support.

## Scope

### Dashboard

- Remove the hard-coded top-selling medicine fallback from `Dashboard.jsx`.
- When `/api/reports/top-medicines` returns an empty array, show an empty state in the top-products card.
- Preserve the existing API-backed dashboard KPIs and charts.

### Prescription Safety

- Stop returning hard-coded drug interaction and dosage warnings from `frontend/src/utils/drugSafety.js`.
- Keep the safety-check function contract stable by returning empty `interactions` and `dosageWarnings` arrays.
- Do not present simulated medical warnings as authoritative information.
- Defer database-backed drug safety rules to phase 2.

### Backlog Fixtures

- Remove fabricated business records for activity logs, returns and payroll.
- Preserve UI metadata that is not business data, such as status labels and colors, where components still import it.
- Keep `/activity`, `/returns` and `/payroll` mapped to the existing backlog page. Do not enable unfinished screens.

### Schedule And Timesheet Fixtures

- Remove unused hard-coded schedule records, timesheet records and staff option records.
- Preserve metadata used by active API-backed screens: shift labels, status labels and method labels.
- Do not change the current schedule or timesheet API flows.

## Out Of Scope

- New MongoDB models, routes or controllers.
- Audit logging.
- Return processing, stock restoration or refunds.
- Payroll generation, approval or payment.
- Database-backed drug interaction rules.
- UI redesign or unrelated refactoring.

These belong to phase 2 and require separate schema and workflow design.

## Data Flow

Active screens must follow the existing frontend API pattern:

```text
page -> API client -> Express route -> controller -> Mongoose model -> MongoDB
```

If the database has no records, the UI must show an empty state or zero values. It must not substitute sample records.

## Error Handling

- Preserve existing API error handling.
- Treat an empty top-products response as a valid empty result, not an error.
- Keep prescription safety results empty until real rules exist.

## Testing

- Add a focused test for dashboard top-product normalization or rendering so an empty API response remains empty.
- Add a focused test for prescription safety so it returns no simulated warnings.
- Run frontend lint and build.
- Inspect the final diff and commit only phase 1 files.

## Phase 2 Follow-Up

Design and implement database-backed modules separately:

- activity audit logs
- returns
- payroll
- drug interaction and dosage rules

Each module needs explicit schemas, authorization rules, API contracts and write-side workflows before its frontend route is enabled.
