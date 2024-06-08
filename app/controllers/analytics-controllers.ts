import { PrismaClient } from "@prisma/client";
import { format, startOfDay, startOfMonth, startOfYear } from "date-fns";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getTotalRevenue = async (req: Request, res: Response) => {
  const { period } = req.query; // 'daily', 'bulanan', 'tahunan'
  let dateFilter;

  switch (period) {
    case 'daily':
      dateFilter = startOfDay(new Date());
      break;
    case 'bulanan':
      dateFilter = startOfMonth(new Date());
      break;
    case 'tahunan':
      dateFilter = startOfYear(new Date());
      break;
    default:
      dateFilter = startOfMonth(new Date()); // Default ke bulanan jika tidak spesifik
      break;
  }

  try {
    const totalRevenue = await prisma.pembayaran.aggregate({
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
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message
    });
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYearDate = startOfYear(new Date());

    // Inisialisasi pendapatan per bulan dengan total 0
    const monthlyRevenue: { [key: string]: { total: number } } = {};
    for (let month = 0; month < 12; month++) {
      monthlyRevenue[month] = { total: 0 };
    }

    const payments = await prisma.pembayaran.findMany({
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
      name: format(new Date(currentYear, parseInt(month)), 'MMM'),
      total: monthlyRevenue[month].total
    }));

    res.json({
      status: 200,
      message: `Pendapatan bulanan untuk tahun ${currentYear} berhasil diambil.`,
      data: formattedData,
      year: currentYear
    });
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  const { period } = req.query; // 'daily', 'bulanan', 'tahunan'
  let dateFilter;

  switch (period) {
    case 'daily':
      dateFilter = startOfDay(new Date());
      break;
    case 'bulanan':
      dateFilter = startOfMonth(new Date());
      break;
    case 'tahunan':
      dateFilter = startOfYear(new Date());
      break;
    default:
      dateFilter = startOfMonth(new Date());
      break;
  }

  try {
    const totalRevenue = await prisma.pembayaran.aggregate({
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

    const totalMembers = await prisma.tamu.count();
    const totalRooms = await prisma.kamar.count();

    const totalReservations = await prisma.reservasi.count({
      where: {
        tanggalCheckIn: {
          gte: dateFilter
        }
      }
    });

    const averageStayDuration = await prisma.reservasi.aggregate({
      _avg: {
        durasiMenginap: true
      },
      where: {
        tanggalCheckIn: {
          gte: dateFilter
        }
      }
    });

    const mostPopularRoomType = await prisma.kamar.groupBy({
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

    const averageRoomRating = await prisma.kamar.aggregate({
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
        tipeKamarTerpopuler: mostPopularRoomType[0]?.tipeKamar || "Tidak tersedia",
        rataRataRatingKamar: averageRoomRating._avg.ratingKamar || 0
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message
    });
  }
}