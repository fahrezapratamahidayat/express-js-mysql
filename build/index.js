"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routers_1 = __importDefault(require("./routes/routers"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
dotenv_1.default.config(); // Load the environment variables
console.log(`The connection URL is ${process.env.DATABASE_URL}`);
const app = (0, express_1.default)();
const port = 3000;
dotenv_1.default.config();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});
app.use((0, express_fileupload_1.default)({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true
}));
app.use(express_1.default.static("public"));
// app.use((req, res, next) => {
//     res.status(500).send('Something broke!');
// });
app.use("/api", routers_1.default);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});