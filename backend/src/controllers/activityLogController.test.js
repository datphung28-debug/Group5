import test from "node:test";
import assert from "node:assert/strict";
import {
  buildActivityLogFilter,
  adaptActivityLog,
} from "./activityLogController.js";

test("builds correct mongoose filters from query parameters", () => {
  const filter = buildActivityLogFilter({
    search: "An",
    module: "sale",
    action: "create",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
  });

  assert.equal(filter.module, "sale");
  assert.equal(filter.action, "create");
  assert.equal(filter.$or.length, 4);
  assert.ok(
    filter.$or.some(
      (o) => o.userName && o.userName.toString().includes("An")
    )
  );

  assert.equal(
    filter.createdAt.$gte.toISOString(),
    "2026-05-01T00:00:00.000Z"
  );
  assert.equal(
    filter.createdAt.$lte.toISOString(),
    "2026-05-31T23:59:59.999Z"
  );
});

test("adapts database logs into standardized frontend structure", () => {
  const mockActivity = {
    _id: "mongo-id-123",
    createdAt: new Date("2026-05-31T20:10:00.000Z"),
    userName: "Dược sĩ An",
    userRole: "pharmacist",
    action: "create",
    module: "sale",
    target: "HD001",
    description: "Tạo hóa đơn HD001",
    status: "success",
    ipAddress: "203.0.113.10",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  };

  const adapted = adaptActivityLog(mockActivity);

  assert.equal(adapted.id, "mongo-id-123");
  assert.equal(adapted.userName, "Dược sĩ An");
  assert.equal(adapted.userRole, "pharmacist");
  assert.equal(adapted.action, "create");
  assert.equal(adapted.module, "sale");
  assert.equal(adapted.target, "HD001");
  assert.equal(adapted.description, "Tạo hóa đơn HD001");
  assert.equal(adapted.status, "success");
  assert.equal(adapted.ipAddress, "203.0.113.10");
  assert.equal(adapted.device, "Mobile");

  assert.ok(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(adapted.timestamp));
});
