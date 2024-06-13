"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAsync = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hotel'
};
const db = mysql2_1.default.createConnection(dbConfig);
exports.default = db;
function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    });
}
exports.queryAsync = queryAsync;
