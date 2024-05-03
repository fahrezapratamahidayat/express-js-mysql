import { authLogin } from "../controllers/auth";
import { getRooms, createRoom, getRoomDetails } from "../controllers/rooms";
import { getUsers, createUser } from "../controllers/users";
import express from "express"
import { AuthRegister } from "../controllers/auth";


const routers = express.Router()

routers.get('/getusers', getUsers);
routers.post('/addusers', createUser);
routers.post('/auth/login', authLogin)
routers.post('/auth/register', AuthRegister)
// router.post('/auth/logout', authLogout)
routers.get('/rooms', getRooms);
routers.post('/rooms', createRoom);
routers.get('/rooms/:id', getRoomDetails);

export default routers;