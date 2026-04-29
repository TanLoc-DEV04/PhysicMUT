import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// ──────────────────────────────────────────────────────────────────────────────
// 1. RATE LIMITERS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Rate Limiter cho Auth endpoints (login, register, forgot-password).
 * Giới hạn 10 request / 15 phút / IP → chống brute-force mật khẩu.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Bạn đã thử quá nhiều lần. Vui lòng đợi 15 phút và thử lại.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Rate Limiter cho Content API (models, theories, examples, exercises).
 * Giới hạn 200 request / 15 phút / IP → chống scraping.
 */
export const contentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
  },
});

/**
 * Rate Limiter chung (fallback) áp dụng cho toàn bộ API.
 * Giới hạn 500 request / 15 phút / IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau 15 phút.',
  },
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. GLOBAL ERROR HANDLER
// Che giấu stack trace và thông tin nội bộ khỏi client ở môi trường production.
// Chỉ ghi log chi tiết trên server, trả về message chung chung cho người dùng.
// ──────────────────────────────────────────────────────────────────────────────
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Luôn log đầy đủ thông tin lỗi ở server để admin debug
  console.error(`[${new Date().toISOString()}] Lỗi Server Nội Bộ:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (res.headersSent) {
    return;
  }

  const statusCode = err.status ?? err.statusCode ?? 500;

  res.status(statusCode).json({
    error: isProduction
      ? 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' // Production: ẩn chi tiết
      : err.message, // Development: hiện message để debug
  });
};

// ──────────────────────────────────────────────────────────────────────────────
// 3. CORS ALLOWED ORIGINS
// Danh sách domain được phép gọi API (tránh mở wildcard "*" ở production).
// ──────────────────────────────────────────────────────────────────────────────
export const getAllowedOrigins = (): string[] => {
  const base = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  const productionOrigin = process.env.FRONTEND_URL;
  if (productionOrigin) {
    base.push(productionOrigin);
  }

  return base;
};
