"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../controllers/auth");
const rooms_1 = require("../controllers/rooms");
const users_1 = require("../controllers/users");
const express_1 = __importDefault(require("express"));
const auth_2 = require("../controllers/auth");
const location_1 = require("../controllers/location");
const reservation_1 = require("../controllers/reservation");
const analytics_controllers_1 = require("../controllers/analytics-controllers");
const routers = express_1.default.Router();
// Users
routers.get('/users', users_1.getUsers);
// Authentication
routers.post('/auth/login', auth_1.authLogin);
routers.post('/auth/register', auth_2.AuthRegister);
routers.post('/auth/logout', auth_1.authLogout);
routers.post(`/auth/login/pegawai`, auth_1.authLoginPegawai);
routers.post(`/auth/register/pegawai`, auth_1.authRegisterPegawai);
// Rooms
routers.get('/rooms', rooms_1.getRooms);
routers.post('/rooms', rooms_1.createRoom);
routers.get('/rooms/:roomId', rooms_1.getRoomDetails);
routers.delete('/rooms/:roomId', rooms_1.deleteRoom);
routers.post('/rooms/uploadimages/:roomId', rooms_1.uploadImagesToRooms);
routers.put('/rooms/:roomId', rooms_1.updateRoom);
routers.post(`/rooms/comments/:roomId`, rooms_1.postComments);
// reservasi
routers.post('/reservation', reservation_1.addReservation);
routers.get('/reservation', reservation_1.getReservasion);
routers.put('/reservation', reservation_1.updatedReservasion);
routers.delete('/reservation/:reservationId', reservation_1.deleteReservasion);
routers.get('/reservation/:reservationId', reservation_1.getReservationById);
routers.get(`/reservation/user/:userId`, reservation_1.getReservationByUserId);
routers.get(`/successful-reservations`, reservation_1.getSuccessfulReservations);
// analytics
routers.get(`/analytics`, analytics_controllers_1.getAnalytics);
routers.get(`/analytics/monthly-revenue`, analytics_controllers_1.getMonthlyRevenue);
routers.get(`/analytics/revenue`, analytics_controllers_1.getTotalRevenue);
// payment
routers.post('/confirm-payment', reservation_1.confirmPayment);
routers.get(`//payments/:paymentId`, reservation_1.getPaymentById);
// Locations
routers.get('/locations/provinces', location_1.getProvinsi);
routers.get('/locations/districts/:provinceId', location_1.getKabupaten);
routers.get('/locations/subdistricts/:districtId', location_1.getKecamatan);
routers.get('/locations/villages/:subdistrictId', location_1.getKelurahan);
exports.default = routers;
