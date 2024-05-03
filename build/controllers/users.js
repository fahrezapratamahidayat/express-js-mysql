"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUsers = void 0;
const db_config_1 = __importDefault(require("../configs/db.config"));
const respone_1 = __importDefault(require("../utils/respone"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUsers = (req, res) => {
    db_config_1.default.query("select * from tamu", (err, result) => {
        if (err) {
            (0, respone_1.default)(400, err, "error", res);
        }
        else {
            (0, respone_1.default)(200, result, "success", res);
        }
    });
};
exports.getUsers = getUsers;
const createUser = (req, res) => {
    const { Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal } = req.body;
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hashPassword = bcryptjs_1.default.hashSync(Password, salt);
    db_config_1.default.query("INSERT INTO tamu (Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal], (err, result) => {
        if (err) {
            (0, respone_1.default)(400, err, "error", res);
        }
        else {
            (0, respone_1.default)(200, result.affectedRows, "success", res, false);
        }
    });
};
exports.createUser = createUser;
//# sourceMappingURL=users.js.map