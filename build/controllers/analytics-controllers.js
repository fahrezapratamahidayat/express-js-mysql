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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.getMonthlyRevenue = exports.getTotalRevenue = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
const getTotalRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { period } = req.query; // 'daily', 'bulanan', 'tahunan'
    let dateFilter;
    switch (period) {
        case 'daily':
            dateFilter = (0, date_fns_1.startOfDay)(new Date());
            break;
        case 'bulanan':
            dateFilter = (0, date_fns_1.startOfMonth)(new Date());
            break;
        case 'tahunan':
            dateFilter = (0, date_fns_1.startOfYear)(new Date());
            break;
        default:
            dateFilter = (0, date_fns_1.startOfMonth)(new Date()); // Default ke bulanan jika tidak spesifik
            break;
    }
    try {
        const totalRevenue = yield prisma.pembayaran.aggregate({
            _sum: {
                jumlahBayar: true
            },
            where: {
                statusPembayaran: "lunas",
                tanggalBayar: {
                    gte: dateFilter
                }
            }
        });
        res.json({
            status: 200,
            message: `Total pendapatan dari periode ${period} berhasil diambil.`,
            data: {
                totalPendapatan: totalRevenue._sum.jumlahBayar || 0 // Jika tidak ada pembayaran, kembalikan 0
            }
        });
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.getTotalRevenue = getTotalRevenue;
const getMonthlyRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYearDate = (0, date_fns_1.startOfYear)(new Date());
        // Inisialisasi pendapatan per bulan dengan total 0
        const monthlyRevenue = {};
        for (let month = 0; month < 12; month++) {
            monthlyRevenue[month] = { total: 0 };
        }
        const payments = yield prisma.pembayaran.findMany({
            where: {
                tanggalBayar: {
                    gte: startOfYearDate,
                },
                statusPembayaran: "lunas",
                reservasi: {
                    statusReservasi: "Diterima"
                }
            },
            select: {
                tanggalBayar: true,
                jumlahBayar: true
            }
        });
        payments.forEach(payment => {
            const month = payment.tanggalBayar.getMonth();
            monthlyRevenue[month].total += payment.jumlahBayar;
        });
        const formattedData = Object.keys(monthlyRevenue).map(month => ({
            name: (0, date_fns_1.format)(new Date(currentYear, parseInt(month)), 'MMM'),
            total: monthlyRevenue[month].total
        }));
        res.json({
            status: 200,
            message: `Pendapatan bulanan untuk tahun ${currentYear} berhasil diambil.`,
            data: formattedData,
            year: currentYear
        });
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message,
        });
    }
});
exports.getMonthlyRevenue = getMonthlyRevenue;
const getAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { period } = req.query; // 'daily', 'bulanan', 'tahunan'
    let dateFilter;
    switch (period) {
        case 'daily':
            dateFilter = (0, date_fns_1.startOfDay)(new Date());
            break;
        case 'bulanan':
            dateFilter = (0, date_fns_1.startOfMonth)(new Date());
            break;
        case 'tahunan':
            dateFilter = (0, date_fns_1.startOfYear)(new Date());
            break;
        default:
            dateFilter = (0, date_fns_1.startOfMonth)(new Date());
            break;
    }
    try {
        const totalRevenue = yield prisma.pembayaran.aggregate({
            _sum: {
                jumlahBayar: true
            },
            where: {
                statusPembayaran: "lunas",
                tanggalBayar: {
                    gte: dateFilter
                },
                reservasi: {
                    statusReservasi: "Diterima"
                }
            }
        });
        const totalMembers = yield prisma.tamu.count();
        const totalRooms = yield prisma.kamar.count();
        const totalReservations = yield prisma.reservasi.count({
            where: {
                tanggalCheckIn: {
                    gte: dateFilter
                }
            }
        });
        const averageStayDuration = yield prisma.reservasi.aggregate({
            _avg: {
                durasiMenginap: true
            },
            where: {
                tanggalCheckIn: {
                    gte: dateFilter
                }
            }
        });
        const mostPopularRoomType = yield prisma.kamar.groupBy({
            by: ['tipeKamar'],
            _count: {
                tipeKamar: true
            },
            orderBy: {
                _count: {
                    tipeKamar: 'desc'
                }
            },
            take: 1
        });
        const averageRoomRating = yield prisma.kamar.aggregate({
            _avg: {
                ratingKamar: true
            }
        });
        res.json({
            status: 200,
            message: `Total pendapatan dari ${period} berhasil diambil.`,
            data: {
                totalPendapatan: totalRevenue._sum.jumlahBayar || 0,
                totalPengguna: totalMembers,
                totalReservasi: totalReservations,
                totalKamar: totalRooms,
                rataRataDurasiMenginap: averageStayDuration._avg.durasiMenginap || 0,
                tipeKamarTerpopuler: ((_a = mostPopularRoomType[0]) === null || _a === void 0 ? void 0 : _a.tipeKamar) || "Tidak tersedia",
                rataRataRatingKamar: averageRoomRating._avg.ratingKamar || 0
            }
        });
    }
    catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
});
exports.getAnalytics = getAnalytics;
