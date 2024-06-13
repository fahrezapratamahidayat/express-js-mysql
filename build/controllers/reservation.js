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
exports.getSuccessfulReservations = exports.confirmPayment = exports.getPaymentById = exports.getReservationByUserId = exports.getReservationById = exports.deleteReservasion = exports.updatedReservasion = exports.getReservasion = exports.addReservation = void 0;
const client_1 = require("@prisma/client");
const qrcode_1 = __importDefault(require("qrcode"));
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
const addReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { noKamar, noTamu, checkIn, durasiInap, jumlahTamu, permintaanTamu } = req.body;
    const tanggalCheckIn = new Date(checkIn);
    const checkOutDate = (0, date_fns_1.addDays)(tanggalCheckIn, parseInt(durasiInap));
    const hariIni = new Date();
    let batasWaktuBayar;
    // Menentukan batas waktu bayar berdasarkan jarak tanggal check-in
    if (tanggalCheckIn.getDate() === (0, date_fns_1.addDays)(hariIni, 1).getDate()) {
        // Jika check-in adalah besok, batas waktu bayar adalah 12 jam dari sekarang
        batasWaktuBayar = (0, date_fns_1.addDays)(hariIni, 0.5); // 12 jam dari sekarang
    }
    else {
        // Jika check-in lebih dari satu hari lagi, batas waktu bayar adalah 24 jam dari sekarang
        batasWaktuBayar = (0, date_fns_1.addDays)(hariIni, 1); // 24 jam dari sekarang
    }
    try {
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const reservation = yield prisma.reservasi.create({
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
            const tarifKamar = yield prisma.kamar.findUnique({
                where: {
                    idKamar: reservation.idKamar
                },
            });
            if (!tarifKamar) {
                return res.json({
                    status: 404,
                    message: "Kamar tidak ditemukan"
                });
            }
            const jumlahBayar = (tarifKamar.hargaKamar * parseInt(durasiInap) * (1 - tarifKamar.diskonKamar / 100));
            const url = `http://localhost:5173/confirm_payment/${reservation.idReservasi}`;
            const qrCode = yield qrcode_1.default.toDataURL(url);
            const payment = yield prisma.pembayaran.create({
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
            const updatedReservasion = yield prisma.reservasi.update({
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
        }));
        res.json({
            status: 200,
            message: "Reservasi berhasil dibuat! Silakan tunggu konfirmasi.",
            data: result
        });
    }
    catch (error) {
        res.json({
            status: 400,
            message: error.message
        });
    }
});
exports.addReservation = addReservation;
const getReservasion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getReservasion = yield prisma.reservasi.findMany({
            include: {
                kamar: true,
                tamu: true,
                Pembayaran: true
            }
        });
        res.json({
            status: 200,
            message: "data found",
            datas: getReservasion
        });
    }
    catch (error) {
        res.json({
            status: 400,
            message: error.message
        });
    }
});
exports.getReservasion = getReservasion;
const updatedReservasion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reservationId, statusReservasi, noPegawai } = req.body;
    try {
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const updatedReservation = yield prisma.reservasi.update({
                where: {
                    idReservasi: parseFloat(reservationId)
                },
                data: {
                    statusReservasi: statusReservasi,
                    idPegawaiPenanggungJawab: parseInt(noPegawai)
                }
            });
            if (statusReservasi === 'Diterima') {
                const reservationDetails = yield prisma.reservasi.findUnique({
                    where: {
                        idReservasi: parseFloat(reservationId)
                    },
                    include: {
                        kamar: true
                    }
                });
                if (reservationDetails && reservationDetails.kamar) {
                    yield prisma.kamar.update({
                        where: {
                            idKamar: reservationDetails.kamar.idKamar
                        },
                        data: {
                            statusKamar: 'Dipesan'
                        }
                    });
                    yield prisma.pembayaran.update({
                        where: {
                            idReservasi: parseFloat(reservationId)
                        },
                        data: {
                            idPegawaiPenerima: parseInt(noPegawai)
                        }
                    });
                }
            }
            return updatedReservation;
        }));
        res.json({
            status: 200,
            message: "Status reservasi dan kamar berhasil diupdate!",
            data: result
        });
    }
    catch (error) {
        res.json({
            status: 400,
            message: error.message
        });
    }
});
exports.updatedReservasion = updatedReservasion;
const deleteReservasion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reservationId } = req.params;
    try {
        const deletedReservation = yield prisma.reservasi.delete({
            where: {
                idReservasi: parseFloat(reservationId)
            }
        });
        if (!deletedReservation) {
            return res.json({
                status: 404,
                message: "Data reservasi tidak ditemukan"
            });
        }
        res.json({
            status: 200,
            message: "data deleted",
            data: deletedReservation
        });
    }
    catch (error) {
        res.json({
            status: 400,
            message: error
        });
    }
});
exports.deleteReservasion = deleteReservasion;
const getReservationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reservationId } = req.params; // Mengambil ID dari parameter URL
    try {
        const reservation = yield prisma.reservasi.findUnique({
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
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.getReservationById = getReservationById;
const getReservationByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const reservations = yield prisma.reservasi.findMany({
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
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.getReservationByUserId = getReservationByUserId;
const getPaymentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId } = req.params; // Mengambil ID dari parameter URL
    try {
        const payment = yield prisma.pembayaran.findUnique({
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
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.getPaymentById = getPaymentById;
const confirmPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId, amount, metodePembayaran } = req.body;
    try {
        const payment = yield prisma.pembayaran.findUnique({
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
        const updatePayment = yield prisma.pembayaran.update({
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
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.confirmPayment = confirmPayment;
const getSuccessfulReservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const successfulReservations = yield prisma.reservasi.findMany({
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
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.getSuccessfulReservations = getSuccessfulReservations;
