import { authLogin, authLogout } from "../controllers/auth";
import { getRooms, createRoom, getRoomDetails, UploadImages } from "../controllers/rooms";
import { getUsers, createUser } from "../controllers/users";
import express from "express"
import { AuthRegister } from "../controllers/auth";


const routers = express.Router()

routers.get('/getusers', getUsers);
routers.post('/addusers', createUser);
routers.post('/auth/login', authLogin)
routers.post('/auth/register', AuthRegister)
routers.post('/auth/logout', authLogout)
routers.get('/rooms', getRooms);
routers.post('/rooms', createRoom);
routers.get('/rooms/:id', getRoomDetails);
routers.post('/upload', UploadImages);

export default routers;