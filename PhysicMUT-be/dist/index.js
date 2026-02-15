"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const health_1 = __importDefault(require("./routes/health"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const roles_1 = __importDefault(require("./routes/roles"));
const content_1 = __importDefault(require("./routes/content"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
// Swagger Page
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// Routes
app.use('/health', health_1.default);
app.use('/users', users_1.default);
app.use('/auth', auth_1.default);
app.use('/roles', roles_1.default);
app.use('/content', content_1.default);
app.get('/', (req, res) => {
    res.send('PhysicMUT Backend is running!');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
//# sourceMappingURL=index.js.map