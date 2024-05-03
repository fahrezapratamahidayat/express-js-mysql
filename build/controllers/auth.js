"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRegister = exports.authLogin = void 0;
const respone_1 = __importDefault(require("../utils/respone"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../configs/db.config"));
const authLogin = (req, res) => {
    const { email, password } = req.body;
    db_config_1.default.query("select * from tamu where Email_tamu = ?", [email], (err, result) => {
        if (err) {
            (0, respone_1.default)(400, err, "error", res, false);
        }
        if (Array.isArray(result) && result.length === 0) {
            (0, respone_1.default)(404, "user not found", "error", res, false);
        }
        const users = Array.isArray(result) ? result[0] : null;
        if (!users) {
            return (0, respone_1.default)(404, "user not found", "error", res, false);
        }
        const confirmPassowrd = bcryptjs_1.default.compareSync(password, users.Password);
        if (!confirmPassowrd) {
            return res.status(400).json({
                status: 400,
                message: "password not match",
            });
        }
        const { ID_Tamu, Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal } = users;
        const accessTokenSecret = process.env.ACCESS_TOKEN_AUTH || 'defaultAccessTokenSecret';
        const refreshTokenSecret = process.env.REFRESH_TOKEN_AUTH || 'defaultRefreshTokenSecret';
        const accesToken = jsonwebtoken_1.default.sign({ ID_Tamu, Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal }, accessTokenSecret, { expiresIn: '15s' });
        const refreshToken = jsonwebtoken_1.default.sign({ ID_Tamu, Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal }, refreshTokenSecret, { expiresIn: '1d' });
        db_config_1.default.query("UPDATE tamu set refreshToken = ? where ID_Tamu = ?", [refreshToken, ID_Tamu], (err, result) => {
            if (err) {
                console.error("Error updating database:", err);
                return res.status(500).json({ message: 'Database update failed', error: err });
            }
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).json({
                status: 200,
                message: "success",
                token: accesToken
            });
        });
    });
};
exports.authLogin = authLogin;
const AuthRegister = (req, res) => {
    const { Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal } = req.body;
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hashPassword = bcryptjs_1.default.hashSync(Password, salt);
    db_config_1.default.query("SELECT * FROM tamu WHERE Email_tamu = ?", [Email_tamu], (err, result) => {
        if (err) {
            (0, respone_1.default)(400, err, "error", res, false);
        }
        else if (Array.isArray(result) && result.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "email already exist",
            });
        }
        else {
            db_config_1.default.query("INSERT INTO tamu (Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, hashPassword, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal], (err, result) => {
                if (err) {
                    (0, respone_1.default)(500, err, "error", res, false);
                }
                else {
                    res.status(201).json({
                        status: 201,
                        message: "user registered successfully",
                    });
                }
            });
        }
    });
};
exports.AuthRegister = AuthRegister;
//# sourceMappingURL=auth.js.map