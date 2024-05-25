import db from '../configs/db.config';
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import path from "path"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRooms = async (req: Request, res: Response) => {
    try {
        const getRooms = await prisma.kamar.findMany({
            include: {
                fasilitasKamar: true,
                images: true,
            },
        })
        if (!getRooms) {
            res.json({
                status: 404,
                msg: "data not found"
            })
        }
        res.json({
            status: 200,
            msg: "success",
            data: getRooms
        })
    } catch (error) {
        res.json({
            status: 400,
            msg: error
        })
    }
}

export const createRoom = async (req: Request, res: Response) => {
    const { namaKamar, ukuranKamar, deskripsiKamar, typeKamar, ratingKamar, diskonKamar, statusKamar, namaFasilitas, deskripsiFasilitas, hargaFasilitas, typeFasilitas, namaGambar } = req.body;
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ msg: "Tolong Upload Gambar" });
        }
        const file = req.files.file as UploadedFile;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
        const allowedType = ['.png', '.jpg', '.jpeg'];

        if (!allowedType.includes(ext.toLowerCase())) {
            return res.status(422).json({ msg: "extension not allowed" });
        }

        if (fileSize > 10000000) {
            return res.status(422).json({ msg: "Gambar harus kurang dari 10 MB" });
        }
        const ratingKamarFloat = parseFloat(ratingKamar);
        const diskonKamarFloat = parseFloat(diskonKamar);
        const hargaFasilitasFloat = parseFloat(hargaFasilitas);

        let hargaKamar = 10000 * ratingKamarFloat;
        hargaKamar -= hargaKamar * (diskonKamarFloat / 100);

        hargaKamar += hargaFasilitasFloat;
        const createKamar = await prisma.kamar.create({
            data: {
                namaKamar: namaKamar,
                ukuranKamar: ukuranKamar,
                typeKamar: typeKamar,
                deskripsiKamar: deskripsiKamar,
                hargaKamar: hargaKamar,
                ratingKamar: ratingKamarFloat,
                diskonKamar: diskonKamarFloat,
                statusKamar: statusKamar,
            }
        }).then(async (dataKamar) => {
            const createFasilitas = await prisma.fasilitasKamar.create({
                data: {
                    nokamar: dataKamar.nomerKamar,
                    namaFasilitas,
                    deskripsiFasilitas,
                    hargaFasilitas: hargaFasilitasFloat,
                    typeFasilitas,
                }
            }).then(async (dataFasilitas) => {
                await file.mv(`./public/images/${fileName}`);
                const createImage = await prisma.image.create({
                    data: {
                        noKamar: dataKamar.nomerKamar,
                        name: namaGambar,
                        url: url,
                    }
                })
                await prisma.kamar.update({
                    where: {
                        nomerKamar: dataKamar.nomerKamar
                    },
                    data: {
                        hargaKamar: dataKamar.hargaKamar + dataFasilitas.hargaFasilitas,
                        fasilitasId: dataFasilitas.id
                    }
                })
                res.status(201).json({ msg: "Kamar dan fasilitas berhasil dibuat" });
            }).catch((err) => {
                return res.status(500).json({ msg: err.message });
            })
        })
    } catch (error: any) {
        return res.status(500).json({ msg: error.message });
    }
}

export const uploadImagesToRooms = async (req: Request, res: Response) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ msg: "Tolong Upload Gambar" });
        }
        const file = req.files.file as UploadedFile;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
        const allowedType = ['.png', '.jpg', '.jpeg'];

        if (!allowedType.includes(ext.toLowerCase())) {
            return res.status(422).json({ msg: "extension not allowed" });
        }

        if (fileSize > 10000000) {
            return res.status(422).json({ msg: "Gambar harus kurang dari 10 MB" });
        }
        const createImage = await prisma.image.create({
            data: {
                noKamar: parseFloat(req.params.roomId),
                name: req.body.title,
                url: url,
            }
        })
        await file.mv(`./public/images/${fileName}`);
        res.status(201).json({ msg: "Gambar berhasil ditambahkan" });
    } catch (error) {
        res.status(500).json({ msg: "Failed to upload image" });
    }
}

export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const roomId = parseFloat(req.params.roomId);
        const deleteRoom = await prisma.kamar.delete({
            where: {
                nomerKamar: roomId
            }
        })
        if (!deleteRoom) {
            return res.json({
                status: 404,
                message: "Data kamar tidak ditemukan"
            })
        }
        return res.json({
            status: 200,
            message: "data deleted"
        })
    } catch (error: any) {
        return res.json({
            status: 400,
            message: error.message
        })
    }
}

export const updateRoom = async (req: Request, res: Response) => {
    try {
        const roomId = parseFloat(req.params.roomId);
        const updateRoom = await prisma.kamar.update({
            where: {
                nomerKamar: roomId
            },
            data: {
                ...req.body
            }
        })
        if (!updateRoom) {
            return res.json({
                status: 404,
                message: "Data kamar tidak ditemukan"
            })
        }
        return res.json({
            status: 200,
            message: "data updated"
        })
    } catch (error: any) {
        return res.json({
            status: 400,
            message: error.message
        })
    }
}

export const getRoomDetails = async (req: Request, res: Response) => {
    try {
        const roomId = parseFloat(req.params.roomId);
        const getDetailRooms = await prisma.kamar.findFirst({
            where: {
                nomerKamar: roomId
            },
            include: {
                fasilitasKamar: true,
                images: true,
            }
        })
        if (!getDetailRooms) {
            return res.json({
                status: 404,
                message: "Data kamar tidak ditemukan"
            })
        }
        return res.json({
            status: 200,
            message: "data found",
            datas: getDetailRooms,
        })
    } catch (error: any) {
        return res.json({
            status: 400,
            message: error.message
        })
    }
}



