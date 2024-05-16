import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export const addReservation = async (req: Request, res: Response) => {
    const { noKamar, noTamu, checkIn, checkOut } = req.body;
    const tanggalCheckIn = new Date(checkIn);
    const tanggalCheckOut = new Date(checkOut);
    const durasiMenginap = (tanggalCheckOut.getTime() - tanggalCheckIn.getTime()) / (1000 * 3600 * 24);

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const reservation = await prisma.reservation.create({
                data: {
                    noKamar: parseFloat(noKamar),
                    noTamu: parseFloat(noTamu),
                    tanggalCheckIn,
                    tanggalCheckOut,
                },
                include: {
                    kamar: true,
                }
            });
            const tarifKamar = await prisma.kamar.findUnique({
                where: {
                    nomerKamar: reservation.noKamar
                },
                include: {
                    fasilitas: true
                }
            })
            if (!tarifKamar) {
                return res.json({
                    status: 404,
                    message: "Kamar tidak ditemukan"
                })
            }
            const totalHargaFasilitas = tarifKamar.fasilitas.reduce((acc, fasilitas) => acc + fasilitas.hargaFasilitas, 0);
            const jumlahBayar = durasiMenginap * 500000 + totalHargaFasilitas;
            const url = `http://localhost:5173/confirm_payment/${reservation.reservationId}`;
            const qrCode = await QRCode.toDataURL(url);
            const payment = await prisma.payment.create({
                data: {
                    noTamu: reservation.noTamu,
                    noReservasi: reservation.reservationId,
                    statusPembayaran: "pending",
                    jumlahBayar,
                    metodePembayaran: "e-wallet",
                    tanggalBayar: tanggalCheckOut,
                }
            });

            return { reservation, payment, qrCode };
        });

        res.json({
            status: 200,
            message: "Reservasi berhasil dibuat! Silakan tunggu konfirmasi.",
            data: result
        });
    } catch (error: any) {
        res.json({
            status: 400,
            message: error.message
        });
    }
}

export const getReservasion = async (req: Request, res: Response) => {
    try {
        const getReservasion = await prisma.reservation.findMany({
            include: {
                kamar: true,
                tamu: true,
                Payment: true
            }
        })
        res.json({
            status: 200,
            message: "data found",
            datas: getReservasion
        })
    } catch (error: any) {
        res.json({
            status: 400,
            message: error.message
        })
    }
}

export const updatedReservasion = async (req: Request, res: Response) => {
    const { reservationId, statusReservasi } = req.body;

    try {
        const updatedReservation = await prisma.reservation.update({
            where: {
                reservationId: parseFloat(reservationId)
            },
            data: {
                statusReservasi: statusReservasi
            }
        });

        res.json({
            status: 200,
            message: "Status reservasi berhasil diupdate!",
            data: updatedReservation
        });
    } catch (error: any) {
        res.json({
            status: 400,
            message: error.message
        });
    }
}

export const confirmPayment = async (req: Request, res: Response) => {
    const { paymentId, amount } = req.body;

    try {
        const payment = await prisma.payment.findUnique({
            where: {
                paymentId: parseFloat(paymentId)
            },
        });

        if (payment && payment.jumlahBayar === parseFloat(amount)) {
            const updatePayment = await prisma.payment.update({
                where: {
                    paymentId: parseFloat(paymentId),
                },
                data: {
                    statusPembayaran: "paid"
                }
            });
            res.json({
                status: 200,
                message: "Status pembayaran berhasil!! Silakan tunggu konfirmasi dari pihak admin!",
                data: updatePayment
            });
        } else {
            res.json({
                status: 400,
                message: "Jumlah bayar tidak sesuai!"
            });
        }
    } catch (error: any) {
        res.json({
            status: 400,
            message: error.message
        });
    }
}