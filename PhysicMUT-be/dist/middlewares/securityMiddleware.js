"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedOrigins = exports.globalErrorHandler = exports.globalRateLimiter = exports.contentRateLimiter = exports.authRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// ──────────────────────────────────────────────────────────────────────────────
// 1. RATE LIMITERS
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Rate Limiter cho Auth endpoints (login, register, forgot-password).
 * Giới hạn 10 request / 15 phút / IP → chống brute-force mật khẩu.
 */
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Bạn đã thử quá nhiều lần. Vui lòng đợi 15 phút và thử lại.",
    },
    skip: (req) => process.env.NODE_ENV === "test",
});
/**
 * Rate Limiter cho Content API (models, theories, examples, exercises).
 * Giới hạn 200 request / 15 phút / IP → chống scraping.
 */
exports.contentRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
    },
});
/**
 * Rate Limiter chung (fallback) áp dụng cho toàn bộ API.
 * Giới hạn 500 request / 15 phút / IP.
 */
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau 15 phút.",
    },
});
// ──────────────────────────────────────────────────────────────────────────────
// 2. GLOBAL ERROR HANDLER
// Che giấu stack trace và thông tin nội bộ khỏi client ở môi trường production.
// Chỉ ghi log chi tiết trên server, trả về message chung chung cho người dùng.
// ──────────────────────────────────────────────────────────────────────────────
const globalErrorHandler = (err, req, res, _next) => {
    // Luôn log đầy đủ thông tin lỗi ở server để admin debug
    console.error(`[${new Date().toISOString()}] Lỗi Server Nội Bộ:`, {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });
    const isProduction = process.env.NODE_ENV === "production";
    if (res.headersSent) {
        return;
    }
    const statusCode = err.status ?? err.statusCode ?? 500;
    res.status(statusCode).json({
        error: isProduction
            ? "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau." // Production: ẩn chi tiết
            : err.message, // Development: hiện message để debug
    });
};
exports.globalErrorHandler = globalErrorHandler;
// ──────────────────────────────────────────────────────────────────────────────
// 3. CORS ALLOWED ORIGINS
// Danh sách domain được phép gọi API (tránh mở wildcard "*" ở production).
// ──────────────────────────────────────────────────────────────────────────────
const getAllowedOrigins = () => {
    const base = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://physic-mut.vercel.app",
    ];
    const productionOrigin = process.env.FRONTEND_URL;
    if (productionOrigin) {
        base.push(productionOrigin);
    }
    return base;
};
exports.getAllowedOrigins = getAllowedOrigins;
//# sourceMappingURL=securityMiddleware.js.map