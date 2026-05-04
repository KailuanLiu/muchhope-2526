/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/src/routes/__tests__/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/database/__tests__/"],
  // Run serially to avoid port conflicts with supertest
  maxWorkers: 1,
};
