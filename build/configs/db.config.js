"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hotel'
};
const db = mysql2_1.default.createConnection(dbConfig);
exports.default = db;
//# sourceMappingURL=db.config.js.map