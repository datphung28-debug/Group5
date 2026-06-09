import assert from "node:assert/strict";
import test from "node:test";
import aiRoutes from "./aiRoutes.js";
import cashbookRoutes from "./cashbookRoutes.js";
import importRoutes from "./importRoutes.js";
import reportRoutes from "./reportRoutes.js";

const getRouteHandlerNames = (router, path, method) => {
  const routeLayer = router.stack.find(
    (layer) => layer.route?.path === path && layer.route?.methods?.[method]
  );

  return routeLayer?.route?.stack.map((layer) => layer.handle.name) || [];
};

const getGlobalMiddlewareNames = (router) =>
  router.stack
    .filter((layer) => !layer.route)
    .map((layer) => layer.handle.name);

test("cashbook manual transactions require admin permission", () => {
  const getHandlers = getRouteHandlerNames(cashbookRoutes, "/", "get");
  const postHandlers = getRouteHandlerNames(cashbookRoutes, "/", "post");

  assert.ok(getHandlers.includes("adminOnly"));
  assert.ok(postHandlers.includes("adminOnly"));
});

test("creating import orders requires admin permission", () => {
  const handlers = getRouteHandlerNames(importRoutes, "/", "post");

  assert.ok(handlers.includes("adminOnly"));
});

test("sensitive reports require admin permission", () => {
  assert.ok(getRouteHandlerNames(reportRoutes, "/revenue", "get").includes("adminOnly"));
  assert.ok(getRouteHandlerNames(reportRoutes, "/top-medicines", "get").includes("adminOnly"));
  assert.ok(getRouteHandlerNames(reportRoutes, "/inventory", "get").includes("adminOnly"));
});

test("AI interaction checks require authenticated staff permission", () => {
  const middleware = getGlobalMiddlewareNames(aiRoutes);

  assert.deepEqual(middleware, ["protect", "staffOnly"]);
});
