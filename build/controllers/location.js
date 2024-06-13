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
exports.getKelurahan = exports.getKecamatan = exports.getKabupaten = exports.getProvinsi = void 0;
const fs_1 = __importDefault(require("fs"));
const provinsi = JSON.parse(fs_1.default.readFileSync("./app/utils/provinsi.json", "utf8"));
const kabupaten = JSON.parse(fs_1.default.readFileSync("./app/utils/kabupaten.json", "utf8"));
const kecamatan = JSON.parse(fs_1.default.readFileSync("./app/utils/kecamatan.json", "utf8"));
const desa = JSON.parse(fs_1.default.readFileSync("./app/utils/kelurahan.json", "utf8"));
const getProvinsi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(provinsi);
});
exports.getProvinsi = getProvinsi;
const getKabupaten = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { provinceId } = req.params;
    if (!provinceId) {
        return res.status(400).json({ message: "Provinsi ID is required" });
    }
    const filteredKabupaten = kabupaten.filter((kab) => kab.provinsi_id === parseInt(provinceId));
    res.json(filteredKabupaten);
});
exports.getKabupaten = getKabupaten;
const getKecamatan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { districtId } = req.params;
    if (!districtId) {
        return res.status(400).json({ message: "Kabupaten ID is required" });
    }
    const filteredKecamatan = kecamatan.filter((kec) => kec.kabupaten_id === parseInt(districtId));
    res.json(filteredKecamatan);
});
exports.getKecamatan = getKecamatan;
const getKelurahan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subdistrictId } = req.params;
    if (!subdistrictId) {
        return res.status(400).json({ message: "Kecamatan ID is required" });
    }
    const filteredDesa = desa.filter((d) => d.kecamatan_id === parseInt(subdistrictId));
    res.json(filteredDesa);
});
exports.getKelurahan = getKelurahan;
