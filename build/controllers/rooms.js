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
exports.postComments = exports.getRoomDetails = exports.updateRoom = exports.deleteRoom = exports.uploadImagesToRooms = exports.createRoom = exports.getRooms = void 0;
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const getRooms = yield prisma.kamar.findMany({
            skip: skip,
            take: limit,
            include: {
                Gambar: true,
            },
        });
        const totalRooms = yield prisma.kamar.count();
        const totalPages = Math.ceil(totalRooms / limit);
        if (!getRooms.length) {
            res.json({
                status: 404,
                msg: "data not found"
            });
        }
        else {
            res.json({
                status: 200,
                msg: "success",
                data: getRooms,
                currentPage: page,
                totalPages: totalPages,
                totalRooms,
                limit: limit
            });
        }
    }
    catch (error) {
        res.json({
            status: 400,
            msg: error.message || error
        });
    }
});
exports.getRooms = getRooms;
// export const createRoom = async (req: Request, res: Response) => {
//     const { namaKamar, ukuranKamar, deskripsiKamar, typeKamar, ratingKamar, diskonKamar, statusKamar, namaFasilitas, deskripsiFasilitas, hargaFasilitas, typeFasilitas, namaGambar } = req.body;
//     try {
//         if (!req.files || !req.files.file) {
//             return res.status(400).json({ msg: "Tolong Upload Gambar" });
//         }
//         const file = req.files.file as UploadedFile;
//         const fileSize = file.data.length;
//         const ext = path.extname(file.name);
//         const fileName = file.md5 + ext;
//         const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
//         const allowedType = ['.png', '.jpg', '.jpeg'];
//         if (!allowedType.includes(ext.toLowerCase())) {
//             return res.status(422).json({ msg: "extension not allowed" });
//         }
//         if (fileSize > 10000000) {
//             return res.status(422).json({ msg: "Gambar harus kurang dari 10 MB" });
//         }
//         const ratingKamarFloat = parseFloat(ratingKamar);
//         const diskonKamarFloat = parseFloat(diskonKamar);
//         const hargaFasilitasFloat = parseFloat(hargaFasilitas);
//         let hargaKamarBase;
//         switch (typeKamar) {
//             case "Standard":
//                 hargaKamarBase = 150000;
//                 break;
//             case "Deluxe":
//                 hargaKamarBase = 200000;
//                 break;
//             case "Suite":
//                 hargaKamarBase = 250000;
//                 break;
//             case "Premium":
//                 hargaKamarBase = 280000;
//                 break;
//             default:
//                 hargaKamarBase = 0;
//         }
//         const createKamar = await prisma.kamar.create({
//             data: {
//                 namaKamar: namaKamar,
//                 ukuranKamar: ukuranKamar,
//                 typeKamar: typeKamar,
//                 deskripsiKamar: deskripsiKamar,
//                 hargaKamar: hargaKamarBase,
//                 ratingKamar: 0,
//                 diskonKamar: diskonKamarFloat,
//                 statusKamar: statusKamar,
//             }
//         }).then(async (dataKamar) => {
//             const createFasilitas = await prisma.fasilitasKamar.create({
//                 data: {
//                     nokamar: dataKamar.nomerKamar,
//                     namaFasilitas,
//                     deskripsiFasilitas,
//                     hargaFasilitas: hargaKamarBase,
//                     typeFasilitas: typeKamar,
//                 }
//             }).then(async (dataFasilitas) => {
//                 await file.mv(`./public/images/${fileName}`);
//                 const createImage = await prisma.image.create({
//                     data: {
//                         noKamar: dataKamar.nomerKamar,
//                         name: file.name,
//                         url: url,
//                     }
//                 })
//                 await prisma.kamar.update({
//                     where: {
//                         nomerKamar: dataKamar.nomerKamar
//                     },
//                     data: {
//                         hargaKamar: dataKamar.hargaKamar + dataFasilitas.hargaFasilitas,
//                         fasilitasId: dataFasilitas.id
//                     }
//                 })
//                 res.status(201).json({ msg: "Kamar dan fasilitas berhasil dibuat" });
//             }).catch((err) => {
//                 return res.status(500).json({ msg: err.message });
//             })
//         })
//     } catch (error: any) {
//         return res.status(500).json({ msg: error.message });
//     }
// }
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { namaKamar, ukuranKamar, deskripsiKamar, typeKamar, ratingKamar, diskonKamar, statusKamar, namaFasilitas, deskripsiFasilitas, hargaFasilitas, typeFasilitas } = req.body;
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ msg: "Tambahkan Gambar untuk kamar minimal 1!" });
        }
        const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
        const allowedType = ['.png', '.jpg', '.jpeg'];
        for (const file of files) {
            const fileSize = file.data.length;
            const ext = path_1.default.extname(file.name);
            if (!allowedType.includes(ext.toLowerCase())) {
                return res.status(422).json({ msg: "extension not allowed" });
            }
            if (fileSize > 10000000) {
                return res.status(422).json({ msg: "Gambar harus kurang dari 10 MB" });
            }
        }
        const ratingKamarFloat = parseFloat(ratingKamar);
        const diskonKamarFloat = parseFloat(diskonKamar);
        const hargaFasilitasFloat = parseFloat(hargaFasilitas);
        let hargaKamarBase;
        switch (typeKamar) {
            case "Standar":
                hargaKamarBase = 150000;
                break;
            case "Deluxe":
                hargaKamarBase = 200000;
                break;
            case "Suite":
                hargaKamarBase = 250000;
                break;
            case "Premium":
                hargaKamarBase = 280000;
                break;
            default:
                hargaKamarBase = 0;
        }
        const createdRoom = yield prisma.kamar.create({
            data: {
                namaKamar: namaKamar,
                ukuranKamar: ukuranKamar,
                tipeKamar: typeKamar,
                deskripsiKamar: deskripsiKamar,
                hargaKamar: hargaKamarBase,
                ratingKamar: 0,
                diskonKamar: diskonKamarFloat,
                statusKamar: statusKamar,
            }
        });
        for (const file of files) {
            const ext = path_1.default.extname(file.name);
            const fileName = file.md5 + ext;
            const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
            yield file.mv(`./public/images/${fileName}`);
            yield prisma.gambar.create({
                data: {
                    idKamar: createdRoom.idKamar,
                    namaGambar: file.name,
                    urlGambar: url,
                }
            });
        }
        yield prisma.kamar.update({
            where: {
                idKamar: createdRoom.idKamar
            },
            data: {
                hargaKamar: createdRoom.hargaKamar
            }
        });
        res.status(201).json({ msg: "Kamar dan fasilitas berhasil dibuat" });
    }
    catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});
