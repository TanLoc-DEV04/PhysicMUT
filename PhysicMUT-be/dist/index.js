"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const health_1 = __importDefault(require("./routes/health"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const roles_1 = __importDefault(require("./routes/roles"));
const content_1 = __importDefault(require("./routes/content"));
const securityMiddleware_1 = require("./middlewares/securityMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
// ──────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS — Helmet với Content Security Policy (CSP)
//    Giới hạn nguồn tải script, ảnh, kết nối API để chống XSS & data injection.
// ──────────────────────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // Cho phép script từ chính domain và CDN MathJax (đã có SRI ở HTML)
            scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
            // Cho phép kết nối tới BE chính và Bot AI (FastAPI)
            connectSrc: [
                "'self'",
                process.env.BOT_URL || 'http://localhost:8000',
                process.env.FRONTEND_URL || 'http://localhost:5173' || 'http://localhost:4173',
            ],
            // Cho phép tải ảnh từ chính domain, data URI và Supabase Storage
            imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
            // Cho phép font từ Google Fonts và CDN
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
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
    hsts: isProduction
        ? { maxAge: 31536000, includeSubDomains: true }
        : false,
    // Không gửi Referrer khi chuyển trang
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
// ──────────────────────────────────────────────────────────────────────────────
// 2. CORS — Chỉ chấp nhận request từ các domain được phép
// ──────────────────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowed = (0, securityMiddleware_1.getAllowedOrigins)();
        // Cho phép request không có origin (Postman, server-to-server)
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: Origin "${origin}" không được phép truy cập.`));
        }
    },
    credentials: true, // Cho phép gửi cookie/auth header qua CORS
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));
// ──────────────────────────────────────────────────────────────────────────────
// 3. BODY PARSER — Giới hạn kích thước payload để chống DoS
// ──────────────────────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
// ──────────────────────────────────────────────────────────────────────────────
// 4. RATE LIMITING — Áp dụng giới hạn tỷ lệ toàn cục
// ──────────────────────────────────────────────────────────────────────────────
app.use(securityMiddleware_1.globalRateLimiter); // 500 req/15min/IP cho tất cả routes
// Static uploads (không cần rate limit riêng)
app.use('/uploads', express_1.default.static('uploads'));
// ──────────────────────────────────────────────────────────────────────────────
// 5. SWAGGER DOCS (chỉ bật ở môi trường không phải production)
// ──────────────────────────────────────────────────────────────────────────────
if (!isProduction) {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
}
// ──────────────────────────────────────────────────────────────────────────────
// 6. ROUTES với rate limiter phân cấp
// ──────────────────────────────────────────────────────────────────────────────
app.use('/health', health_1.default);
// Auth routes: rate limit nghiêm ngặt hơn để chống brute-force
app.use('/auth', securityMiddleware_1.authRateLimiter, auth_1.default);
app.use('/users', securityMiddleware_1.authRateLimiter, users_1.default);
app.use('/roles', roles_1.default);
// Content API: rate limit vừa phải để chống scraping
app.use('/content', securityMiddleware_1.contentRateLimiter, content_1.default);
app.get('/', (req, res) => {
    // Không tiết lộ thông tin stack ở response body
    res.json({ status: 'ok', service: 'PhysicMUT API' });
});
// ──────────────────────────────────────────────────────────────────────────────
// 7. GLOBAL ERROR HANDLER — Phải đặt SAU TẤT CẢ routes
//    Che giấu chi tiết lỗi (stack trace, SQL error) khỏi client ở production.
// ──────────────────────────────────────────────────────────────────────────────
app.use(securityMiddleware_1.globalErrorHandler);
app.listen(port, () => {
    console.log(`[PhysicMUT] Server running on port ${port}`);
    if (!isProduction) {
        console.log(`[PhysicMUT] Swagger Docs: http://localhost:${port}/api-docs`);
    }
});
//# sourceMappingURL=index.js.map