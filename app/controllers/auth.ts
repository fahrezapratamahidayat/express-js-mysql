import respone from '../utils/respone';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import { ResultSetHeader } from 'mysql2';
import db from '../configs/db.config';

const authLogin = (req: Request, res: Response) => {
    const { email, password } = req.body;
    db.query("select * from tamu where Email_tamu = ?", [email], (err: any, result: ResultSetHeader) => {
        if (err) {
            respone(400, err, "error", res, false);
        }

        if (Array.isArray(result) && result.length === 0) {
            respone(404, "user not found", "error", res, false);
        }

        const users = Array.isArray(result) ? result[0] : null;
        if (!users) {
            return respone(404, "user not found", "error", res, false);
        }
        const confirmPassowrd = bcryptjs.compareSync(password, users.Password);
        if (!confirmPassowrd) {
            return res.status(400).json({
                status: 400,
                message: "password not match",
            })
        }
        const { ID_Tamu, Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal } = users;
        const accessTokenSecret = process.env.ACCESS_TOKEN_AUTH || 'defaultAccessTokenSecret';
        const refreshTokenSecret = process.env.REFRESH_TOKEN_AUTH || 'defaultRefreshTokenSecret';

        const accesToken = jwt.sign({ ID_Tamu, Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal }, accessTokenSecret, { expiresIn: '15s' });
        const refreshToken = jwt.sign({ ID_Tamu, Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal }, refreshTokenSecret, { expiresIn: '1d' });

        db.query("UPDATE tamu set refreshToken = ? where ID_Tamu = ?", [refreshToken, ID_Tamu], (err, result) => {
            if (err) {
                console.error("Error updating database:", err);
                return res.status(500).json({ message: 'Database update failed', error: err });
            }
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).json({
                status: 200,
                message: "success",
                token: accesToken
            });
        });
    });
}

const authLogout = (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    db.query('SELECT * FROM tamu WHERE refreshToken = ?', [refreshToken], (err, result) => {
        if (err) {
            res.status(400).json({
                status: 400,
                message: "invalid token"
            })
        } else {
            db.query('UPDATE tamu SET refreshToken = ? WHERE refreshToken = ?', [null, refreshToken], (err, result) => {
                if (err) {
                    console.log(err);
                }
                res.clearCookie('refreshToken');
                return res.sendStatus(204);
            })
        }
    })
}
const AuthRegister = (req: Request, res: Response) => {
    const { Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan, Dibuat_tanggal, Diupdate_tanggal } = req.body;

    const salt = bcryptjs.genSaltSync(10);
    const hashPassword = bcryptjs.hashSync(Password, salt);

    db.query("SELECT * FROM tamu WHERE Email_tamu = ?", [Email_tamu], (err, result) => {
        if (err) {
            respone(400, err, "error", res, false);
        } else if (Array.isArray(result) && result.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "email already exist",
            })
        } else {
            db.query("INSERT INTO tamu (Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, Password, Role_tamu, Status_tamu, Pekerjaan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [Nama_tamu, Email_tamu, Jenis_kelamin, Umur_tamu, Nomer_telephone_tamu, Alamat_tamu, hashPassword, Role_tamu, Status_tamu, Pekerjaan], (err, result) => {
                if (err) {
                    console.log(err);
                    respone(500, err, "error", res, false);
                } else {
                    res.status(201).json({
                        status: 201,
                        message: "user registered successfully",
                    });
                }
            });
        }
    })
}

export { authLogin, AuthRegister, authLogout }