import respone from '../utils/respone';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client/edge';

const prisma = new PrismaClient();

const authLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const findUsers = await prisma.tamu.findFirst({
            where: {
                emailTamu: email
            }
        })
        if (!findUsers) {
            return respone(404, "user not found", "error", res, false);
        }
        const selectUser = await prisma.tamu.findFirst({
            where: {
                emailTamu: email
            }
        })
        if (selectUser) {
            const confirmPassowrd = bcryptjs.compareSync(password, selectUser.kataSandi);
            if (!confirmPassowrd) {
                return res.status(400).json({
                    status: 400,
                    message: "password not match",
                })
            }

            const token = jwt.sign({
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
            }, process.env.ACCESS_TOKEN_AUTH as string, { expiresIn: '1d' });
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
    } catch (error: any) {
        return res.json({ error: error.message })
    }
}
const AuthRegister = async (req: Request, res: Response) => {
    const { namaTamu, emailTamu, jenisKelamin, umurTamu, nomerTelephoneTamu, provinsi, kota, kecamatan, kelurahan, password, roleTamu, statusTamu, pekerjaan } = req.body;
    try {
        const findTamu = await prisma.tamu.findMany({
            where: {
                emailTamu: emailTamu
            }
        })
        if (findTamu.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "email already exist"
            })
        }
        const findNoHp = await prisma.tamu.findMany({
            where: {
                nomorTeleponTamu: nomerTelephoneTamu
            }
        })
        if (findNoHp.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "phone number already exist"
            })
        }
        const salt = bcryptjs.genSaltSync(10);
        const hashPassword = bcryptjs.hashSync(password, salt);
        const AddTamu = await prisma.tamu.create({
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
        })
        res.status(200).json({
            status: 200,
            message: "success",
            data: AddTamu
        })
    } catch (error: any) {
        res.json({
            status: 400,
            message: error.message
        });
    }
}

export const authLoginPegawai = async (req: Request, res: Response) => {
    const { idPegawai, password } = req.body

    try {
        const findPegawai = await prisma.pegawai.findUnique({
            where: {
                idPegawai: parseInt(idPegawai),
            }
        })
        if (!findPegawai) {
            return res.status(404).json({
                status: 404,
                message: "pegawai tidak ditemukan"
            })
        }

        const confirmPassowrd = bcryptjs.compareSync(password, findPegawai.kataSandi);
        if (!confirmPassowrd) {
            return res.status(400).json({
                status: 400,
                message: "password tidak sama!, jika lupa hubungi admin atau pengola",
            })
        }
        const token = jwt.sign({
            idPegawai: findPegawai.idPegawai,
            namaPegawai: findPegawai.namaPegawai,
            emailPegawai: findPegawai.emailPegawai,
            password: findPegawai.kataSandi,
            peran: "Pegawai",
            tanggalDibuat: findPegawai.tanggalDibuat,
            tanggalDiupdate: findPegawai.tanggalDiupdate,
        }, process.env.ACCESS_TOKEN_AUTH as string, { expiresIn: '1d' });
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
    } catch (error: any) {
        res.status(400).json({
            status: 400,
            message: error.message
        })
    }
}


export const authRegisterPegawai = async (req: Request, res: Response) => {
    const { namaPegawai, emailPegawai, password, jenisKelamin, rolePegawai, alamat, nomorTelepon } = req.body
    try {
        const findPegawai = await prisma.pegawai.findMany({
            where: {
                emailPegawai: emailPegawai
            }
        })
        if (findPegawai.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "email sudah didaftarkan"
            })
        }
        const salt = bcryptjs.genSaltSync(10);
        const hashPassword = bcryptjs.hashSync(password, salt);
        const AddPegawai = await prisma.pegawai.create({
            data: {
                namaPegawai,
                emailPegawai,
                kataSandi: hashPassword,
                jenisKelamin,
                alamat: "",
                nomorTelepon: "",
            }
        })
        res.status(200).json({
            status: 200,
            message: "success",
            data: AddPegawai
        })
    } catch (error: any) {
        res.json({
            status: 400,
            message: error.message
        });
    }
}

const authLogout = (req: Request, res: Response) => {

}

export { authLogin, AuthRegister, authLogout }