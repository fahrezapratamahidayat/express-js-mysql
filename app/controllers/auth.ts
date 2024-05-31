import respone from '../utils/respone';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

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
                peranTamu: selectUser.peranTamu,
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

const authLogout = (req: Request, res: Response) => {

}

export { authLogin, AuthRegister, authLogout }