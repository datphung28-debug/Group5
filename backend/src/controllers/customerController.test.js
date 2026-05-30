import assert from "node:assert/strict";
import test from "node:test";
import { buildCustomerFilter } from "./customerController.js";

test("buildCustomerFilter defaults to active only", () => {
  const filter = buildCustomerFilter();
  assert.deepEqual(filter, { isActive: true });
});

test("buildCustomerFilter searches customer name and phone", () => {
  const filter = buildCustomerFilter({ search: "Anh" });

  assert.deepEqual(filter, {
    isActive: true,
    $or: [
      { name: { $regex: "Anh", $options: "i" } },
      { phone: { $regex: "Anh", $options: "i" } },
    ],
  });
});
