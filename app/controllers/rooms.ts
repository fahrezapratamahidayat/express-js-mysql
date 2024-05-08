import db, { queryAsync } from '../configs/db.config';
import respone from '../utils/respone';
import { ResultSetHeader } from 'mysql2';
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import path from "path"

const getRooms = (req: Request, res: Response) => {
    db.query("SELECT kamar.*, fasilitas_kamar.Harga_kamar, fasilitas_kamar.Nama_fasilitas FROM kamar LEFT JOIN fasilitas_kamar ON kamar.No_kamar = fasilitas_kamar.No_kamar WHERE kamar.Status_kamar = 'tersedia'", (err, result: ResultSetHeader) => {
        if (err) {
            respone(400, err, "error", res);
        } else if (Array.isArray(result) && result.length === 0) {
            res.status(404).json({
                status: 404,
                message: "data not found"
            })
        } else {
            respone(200, result, "success", res);
        }
    });
}

// const createRoom = async (req: Request, res: Response) => {
//     const { Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar } = req.body;
//     try {
//         const result = db.query("INSERT INTO kamar (Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar) VALUES (?, ?, ?, ?, ?, ?, ?)", [Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar], (err, result: ResultSetHeader) => {
//             if (err) {
//                 respone(400, err, "error", res);
//             } else {
//                 const kamarId = result.insertId;
//                 db.query("INSERT INTO fasilitas_kamar (No_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_tambahan, Aksebilitas, Kebersihan, Minibar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [kamarId, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar]);
//                 respone(200, result, "success", res);
//             }
//         });
//     } catch (err) {
//         respone(400, err, "error", res);
//     }
// }

const createRoom = async (req: Request, res: Response) => {
    const { Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar } = req.body;

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

    if (fileSize > 5000000) {
        return res.status(422).json({ msg: "Gambar harus kurang dari 5 MB" });
    }

    try {
        const roomResult = await queryAsync("INSERT INTO kamar (Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar) VALUES (?, ?, ?, ?, ?, ?, ?)", [Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar]);
        const kamarId = roomResult.insertId;

        await queryAsync("INSERT INTO fasilitas_kamar (No_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_tambahan, Aksebilitas, Kebersihan, Minibar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [kamarId, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar]);

        await file.mv(`./public/images/${fileName}`);

        await queryAsync("INSERT INTO images(name, image, url, No_kamar) VALUES(?,?,?,?)", [req.body.title, fileSize, url, kamarId]);

        res.status(201).json({ msg: "Room and Image Created Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error while processing your request" });
    }
}

const getRoomDetails = (req: Request, res: Response) => {
    const roomId = req.params.id;
    db.query("SELECT k.*, f.Nama_fasilitas, f.Harga_kamar, f.Lemari, f.Kasur, f.Kulkas, f.Kursi, f.Meja, f.Kamar_mandi, f.Bathroom, f.Sofa, f.Kapasitas, f.Keamanan, f.Layanan_tambahan, f.Aksebilitas, f.Kebersihan, f.Minibar FROM kamar k LEFT JOIN fasilitas_kamar f ON k.No_kamar = f.No_kamar WHERE k.No_kamar = ?", [roomId], (err, result) => {
        if (err) {
            respone(400, err, "error", res);
        } else if (Array.isArray(result) && result.length === 0) {
            res.status(404).json({
                status: 404,
                message: "Data kamar tidak ditemukan"
            });
        } else {
            respone(200, result, "success", res);
        }
    });
}

const UploadImages = async (req: Request, res: Response) => {
    console.log(req.files);
    console.log(req.body);
    if (!req.files || !req.files.file) {
        return res.status(400).json({ msg: "No File Uploaded" });
    }

    const file = req.files.file as UploadedFile;

    if (!file) {
        return res.status(400).json({ msg: "File is not found in the request" });
    }

    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = ['.png', '.jpg', '.jpeg'];

    if (!allowedType.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid Image Type" });
    }

    if (fileSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5 MB" });
    }

    file.mv(`./public/images/${fileName}`, async (err) => {
        if (err) {
            return res.status(500).json({ msg: err.message });
        }

        try {
            db.query("INSERT INTO images(name, image, url) VALUES(?,?,?)", [req.body.title, fileSize, url], (err, result) => {
                if (err) {
                    return res.status(500).json({ msg: err.message });
                }
                res.status(201).json({ msg: "Product Created Successfully" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Error while inserting data into database" });
        }
    });
}



export { getRooms, createRoom, getRoomDetails, UploadImages };