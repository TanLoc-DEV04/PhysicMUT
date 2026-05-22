import { Request, Response, NextFunction } from "express";
/**
 * Rate Limiter cho Auth endpoints (login, register, forgot-password).
 * Giới hạn 10 request / 15 phút / IP → chống brute-force mật khẩu.
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate Limiter cho Content API (models, theories, examples, exercises).
 * Giới hạn 200 request / 15 phút / IP → chống scraping.
 */
export declare const contentRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate Limiter chung (fallback) áp dụng cho toàn bộ API.
 * Giới hạn 500 request / 15 phút / IP.
 */
export declare const globalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const globalErrorHandler: (err: any, req: Request, res: Response, _next: NextFunction) => void;
export declare const getAllowedOrigins: () => string[];
//# sourceMappingURL=securityMiddleware.d.ts.map