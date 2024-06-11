import { authLogin, authLoginPegawai, authLogout, authRegisterPegawai } from "../controllers/auth";
import { getRooms, createRoom, getRoomDetails, deleteRoom, updateRoom, uploadImagesToRooms, postComments } from "../controllers/rooms";
import { getUsers } from "../controllers/users";
import express, { Router } from "express"
import { AuthRegister } from "../controllers/auth";
import { getKabupaten, getKecamatan, getKelurahan, getProvinsi } from "../controllers/location";
import { addReservation, confirmPayment, deleteReservasion, getPaymentById, getReservasion, getReservationById, getReservationByUserId, getSuccessfulReservations, updatedReservasion } from "../controllers/reservation";
import { authenticate } from "../middlewares/middelware";
import { getAnalytics, getMonthlyRevenue, getTotalRevenue } from "../controllers/analytics-controllers";
const routers: Router = express.Router();

// Users
routers.get('/users', getUsers);

// Authentication
routers.post('/auth/login', authLogin);
routers.post('/auth/register', AuthRegister);
routers.post('/auth/logout', authLogout);
routers.post(`/auth/login/pegawai`, authLoginPegawai)
routers.post(`/auth/register/pegawai`, authRegisterPegawai)

// Rooms
routers.get('/rooms', getRooms);
routers.post('/rooms', createRoom);
routers.get('/rooms/:roomId', getRoomDetails);
routers.delete('/rooms/:roomId', deleteRoom);
routers.post('/rooms/uploadimages/:roomId', uploadImagesToRooms);
routers.put('/rooms/:roomId', updateRoom);
routers.post(`/rooms/comments/:roomId`, postComments)


// reservasi
routers.post('/reservation', addReservation);
routers.get('/reservation', getReservasion);
routers.put('/reservation', updatedReservasion);
routers.delete('/reservation/:reservationId', deleteReservasion);
routers.get('/reservation/:reservationId', getReservationById);
routers.get(`/reservation/user/:userId`, getReservationByUserId);
routers.get(`/successful-reservations`, getSuccessfulReservations)


// analytics
routers.get(`/analytics`, getAnalytics);
routers.get(`/analytics/monthly-revenue`, getMonthlyRevenue)
routers.get(`/analytics/revenue`, getTotalRevenue);


// payment
routers.post('/confirm-payment', confirmPayment);
routers.get(`//payments/:paymentId`, getPaymentById);

// Locations
routers.get('/locations/provinces', getProvinsi);
routers.get('/locations/districts/:provinceId', getKabupaten);
routers.get('/locations/subdistricts/:districtId', getKecamatan);
routers.get('/locations/villages/:subdistrictId', getKelurahan);

export default routers;