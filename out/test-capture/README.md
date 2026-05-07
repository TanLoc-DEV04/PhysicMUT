# PhysicMUT — Test Capture Screenshots

> Generated: 2026-05-05T20:25:53+07:00

## Danh sách ảnh

| File | Nội dung |
|------|----------|
| `01-playwright-report.png` | Playwright HTML Report — Tổng quan 1 test PASSED |
| `02-playwright-test-detail.png` | Playwright — Chi tiết các test steps (Đăng nhập → Xem Cyclotron) |
| `03-jest-supertest-results.png` | Jest + SuperTest — 11/11 tests PASSED, 3 test suites |
| `04-k6-load-results.png` | K6 Load Test — 2 VUs, 2 phút, 65 iterations, p(95)=5.9ms |

## Kết quả tóm tắt

### ✅ Jest + SuperTest (Integration Tests)
- **Test Suites:** 3 passed / 3 total
- **Tests:** 11 passed / 11 total
- **Thời gian chạy:** 1.456s
- **Files:** auth.api.test.ts, theory.api.test.ts, user.api.test.ts

### ✅ Playwright E2E
- **Test:** 1 passed / 1 total (Project: chromium)
- **Kịch bản:** Người dùng đăng nhập → Xem chi tiết mô hình Cyclotron
- **Thời gian:** 3.1s (total 5.3s)

### ⚠️ K6 Load Test (AI Chatbot)
- **Script:** `tests/load/chatbot-load.js`
- **VUs:** 2 max, 65 iterations, 2 phút
- **Threshold ✅:** `http_req_duration p(95) = 5.9ms` (target: <5000ms)
- **Threshold ✗:** `http_req_failed = 100%` — Bot offline trong lúc test
- **Ghi chú:** Response time của server **RẤT TỐT** (5.9ms p95). Lỗi 100% do AI Bot (port 8000) không chạy khi test.
