# Remove Mock Data Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove fabricated business and medical data from active routes while keeping unfinished modules behind backlog pages.

**Architecture:** Keep existing API-backed flows unchanged. Extract the Dashboard top-products empty-state decision into a small testable helper, replace prescription safety simulation with a stable empty result, and delete unused fixture records while preserving UI metadata imports.

**Tech Stack:** React 19, Vite, Node test runner, Zustand, Axios, Express, Mongoose.

---

### Task 1: Dashboard Top Products Empty State

**Files:**
- Create: `frontend/src/pages/dashboardTopProducts.js`
- Create: `frontend/src/pages/dashboardTopProducts.test.js`
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] Write a failing Node test that imports `getDashboardTopProducts` and asserts an empty API array remains empty.
- [ ] Run `rtk node --test src/pages/dashboardTopProducts.test.js` from `frontend/` and verify it fails because the helper does not exist.
- [ ] Add `getDashboardTopProducts(products)` returning `products` only when it is an array, otherwise `[]`.
- [ ] Replace the Dashboard hard-coded fallback array with `getDashboardTopProducts(products)`.
- [ ] Render Ant Design `Empty` when the resulting list has no records.
- [ ] Run the focused Node test and verify it passes.

### Task 2: Prescription Safety Empty Contract

**Files:**
- Create: `frontend/src/utils/drugSafety.test.js`
- Modify: `frontend/src/utils/drugSafety.js`

- [ ] Write a failing Node test that passes medicines matching the previous simulated interaction and overdose rules and asserts both result arrays are empty.
- [ ] Run `rtk node --test src/utils/drugSafety.test.js` from `frontend/` and verify it fails because simulated warnings are still returned.
- [ ] Replace the simulated rule database and calculations with a stable `checkPrescriptionSafety()` result of `{ interactions: [], dosageWarnings: [] }`.
- [ ] Run the focused Node test and verify it passes.

### Task 3: Delete Backlog Business Fixtures

**Files:**
- Modify: `frontend/src/pages/activity/activityData.js`
- Modify: `frontend/src/pages/activity/ActivityPage.jsx`
- Modify: `frontend/src/pages/payroll/payrollData.js`
- Modify: `frontend/src/pages/payroll/PayrollPage.jsx`
- Modify: `frontend/src/pages/returns/ReturnsPage.jsx`

- [ ] Delete `ACTIVITY_LOGS`, `PAYROLL_RECORDS`, payroll period/staff fixture options and `RETURN_RECORDS`.
- [ ] Preserve activity and payroll status metadata used by component imports.
- [ ] Remove dead fixture-dependent page code so dormant backlog screens cannot render fabricated records if enabled accidentally.
- [ ] Run `rtk rg -n "ACTIVITY_LOGS|PAYROLL_RECORDS|RETURN_RECORDS|PAYROLL_STAFF_OPTIONS|PAYROLL_PERIOD_OPTIONS" frontend/src` and verify no fixture references remain.

### Task 4: Delete Unused Schedule And Timesheet Fixtures

**Files:**
- Modify: `frontend/src/pages/schedule/scheduleData.js`
- Modify: `frontend/src/pages/schedule/components/ScheduleFilter.jsx`
- Modify: `frontend/src/pages/timesheet/timesheetData.js`
- Modify: `frontend/src/pages/timesheet/components/TimesheetFilter.jsx`
- Modify: `frontend/src/pages/timesheet/TimesheetPage.jsx`

- [ ] Delete unused hard-coded `SCHEDULE_SHIFTS`, `WEEK_DAYS`, timesheet records and staff options.
- [ ] Require active pages to pass API-backed staff options to filters.
- [ ] Preserve existing user changes in `TimesheetPage.jsx`.
- [ ] Run `rtk rg -n "SCHEDULE_SHIFTS|TIMESHEET_RECORDS|STAFF_OPTIONS|WEEK_DAYS" frontend/src/pages/schedule frontend/src/pages/timesheet` and verify no fixture records remain.

### Task 5: Verification And Commit

**Files:**
- Inspect all files changed in Tasks 1-4.

- [ ] Run `rtk node --test src/pages/dashboardTopProducts.test.js src/utils/drugSafety.test.js` from `frontend/`.
- [ ] Run `rtk npm run lint` from `frontend/`.
- [ ] Run `rtk npm run build` from `frontend/`.
- [ ] Run `rtk rg -n "fallback to mock|Mô phỏng Database|ACTIVITY_LOGS|PAYROLL_RECORDS|RETURN_RECORDS|SCHEDULE_SHIFTS|TIMESHEET_RECORDS" frontend/src`.
- [ ] Inspect `rtk git diff --stat` and relevant file diffs.
- [ ] Stage only phase 1 files and commit with `fix(mock-data): remove fabricated frontend records`.
