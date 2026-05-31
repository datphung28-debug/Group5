# Audit Log Design

## Goal

Add database-backed audit logs for selected high-value pharmacy operations and enable the admin activity-history screen with real MongoDB data.

## Scope

The first audit-log release records:

- successful login
- completed sale creation
- import creation
- medicine create, update and soft delete
- category create, update and soft delete
- supplier create, update and soft delete
- staff account create, update and soft lock

Audit coverage for schedules, timesheets, cashbook entries, returns, payroll and report exports is deferred to later module work.

## Architecture

Follow the existing backend structure:

```text
route -> controller -> Mongoose model
```

Add a small audit helper invoked explicitly by controllers after the primary operation succeeds:

```text
controller success -> createAuditLog() -> AuditLog.create()
```

Audit logging is best-effort. If MongoDB cannot persist an audit record, `createAuditLog()` catches the error and logs it with `console.error`. It must not throw or change the successful response of the primary business operation.

Explicit controller calls are preferred over generic middleware or Mongoose hooks because they can record a meaningful target and description without capturing request payloads or sensitive fields.

## Backend Model

Create `backend/src/models/AuditLog.js` with:

- `user`: optional `ObjectId` reference to `User`
- `userName`: required snapshot string
- `userRole`: required snapshot string
- `action`: enum `login`, `create`, `update`, `delete`
- `module`: enum `auth`, `medicine`, `sale`, `inventory`, `supplier`, `user`
- `target`: required short identifier or display name
- `description`: required short Vietnamese description
- `status`: enum `success`, `warning`; default `success`
- `ipAddress`: string
- `userAgent`: string
- timestamps

Add indexes:

- `{ createdAt: -1 }`
- `{ user: 1, createdAt: -1 }`
- `{ module: 1, action: 1, createdAt: -1 }`

Do not store request bodies, passwords, PIN values, JWTs or before/after snapshots.

## Backend Helper

Create `backend/src/utils/createAuditLog.js`.

The helper accepts:

```js
{
  req,
  user,
  action,
  module,
  target,
  description,
  status
}
```

Rules:

- Prefer the explicit `user` parameter for successful login, because `req.user` does not exist before authentication completes.
- Otherwise use `req.user`.
- Snapshot `name` and `role` into the audit row.
- Extract IP from `x-forwarded-for` first, then `req.ip`, then `req.socket.remoteAddress`.
- Extract user-agent from `req.get("user-agent")` or `req.headers["user-agent"]`.
- Catch persistence failures, report them with `console.error`, and return `null`.

## Backend API

Create:

- `backend/src/controllers/activityLogController.js`
- `backend/src/routes/activityLogRoutes.js`

Mount the router in `backend/src/server.js`:

```text
/api/activity-logs
```

Authorization:

- protect all routes
- admin-only read access

Endpoint:

```text
GET /api/activity-logs
```

Supported query parameters:

- `search`: case-insensitive match on `userName`, `target`, `description` or `ipAddress`
- `module`
- `action`
- `startDate`
- `endDate`
- `page`, default `1`
- `limit`, default `20`

Sort newest records first.

Response:

```js
{
  activities,
  total,
  page,
  pages
}
```

Frontend adapter fields:

- `id`: Mongo `_id`
- `timestamp`: formatted from `createdAt`
- `userName`
- `userRole`
- `action`
- `module`
- `target`
- `description`
- `status`
- `ipAddress`
- `device`: derived from `userAgent`

## Controller Integration

Call `createAuditLog()` only after successful persistence:

- `authController.login`
- `saleController.createSale`
- `importController.createImport`
- medicine controller mutations
- category and supplier controller mutations
- user controller mutations

Descriptions are short Vietnamese messages with the affected object code or name. Controllers must never pass `req.body` to the audit helper.

## Frontend

Add `activityLogAPI.getAll(params)` under `frontend/src/api/api.js`.

Enable:

- `/activity` route to render `ActivityPage`
- admin sidebar entry for `/activity`

Update `ActivityPage`:

- load API data on first render
- send applied filters to API
- maintain `loading` and `error`
- compute KPI cards from the returned records on the current page
- render existing table and detail drawer with adapted API rows
- retain Excel and PDF buttons as unimplemented informational actions

Use local page state. A Zustand store is unnecessary because audit data is consumed by one route.

## Error Handling

- API errors display an Ant Design error alert and keep the table empty.
- Empty API data is a valid result and renders the existing empty state.
- Audit write failures never fail login, sales, imports or catalog/user mutations.

## Testing

Backend:

- helper persists normalized metadata
- helper uses explicit login user when `req.user` is absent
- helper returns `null` without throwing when persistence fails
- filter builder creates search, module, action and date filters

Frontend:

- run existing Node tests
- run frontend build
- run lint and compare against the documented baseline errors

Static verification:

- scan audit integration to ensure `password`, `clockInPin`, JWTs and request bodies are never passed to `createAuditLog()`
- inspect Git diff to exclude the existing user-owned PIN edit in `frontend/src/pages/timesheet/TimesheetPage.jsx`

## Out Of Scope

- audit exports
- audit retention cleanup jobs
- before/after snapshots
- request payload capture
- schedule, timesheet and cashbook audit coverage
- return, payroll and drug-safety modules
