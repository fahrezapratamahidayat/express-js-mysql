import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import QRCode from 'qrcode';
import { addDays, format } from "date-fns";
import { startOfDay, startOfMonth, startOfYear } from 'date-fns';

const prisma = new PrismaClient();

export const addReservation = async (req: Request, res: Response) => {
    const { noKamar, noTamu, checkIn, durasiInap, jumlahTamu, permintaanTamu } = req.body;
    const tanggalCheckIn = new Date(checkIn);
    const checkOutDate = addDays(tanggalCheckIn, parseInt(durasiInap));
    const hariIni = new Date();
    let batasWaktuBayar;

    // Menentukan batas waktu bayar berdasarkan jarak tanggal check-in
    if (tanggalCheckIn.getDate() === addDays(hariIni, 1).getDate()) {
        // Jika check-in adalah besok, batas waktu bayar adalah 12 jam dari sekarang
        batasWaktuBayar = addDays(hariIni, 0.5); // 12 jam dari sekarang
    } else {
        // Jika check-in lebih dari satu hari lagi, batas waktu bayar adalah 24 jam dari sekarang
        batasWaktuBayar = addDays(hariIni, 1); // 24 jam dari sekarang
    }
    try {
        const result = await prisma.$transaction(async (prisma) => {
            const reservation = await prisma.reservasi.create({
                data: {
                    idKamar: parseInt(noKamar),
                    idTamu: parseInt(noTamu),
                    tanggalCheckIn,
                    tanggalCheckOut: checkOutDate,
                    durasiMenginap: parseInt(durasiInap),
                    jumlahTamu: parseInt(jumlahTamu),
                    permintaanTamu
                }
            });
            const tarifKamar = await prisma.kamar.findUnique({
                where: {
                    idKamar: reservation.idKamar
                },
            })
            if (!tarifKamar) {
                return res.json({
                    status: 404,
                    message: "Kamar tidak ditemukan"
                })
            }
            const jumlahBayar = (tarifKamar.hargaKamar * parseInt(durasiInap) * (1 - tarifKamar.diskonKamar / 100));
            const url = `http://localhost:5173/confirm_payment/${reservation.idReservasi}`;
            const qrCode = await QRCode.toDataURL(url);
            const payment = await prisma.pembayaran.create({
                data: {
                    idTamu: reservation.idTamu,
                    idReservasi: reservation.idReservasi,
                    statusPembayaran: "pending",
                    jumlahBayar,
                    metodePembayaran: "????",
                    tanggalBayar: checkOutDate,
                    batasWaktuBayar
                }
            });
            const updatedReservasion = await prisma.reservasi.update({
                where: {
                    idReservasi: reservation.idReservasi
                },
                data: {
                    idPembayaran: payment.idPembayaran
                }
            });

            // return { reservation, payment, qrCode };
            return {
                reservationId: reservation.idReservasi,
                paymentId: payment.idPembayaran,
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
        const getReservasion = await prisma.reservasi.findMany({
            include: {
                kamar: true,
                tamu: true,
                Pembayaran: true
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
        const result = await prisma.$transaction(async (prisma) => {
            const updatedReservation = await prisma.reservasi.update({
                where: {
                    idReservasi: parseFloat(reservationId)
                },
                data: {
                    statusReservasi: statusReservasi
                }
            });

            // Jika status reservasi diupdate menjadi 'confirmed', update status kamar menjadi 'reserved'
            if (statusReservasi === 'Diterima') {
                const reservationDetails = await prisma.reservasi.findUnique({
                    where: {
                        idReservasi: parseFloat(reservationId)
                    },
                    include: {
                        kamar: true // Pastikan relasi dengan kamar sudah benar
                    }
                });

                if (reservationDetails && reservationDetails.kamar) {
                    await prisma.kamar.update({
                        where: {
                            idKamar: reservationDetails.kamar.idKamar
                        },
                        data: {
                            statusKamar: 'Dipesan'
                        }
                    });
                }
            }

            return updatedReservation;
        });

        res.json({
            status: 200,
            message: "Status reservasi dan kamar berhasil diupdate!",
            data: result
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
        const deletedReservation = await prisma.reservasi.delete({
            where: {
                idReservasi: parseFloat(reservationId)
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
        const reservation = await prisma.reservasi.findUnique({
            where: {
                idReservasi: parseInt(reservationId)
            },
            include: {
                kamar: true,
                tamu: true,
                Pembayaran: true
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

export const getReservationByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const reservations = await prisma.reservasi.findMany({
            where: {
                idTamu: parseInt(userId)
            },
            include: {
                kamar: {
                    include: {
                        Gambar: true,
                    }
                },
                Pembayaran: true
            }
        });

        if (reservations.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Reservasi untuk user ini tidak ditemukan"
            });
        }

        res.json({
            status: 200,
            message: "Data reservasi ditemukan",
            data: reservations
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
        const payment = await prisma.pembayaran.findUnique({
            where: {
                idPembayaran: parseInt(paymentId)
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
    const { paymentId, amount, metodePembayaran } = req.body;

    try {
        const payment = await prisma.pembayaran.findUnique({
            where: {
                idPembayaran: parseFloat(paymentId)
            },
        });

        if (!payment) {
            return res.status(404).json({
                status: 404,
                message: "Pembayaran tidak ditemukan."
            });
        }

        if (payment.statusPembayaran === "lunas") {
            return res.status(409).json({
                status: 409,
                message: "Pembayaran sudah dikonfirmasi sebelumnya."
            });
        }

        const waktuSekarang = new Date();
        const batasWaktuBayar = new Date(payment.batasWaktuBayar);
        if (waktuSekarang > batasWaktuBayar) {
            return res.status(400).json({
                status: 400,
                message: "Pembayaran gagal, melewati batas waktu yang ditentukan."
            });
        }

        // if (payment.jumlahBayar !== parseFloat(amount)) {
        //     return res.status(400).json({
        //         status: 400,
        //         message: "Jumlah bayar tidak sesuai!"
        //     });
        // }

        const updatePayment = await prisma.pembayaran.update({
            where: {
                idPembayaran: parseFloat(paymentId),
            },
            data: {
                statusPembayaran: "lunas",
                metodePembayaran,
            }
        });

        res.status(200).json({
            status: 200,
            message: "Status pembayaran berhasil dikonfirmasi! Silakan tunggu konfirmasi dari pihak Hotel.",
            data: updatePayment
        });
    } catch (error: any) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
}

export const getSuccessfulReservations = async (req: Request, res: Response) => {
    try {
        const successfulReservations = await prisma.reservasi.findMany({
            where: {
                Pembayaran: {
                    statusPembayaran: "lunas"
                }
            },
            include: {
                tamu: true,
                Pembayaran: true
            }
        });

        res.json({
            status: 200,
            message: "Reservasi dengan transaksi lunas berhasil diambil.",
            data: successfulReservations
        });
    } catch (error: any) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
}