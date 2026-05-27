import assert from "node:assert/strict";
import test from "node:test";
import { buildMedicineFilter } from "./medicineController.js";

test("buildMedicineFilter searches medicine name, code, and ingredients", () => {
  const filter = buildMedicineFilter({ search: "para" });

  assert.deepEqual(filter, {
    isActive: true,
    $or: [
      { name: { $regex: "para", $options: "i" } },
      { code: { $regex: "para", $options: "i" } },
      { ingredients: { $regex: "para", $options: "i" } },
    ],
  });
});

test("buildMedicineFilter applies category, prescription, and low-stock filters", () => {
  const filter = buildMedicineFilter({
    category: "category-id",
    requiresPrescription: "true",
    lowStock: "true",
  });

  assert.equal(filter.isActive, true);
  assert.equal(filter.category, "category-id");
  assert.equal(filter.requiresPrescription, true);
  assert.deepEqual(filter.$expr, { $lte: ["$stock", "$minStock"] });
});
