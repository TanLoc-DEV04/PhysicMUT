const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  --- Thêm phần cấu hình Coverage ở đây ---
  collectCoverage: true,                 // Bật tính năng thu thập coverage
  coverageDirectory: "coverage",         // Thư mục chứa file báo cáo xuất ra
  coverageReporters: ["lcov", "text"],   // Định dạng xuất ra (lcov cho SonarCloud, text để xem trên terminal)  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",                 // Include tất cả TS/TSX files
    "!src/**/*.d.ts",                    // Exclude type definitions
    "!src/index.ts",                     // Exclude entry point nếu cần
    "!src/**/index.ts",                  // Exclude barrel exports
  ],
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/*.test.ts",
  ],};