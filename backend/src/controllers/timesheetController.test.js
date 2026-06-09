import assert from "node:assert/strict";
import test from "node:test";
import { canManageTimesheetStaff } from "./timesheetController.js";

test("admin can manage timesheets for any staff member", () => {
  assert.equal(
    canManageTimesheetStaff({
      actor: { _id: "admin-1", role: "admin" },
      staffId: "pharmacist-1",
    }),
    true
  );
});

test("pharmacists can only manage their own timesheets", () => {
  assert.equal(
    canManageTimesheetStaff({
      actor: { _id: "pharmacist-1", role: "pharmacist" },
      staffId: "pharmacist-1",
    }),
    true
  );
  assert.equal(
    canManageTimesheetStaff({
      actor: { _id: "pharmacist-1", role: "pharmacist" },
      staffId: "pharmacist-2",
    }),
    false
  );
});
