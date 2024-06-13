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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllUsers = yield prisma.tamu.findMany({
            select: {
                idTamu: true,
                namaTamu: true,
                emailTamu: true,
                peranTamu: true,
                statusTamu: true,
                pekerjaan: true,
                tanggalDibuat: true,
                tanggalDiupdate: true,
                jenisKelamin: true,
                provinsi: true,
                kecamatan: true,
                kelurahan: true,
                kota: true,
                nomorTeleponTamu: true,
                umurTamu: true
            }
        });
        if (!getAllUsers) {
            return res.json({
                status: 404,
                message: "Data user tidak ditemukan"
            });
        }
        res.json({
            status: 200,
            message: "Data user ditemukan",
            datas: getAllUsers
        });
    }
    catch (error) {
        return res.json({
            status: 404,
            message: error.message
        });
    }
});
exports.getUsers = getUsers;