exports.createRoom = createRoom;
const uploadImagesToRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ msg: "Tolong Upload Gambar" });
        }
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path_1.default.extname(file.name);
        const fileName = file.md5 + ext;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        if (!allowedType.includes(ext.toLowerCase())) {
            return res.status(422).json({ msg: "extension not allowed" });
        }
        if (fileSize > 10000000) {
            return res.status(422).json({ msg: "Gambar harus kurang dari 10 MB" });
        }
        const createImage = yield prisma.gambar.create({
            data: {
                idKamar: parseFloat(req.params.roomId),
                namaGambar: req.body.title,
                urlGambar: url,
            }
        });
        yield file.mv(`./public/images/${fileName}`);
        res.status(201).json({ msg: "Gambar berhasil ditambahkan" });
    }
    catch (error) {
        res.status(500).json({ msg: "Failed to upload image" });
    }
});
exports.uploadImagesToRooms = uploadImagesToRooms;
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = parseFloat(req.params.roomId);
        const deleteRoom = yield prisma.kamar.delete({
            where: {
                idKamar: roomId
            }
        });
        if (!deleteRoom) {
            return res.json({
                status: 404,
                message: "Data kamar tidak ditemukan"
            });
        }
        return res.json({
            status: 200,
            message: "data deleted"
        });
    }
    catch (error) {
        return res.json({
            status: 400,
            message: error.message
        });
    }
});
exports.deleteRoom = deleteRoom;
const updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = parseFloat(req.params.roomId);
    const { namaKamar, ukuranKamar, deskripsiKamar, typeKamar, ratingKamar, diskonKamar, statusKamar, namaFasilitas, deskripsiFasilitas, hargaFasilitas, typeFasilitas } = req.body;
    let hargaKamarBase;
    switch (typeKamar) {
        case "Standar":
            hargaKamarBase = 150000;
            break;
        case "Deluxe":
            hargaKamarBase = 200000;
            break;
        case "Suite":
            hargaKamarBase = 250000;
            break;
        case "Premium":
            hargaKamarBase = 280000;
            break;
        default:
            hargaKamarBase = 0;
    }
    try {
        const updateRoom = yield prisma.kamar.update({
            where: {
                idKamar: roomId
            },
            data: {
                namaKamar: namaKamar,
                ukuranKamar: ukuranKamar,
                deskripsiKamar: deskripsiKamar,
                tipeKamar: typeKamar,
                ratingKamar: ratingKamar,
                diskonKamar: parseInt(diskonKamar),
                statusKamar: statusKamar,
                hargaKamar: hargaKamarBase,
                tanggalDiupdate: new Date(),
            }
        });
        // Handle multiple image uploads if there are any files
        if (req.files && req.files.file) {
            const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
            const allowedType = ['.png', '.jpg', '.jpeg'];
            for (const file of files) {
                const fileSize = file.data.length;
                const ext = path_1.default.extname(file.name);
                const fileName = file.md5 + ext;
                const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
                if (!allowedType.includes(ext.toLowerCase())) {
                    return res.status(422).json({ msg: "extension not allowed" });
                }
                if (fileSize > 10000000) {
                    return res.status(422).json({ msg: "Gambar harus kurang dari 10 MB" });
                }
                // Move the file to the public directory
                yield file.mv(`./public/images/${fileName}`);
                // Update or create image record
                const existingImage = yield prisma.gambar.findFirst({
                    where: { idKamar: roomId, namaGambar: file.name }
                });
                if (existingImage) {
                    yield prisma.gambar.update({
                        where: { idGambar: existingImage.idGambar },
                        data: { urlGambar: url }
                    });
                }
                else {
                    yield prisma.gambar.create({
                        data: {
                            idKamar: roomId,
                            namaGambar: file.name,
                            urlGambar: url,
                        }
                    });
                }
            }
        }
        return res.json({
            status: 200,
            message: "Data kamar dan gambar berhasil diperbarui",
            data: updateRoom
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.updateRoom = updateRoom;
const getRoomDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = parseFloat(req.params.roomId);
        const getDetailRooms = yield prisma.kamar.findFirst({
            where: {
                idKamar: roomId
            },
            include: {
                Gambar: true,
                Komentar: {
                    include: {
                        tamu: {
                            select: {
                                namaTamu: true,
                                kota: true,
                                provinsi: true
                            }
                        }
                    }
                }
            }
        });
        if (!getDetailRooms) {
            return res.json({
                status: 404,
                message: "Data kamar tidak ditemukan"
            });
        }
        return res.json({
            status: 200,
            message: "data found",
            datas: getDetailRooms,
        });
    }
    catch (error) {
        return res.json({
            status: 400,
            message: error.message
        });
    }
});
exports.getRoomDetails = getRoomDetails;
const postComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTamu, idKamar, tipeKomentar, komentar } = req.body;
    const { roomId } = req.params;
    try {
        const createComments = yield prisma.komentar.create({
            data: {
                idTamu: parseInt(idTamu),
                idKamar: parseInt(roomId),
                TipeKomentar: tipeKomentar,
                Komentar: komentar
            }
        });
        res.status(200).json({
            msg: "komentar berhasil ditambahkan"
        });
    }
    catch (error) {
        res.json({
            msg: error.message
        });
    }
});
exports.postComments = postComments;
