import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getUsers = async (req: Request, res: Response) => {
    try {
        const getAllUsers = await prisma.user.findMany({
            select: {
                tamuId: true,
                namaTamu: true,
                emailTamu: true,
                roleTamu: true,
                statusTamu: true,
                pekerjaan: true,
                dibuatTanggal: true,
                diupdateTanggal: true,
            }
        });
        if (!getAllUsers) {
            return res.json({
                status: 404,
                message: "Data user tidak ditemukan"
            })
        }
        res.json({
            status: 200,
            message: "Data user ditemukan",
            datas: getAllUsers
        })
    } catch (error: any) {
        return res.json({
            status: 404,
            message: error.message
        })
    }
}


export { getUsers };