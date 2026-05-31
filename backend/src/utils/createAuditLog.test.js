import test from "node:test";
import assert from "node:assert/strict";
import AuditLog from "../models/AuditLog.js";
import { createAuditLog } from "./createAuditLog.js";

test("persists normalized audit metadata from req.user", async () => {
  const originalCreate = AuditLog.create;
  let received;
  AuditLog.create = async (payload) => {
    received = payload;
    return payload;
  };
  try {
    await createAuditLog({
      req: {
        user: { _id: "user-1", name: "Dược sĩ An", role: "pharmacist" },
        headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
        get: (header) => (header === "user-agent" ? "Mozilla/5.0" : ""),
      },
      action: "create",
      module: "sale",
      target: "HD001",
      description: "Tạo hóa đơn HD001",
    });
    assert.equal(received.ipAddress, "203.0.113.10");
    assert.equal(received.userAgent, "Mozilla/5.0");
    assert.equal(received.userName, "Dược sĩ An");
    assert.equal(received.userRole, "pharmacist");
    assert.equal(received.status, "success");
    assert.equal(received.action, "create");
    assert.equal(received.module, "sale");
    assert.equal(received.target, "HD001");
    assert.equal(received.description, "Tạo hóa đơn HD001");
  } finally {
    AuditLog.create = originalCreate;
  }
});

test("persists metadata using explicit login user when req.user is absent", async () => {
  const originalCreate = AuditLog.create;
  let received;
  AuditLog.create = async (payload) => {
    received = payload;
    return payload;
  };
  try {
    await createAuditLog({
      user: { _id: "user-2", name: "Admin GPP", role: "admin" },
      req: {
        headers: { "x-forwarded-for": "192.168.1.1" },
        get: (header) => (header === "user-agent" ? "Chrome" : ""),
      },
      action: "login",
      module: "auth",
      target: "admin@pharmacy.com",
      description: "Đăng nhập thành công",
    });
    assert.equal(received.ipAddress, "192.168.1.1");
    assert.equal(received.userAgent, "Chrome");
    assert.equal(received.userName, "Admin GPP");
    assert.equal(received.userRole, "admin");
    assert.equal(received.status, "success");
    assert.equal(received.action, "login");
    assert.equal(received.module, "auth");
  } finally {
    AuditLog.create = originalCreate;
  }
});

test("returns null without throwing when AuditLog.create throws an error", async () => {
  const originalCreate = AuditLog.create;
  AuditLog.create = async () => {
    throw new Error("MongoDB Connection Refused");
  };
  try {
    const result = await createAuditLog({
      req: {
        user: { _id: "user-1", name: "An", role: "pharmacist" },
      },
      action: "create",
      module: "sale",
      target: "HD001",
      description: "Tạo hóa đơn HD001",
    });
    assert.equal(result, null);
  } finally {
    AuditLog.create = originalCreate;
  }
});
