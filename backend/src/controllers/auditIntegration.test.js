import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const controllers = [
  "authController.js",
  "saleController.js",
  "importController.js",
  "medicineController.js",
  "configController.js",
  "userController.js",
];

test("controllers import and invoke createAuditLog without leaking sensitive data", () => {
  const forbidden = [/req\.body/, /password/, /clockInPin/, /token/i];

  controllers.forEach((file) => {
    const filePath = path.join("src", "controllers", file);
    if (!fs.existsSync(filePath)) {
      assert.fail(`Controller file not found: ${filePath}`);
    }

    const source = fs.readFileSync(filePath, "utf8");

    // Assert that the file imports createAuditLog
    assert.match(
      source,
      /createAuditLog/,
      `${file} should import and use createAuditLog`
    );

    // Assert that no calls to createAuditLog pass forbidden patterns
    const calls = source.matchAll(/createAuditLog\(\{[\s\S]*?\}\)/g);
    for (const match of calls) {
      const block = match[0];
      forbidden.forEach((pattern) => {
        assert.doesNotMatch(
          block,
          pattern,
          `Call block in ${file} leaks forbidden data: ${pattern}`
        );
      });
    }
  });
});
