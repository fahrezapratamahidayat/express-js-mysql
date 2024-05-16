import respone from '../utils/respone';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const findUsers = await prisma.user.findFirst({
            where: {
                emailTamu: email
            }
        })
        if (!findUsers) {
            return respone(404, "user not found", "error", res, false);
        }
        const selectUser = await prisma.user.findFirst({
            where: {
                emailTamu: email
            }
        })
        if (selectUser) {
            const confirmPassowrd = bcryptjs.compareSync(password, selectUser.password);
            if (!confirmPassowrd) {
                return res.status(400).json({
                    status: 400,
                    message: "password not match",
                })
            }

            const token = jwt.sign({
                id: selectUser.tamuId,
                name: selectUser.namaTamu,
                email: selectUser.emailTamu,
                password: selectUser.password,
                role: selectUser.roleTamu,
                status: selectUser.statusTamu,
                pekerjaan: selectUser.pekerjaan,
                createdAt: selectUser.dibuatTanggal,
                updatedAt: selectUser.diupdateTanggal,
            }, process.env.ACCESS_TOKEN_AUTH as string, { expiresIn: '1d' });
            res.cookie('token', token, {
                httpOnly: false,
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

const authLogout = (req: Request, res: Response) => {

}
const AuthRegister = async (req: Request, res: Response) => {
    const { namaTamu, emailTamu, jenisKelamin, umurTamu, nomerTelephoneTamu, provinsi, kota, kecamatan, kelurahan, password, roleTamu, statusTamu, pekerjaan } = req.body;
    try {
        const findTamu = await prisma.user.findMany({
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
        const findNoHp = await prisma.user.findMany({
            where: {
                nomerTelephoneTamu: nomerTelephoneTamu
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
        const AddTamu = await prisma.user.create({
            data: {
                namaTamu,
                emailTamu,
                jenisKelamin,
                umurTamu,
                nomerTelephoneTamu,
                provinsi,
                kota,
                kecamatan,
                kelurahan,
                password: hashPassword,
                roleTamu,
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

export { authLogin, AuthRegister, authLogout }