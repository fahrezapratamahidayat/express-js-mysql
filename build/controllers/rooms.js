"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomDetails = exports.createRoom = exports.getRooms = void 0;
const db_config_1 = __importDefault(require("../configs/db.config"));
const respone_1 = __importDefault(require("../utils/respone"));
const util_1 = require("util");
const queryAsync = (0, util_1.promisify)(db_config_1.default.query).bind(db_config_1.default);
const getRooms = (req, res) => {
    db_config_1.default.query("select * from kamar", (err, result) => {
        if (err) {
            (0, respone_1.default)(400, err, "error", res);
        }
        else if (Array.isArray(result) && result.length === 0) {
            res.status(404).json({
                status: 404,
                message: "data not found"
            });
        }
        else {
            (0, respone_1.default)(200, result, "success", res);
        }
    });
};
exports.getRooms = getRooms;
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar } = req.body;
    try {
        const result = db_config_1.default.query("INSERT INTO kamar (Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar) VALUES (?, ?, ?, ?, ?, ?, ?)", [Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar], (err, result) => {
            if (err) {
                (0, respone_1.default)(400, err, "error", res);
            }
            else {
                const kamarId = result.insertId;
                db_config_1.default.query("INSERT INTO fasilitas_kamar (No_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_tambahan, Aksebilitas, Kebersihan, Minibar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [kamarId, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar]);
                (0, respone_1.default)(200, result, "success", res);
            }
        });
    }
    catch (err) {
        (0, respone_1.default)(400, err, "error", res);
    }
});
exports.createRoom = createRoom;
const getRoomDetails = (req, res) => {
    const roomId = req.params.id;
    db_config_1.default.query("SELECT k.*, f.Nama_fasilitas, f.Harga_kamar, f.Lemari, f.Kasur, f.Kulkas, f.Kursi, f.Meja, f.Kamar_mandi, f.Bathroom, f.Sofa, f.Kapasitas, f.Keamanan, f.Layanan_tambahan, f.Aksebilitas, f.Kebersihan, f.Minibar FROM kamar k LEFT JOIN fasilitas_kamar f ON k.No_kamar = f.No_kamar WHERE k.No_kamar = ?", [roomId], (err, result) => {
        if (err) {
            (0, respone_1.default)(400, err, "error", res);
        }
        else if (Array.isArray(result) && result.length === 0) {
            res.status(404).json({
                status: 404,
                message: "Data kamar tidak ditemukan"
            });
        }
        else {
            (0, respone_1.default)(200, result, "success", res);
        }
    });
};
exports.getRoomDetails = getRoomDetails;
//# sourceMappingURL=rooms.js.map