import db from '../configs/db.config';
import respone from '../utils/respone';
import { ResultSetHeader } from 'mysql2';
import { Request, Response } from 'express';

const getRooms = (req: Request, res: Response) => {
    db.query("select * from kamar", (err, result: ResultSetHeader) => {
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

const createRoom = async (req: Request, res: Response) => {
    const { Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar } = req.body;
    try {
        const result = db.query("INSERT INTO kamar (Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar) VALUES (?, ?, ?, ?, ?, ?, ?)", [Nama_kamar, ukuran_kamar, type_kamar, jenis_kamar, rating_kamar, diskon_kamar, status_kamar], (err, result: ResultSetHeader) => {
            if (err) {
                respone(400, err, "error", res);
            } else {
                const kamarId = result.insertId;
                db.query("INSERT INTO fasilitas_kamar (No_kamar, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_tambahan, Aksebilitas, Kebersihan, Minibar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [kamarId, Nama_fasilitas, Harga_kamar, Lemari, Kasur, Kulkas, Kursi, Meja, Kamar_Mandi, Bathroom, Sofa, Kapasitas, Keamanan, Layanan_Tambahan, Aksebilitas, Kebersihan, Minibar]);
                respone(200, result, "success", res);
            }
        });
    } catch (err) {
        respone(400, err, "error", res);
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

export { getRooms, createRoom, getRoomDetails };