import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client/edge';

const prisma = new PrismaClient();

const getUsers = async (req: Request, res: Response) => {
    try {
        const getAllUsers = await prisma.tamu.findMany({
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