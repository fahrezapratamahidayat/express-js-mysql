import { Request, Response } from 'express';
import db from '../configs/db.config';
import respone from '../utils/respone';
import bcryptjs from 'bcryptjs';
import { ResultSetHeader } from 'mysql2';

const getUsers = (req: Request, res: Response) => {
    db.query("select * from tamu", (err, result) => {
        if (err) {
            respone(400, err, "error", res);
        } else {
            respone(200, result, "success", res);
        }
    });
}

const createUser = (req: Request, res: Response) => {
    const { Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal } = req.body;

    const salt = bcryptjs.genSaltSync(10);
    const hashPassword = bcryptjs.hashSync(Password, salt);

    db.query("INSERT INTO tamu (Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal], (err, result: ResultSetHeader) => {
        if (err) {
            respone(400, err, "error", res);
        } else {
            respone(200, result.affectedRows, "success", res, false);
        }
    })
}


export { getUsers, createUser };