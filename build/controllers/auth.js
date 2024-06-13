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
exports.authLogout = exports.AuthRegister = exports.authLogin = exports.authRegisterPegawai = exports.authLoginPegawai = void 0;
const respone_1 = __importDefault(require("../utils/respone"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const findUsers = yield prisma.tamu.findFirst({
            where: {
                emailTamu: email
            }
        });
        if (!findUsers) {
            return (0, respone_1.default)(404, "user not found", "error", res, false);
        }
        const selectUser = yield prisma.tamu.findFirst({
            where: {
                emailTamu: email
            }
        });
        if (selectUser) {
            const confirmPassowrd = bcryptjs_1.default.compareSync(password, selectUser.kataSandi);
            if (!confirmPassowrd) {
                return res.status(400).json({
                    status: 400,
                    message: "password not match",
                });
            }
            const token = jsonwebtoken_1.default.sign({
                idTamu: selectUser.idTamu,
                namaTamu: selectUser.namaTamu,
                emailTamu: selectUser.emailTamu,
                password: selectUser.kataSandi,
                peran: selectUser.peranTamu,
                statusTamu: selectUser.statusTamu,
                pekerjaan: selectUser.pekerjaan,
                tanggalDibuat: selectUser.tanggalDibuat,
                tanggalDiupdate: selectUser.tanggalDiupdate,
                nomorTeleponTamu: selectUser.nomorTeleponTamu,
                provinsi: selectUser.provinsi,
                kota: selectUser.kota,
                kecamatan: selectUser.kecamatan,
                kelurahan: selectUser.kelurahan,
                umurTamu: selectUser.umurTamu,
            }, process.env.ACCESS_TOKEN_AUTH, { expiresIn: '1d' });
            res.cookie('refreshToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).json({
                status: 200,
                message: "success",
                token: token
            });
        }
    }
    catch (error) {
        return res.json({ error: error.message });
    }
});
exports.authLogin = authLogin;
const AuthRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { namaTamu, emailTamu, jenisKelamin, umurTamu, nomerTelephoneTamu, provinsi, kota, kecamatan, kelurahan, password, roleTamu, statusTamu, pekerjaan } = req.body;
    try {
        const findTamu = yield prisma.tamu.findMany({
            where: {
                emailTamu: emailTamu
            }
        });
        if (findTamu.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "email already exist"
            });
        }
        const findNoHp = yield prisma.tamu.findMany({
            where: {
                nomorTeleponTamu: nomerTelephoneTamu
            }
        });
        if (findNoHp.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "phone number already exist"
            });
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hashPassword = bcryptjs_1.default.hashSync(password, salt);
        const AddTamu = yield prisma.tamu.create({
            data: {
                namaTamu,
                emailTamu,
                jenisKelamin,
                umurTamu,
                nomorTeleponTamu: nomerTelephoneTamu,
                provinsi,
                kota,
                kecamatan,
                kelurahan,
                kataSandi: hashPassword,
                peranTamu: roleTamu,
                statusTamu,
                pekerjaan,
            }
        });
        res.status(200).json({
            status: 200,
            message: "success",
            data: AddTamu
        });
    }
    catch (error) {
        res.json({
            status: 400,
            message: error.message
        });
    }
});
exports.AuthRegister = AuthRegister;
const authLoginPegawai = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idPegawai, password } = req.body;
    try {
        const findPegawai = yield prisma.pegawai.findUnique({
            where: {
                idPegawai: parseInt(idPegawai),
            }
        });
        if (!findPegawai) {
            return res.status(404).json({
                status: 404,
                message: "pegawai tidak ditemukan"
            });
        }
        const confirmPassowrd = bcryptjs_1.default.compareSync(password, findPegawai.kataSandi);
        if (!confirmPassowrd) {
            return res.status(400).json({
                status: 400,
                message: "password tidak sama!, jika lupa hubungi admin atau pengola",
            });
        }
        const token = jsonwebtoken_1.default.sign({
            idPegawai: findPegawai.idPegawai,
            namaPegawai: findPegawai.namaPegawai,
            emailPegawai: findPegawai.emailPegawai,
            password: findPegawai.kataSandi,
            peran: "Pegawai",
            tanggalDibuat: findPegawai.tanggalDibuat,
            tanggalDiupdate: findPegawai.tanggalDiupdate,
        }, process.env.ACCESS_TOKEN_AUTH, { expiresIn: '1d' });
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            status: 200,
            message: "success",
            token: token
        });
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.authLoginPegawai = authLoginPegawai;
const authRegisterPegawai = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { namaPegawai, emailPegawai, password, jenisKelamin, rolePegawai, alamat, nomorTelepon } = req.body;
    try {
        const findPegawai = yield prisma.pegawai.findMany({
            where: {
                emailPegawai: emailPegawai
            }
        });
        if (findPegawai.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "email sudah didaftarkan"
            });
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hashPassword = bcryptjs_1.default.hashSync(password, salt);
        const AddPegawai = yield prisma.pegawai.create({
            data: {
                namaPegawai,
                emailPegawai,
                kataSandi: hashPassword,
                jenisKelamin,
                alamat: "",
                nomorTelepon: "",
            }
        });
        res.status(200).json({
            status: 200,
            message: "success",
            data: AddPegawai
        });
    }
    catch (error) {
        res.json({
            status: 400,
            message: error.message
        });
    }
});
exports.authRegisterPegawai = authRegisterPegawai;
const authLogout = (req, res) => {
};
exports.authLogout = authLogout;
