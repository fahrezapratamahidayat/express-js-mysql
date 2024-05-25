import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import QRCode from 'qrcode';
import { addDays, format } from "date-fns";

const prisma = new PrismaClient();

export const addReservation = async (req: Request, res: Response) => {
    const { noKamar, noTamu, checkIn, durasiInap } = req.body;
    const tanggalCheckIn = new Date(checkIn);
    const checkOutDate = addDays(tanggalCheckIn, parseInt(durasiInap));

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const reservation = await prisma.reservation.create({
                data: {
                    noKamar: parseInt(noKamar),
                    noTamu: parseInt(noTamu),
                    tanggalCheckIn,
                    tanggalCheckOut: checkOutDate,
                    durasiMenginap: parseInt(durasiInap),
                }
            });
            const tarifKamar = await prisma.kamar.findUnique({
                where: {
                    nomerKamar: reservation.noKamar
                },
                include: {
                    fasilitasKamar: true
                }
            })
            if (!tarifKamar) {
                return res.json({
                    status: 404,
                    message: "Kamar tidak ditemukan"
                })
            }
            const totalHargaFasilitas = tarifKamar.fasilitasKamar?.hargaFasilitas || 0;
            const jumlahBayar = (tarifKamar.hargaKamar * parseInt(durasiInap) * (1 - tarifKamar.diskonKamar / 100)) + totalHargaFasilitas;
            const url = `http://localhost:5173/confirm_payment/${reservation.reservationId}`;
            const qrCode = await QRCode.toDataURL(url);
            const payment = await prisma.payment.create({
                data: {
                    noTamu: reservation.noTamu,
                    noReservasi: reservation.reservationId,
                    statusPembayaran: "pending",
                    jumlahBayar,
                    metodePembayaran: "????",
                    tanggalBayar: checkOutDate,
                }
            });
            const updatedReservasion = await prisma.reservation.update({
                where: {
                    reservationId: reservation.reservationId
                },
                data: {
                    noPayment: payment.paymentId
                }
            });

            // return { reservation, payment, qrCode };
            return {
                reservationId: reservation.reservationId,
                paymentId: payment.paymentId,
                checkInDate: tanggalCheckIn,
                checkOutDate: checkOutDate,
                stayDuration: parseInt(durasiInap),
                totalPayment: payment.jumlahBayar
            };
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

export const deleteReservasion = async (req: Request, res: Response) => {
    const { reservationId } = req.params
    try {
        const deletedReservation = await prisma.reservation.delete({
            where: {
                reservationId: parseFloat(reservationId)
            }
        })
        if (!deletedReservation) {
            return res.json({
                status: 404,
                message: "Data reservasi tidak ditemukan"
            })
        }

        res.json({
            status: 200,
            message: "data deleted",
            data: deletedReservation
        })
    } catch (error) {
        res.json({
            status: 400,
            message: error
        })
    }
}

export const getReservationById = async (req: Request, res: Response) => {
    const { reservationId } = req.params; // Mengambil ID dari parameter URL

    try {
        const reservation = await prisma.reservation.findUnique({
            where: {
                reservationId: parseInt(reservationId)
            },
            include: {
                kamar: true,
                tamu: true,
                Payment: true
            }
        });

        if (!reservation) {
            return res.status(404).json({
                status: 404,
                message: "Reservasi tidak ditemukan"
            });
        }

        res.json({
            status: 200,
            message: "Data reservasi ditemukan",
            data: reservation
        });
    } catch (error: any) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
}

export const getPaymentById = async (req: Request, res: Response) => {
    const { paymentId } = req.params; // Mengambil ID dari parameter URL

    try {
        const payment = await prisma.payment.findUnique({
            where: {
                paymentId: parseInt(paymentId)
            }
        });

        if (!payment) {
            return res.status(404).json({
                status: 404,
                message: "Pembayaran tidak ditemukan"
            });
        }

        res.json({
            status: 200,
            message: "Detail pembayaran ditemukan",
            data: payment
        });
    } catch (error: any) {
        res.status(400).json({
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

        if (!payment) {
            return res.status(404).json({
                status: 404,
                message: "Pembayaran tidak ditemukan."
            });
        }

        if (payment.statusPembayaran === "paid") {
            return res.status(409).json({
                status: 409,
                message: "Pembayaran sudah dikonfirmasi sebelumnya."
            });
        }

        if (payment.jumlahBayar !== parseFloat(amount)) {
            return res.status(400).json({
                status: 400,
                message: "Jumlah bayar tidak sesuai!"
            });
        }

        const updatePayment = await prisma.payment.update({
            where: {
                paymentId: parseFloat(paymentId),
            },
            data: {
                statusPembayaran: "paid"
            }
        });

        res.status(200).json({
            status: 200,
            message: "Status pembayaran berhasil dikonfirmasi! Silakan tunggu konfirmasi dari pihak admin.",
            data: updatePayment
        });
    } catch (error: any) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
}