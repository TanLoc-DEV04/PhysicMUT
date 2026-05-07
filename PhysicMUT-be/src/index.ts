import express, { Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import healthRouter from "./routes/health";
import userRouter from "./routes/users";
import authRouter from "./routes/auth";
import roleRouter from "./routes/roles";
import contentRouter from "./routes/content";
import compression from "compression";
import {
  globalRateLimiter,
  authRateLimiter,
  contentRateLimiter,
  globalErrorHandler,
  getAllowedOrigins,
} from "./middlewares/securityMiddleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// ──────────────────────────────────────────────────────────────────────────────
// 0. COMPRESSION — Bật nén dữ liệu cho toàn bộ API (Gzip/Brotli)
//    Giảm dung lượng phản hồi (vd: 46KB -> 5KB), tiết kiệm băng thông và giảm LCP.
// ──────────────────────────────────────────────────────────────────────────────
app.use(compression());

// ──────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS — Helmet với Content Security Policy (CSP)
//    Giới hạn nguồn tải script, ảnh, kết nối API để chống XSS & data injection.
// ──────────────────────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Cho phép script từ chính domain và CDN MathJax (đã có SRI ở HTML)
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        // Cho phép kết nối tới BE chính và Bot AI (FastAPI)
        connectSrc: [
          "'self'",
          process.env.BOT_URL || "http://localhost:8000",
          process.env.FRONTEND_URL || "http://localhost:5173",
        ],
        // Cho phép tải ảnh từ chính domain, data URI và Supabase Storage
        imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co"],
        // Cho phép font từ Google Fonts và CDN
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        // Chặn nhúng trang trong iframe từ ngoài (chống Clickjacking)
        frameAncestors: ["'none'"],
        // Tắt object/embed (Flash, PDF plugin lỗi thời)
        objectSrc: ["'none'"],
        // Nâng cấp http → https nếu có
        ...(isProduction && { upgradeInsecureRequests: [] }),
      },
    },
    // Ẩn header "X-Powered-By: Express" — không tiết lộ stack công nghệ
    hidePoweredBy: true,
    // Chống MIME-type sniffing
    noSniff: true,
    // Bật XSS filter trên các trình duyệt cũ
    xssFilter: true,
    // HTTP Strict Transport Security — bắt buộc HTTPS ở production
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
    // Không gửi Referrer khi chuyển trang
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// ──────────────────────────────────────────────────────────────────────────────
// 2. CORS — Chỉ chấp nhận request từ các domain được phép
// ──────────────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = getAllowedOrigins();
      // Cho phép request không có origin (Postman, server-to-server)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`CORS: Origin "${origin}" không được phép truy cập.`),
        );
      }
    },
    credentials: true, // Cho phép gửi cookie/auth header qua CORS
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);

// ──────────────────────────────────────────────────────────────────────────────
// 3. BODY PARSER — Giới hạn kích thước payload để chống DoS
// ──────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ──────────────────────────────────────────────────────────────────────────────
// 4. RATE LIMITING — Áp dụng giới hạn tỷ lệ toàn cục
// ──────────────────────────────────────────────────────────────────────────────
app.use(globalRateLimiter); // 500 req/15min/IP cho tất cả routes

// Static uploads (không cần rate limit riêng)
app.use("/uploads", express.static("uploads"));

// ──────────────────────────────────────────────────────────────────────────────
// 5. SWAGGER DOCS (chỉ bật ở môi trường không phải production)
// ──────────────────────────────────────────────────────────────────────────────
if (!isProduction) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. ROUTES với rate limiter phân cấp
// ──────────────────────────────────────────────────────────────────────────────
app.use("/health", healthRouter);

// Auth routes: rate limit nghiêm ngặt hơn để chống brute-force
app.use("/auth", authRateLimiter, authRouter);
app.use("/users", authRateLimiter, userRouter);
app.use("/roles", roleRouter);

// Content API: rate limit vừa phải để chống scraping
app.use("/content", contentRateLimiter, contentRouter);

app.get("/", (req: Request, res: Response) => {
  // Không tiết lộ thông tin stack ở response body
  res.json({ status: "ok", service: "PhysicMUT API" });
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. GLOBAL ERROR HANDLER — Phải đặt SAU TẤT CẢ routes
//    Che giấu chi tiết lỗi (stack trace, SQL error) khỏi client ở production.
// ──────────────────────────────────────────────────────────────────────────────
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`[PhysicMUT] Server running on port ${port}`);
  if (!isProduction) {
    console.log(`[PhysicMUT] Swagger Docs: http://localhost:${port}/api-docs`);
  }
});
