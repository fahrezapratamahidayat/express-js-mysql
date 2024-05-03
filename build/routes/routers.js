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
const routers = express_1.default.Router();
routers.get('/getusers', users_1.getUsers);
routers.post('/addusers', users_1.createUser);
routers.post('/auth/login', auth_1.authLogin);
routers.post('/auth/register', auth_2.AuthRegister);
// router.post('/auth/logout', authLogout)
routers.get('/rooms', rooms_1.getRooms);
routers.post('/rooms', rooms_1.createRoom);
routers.get('/rooms/:id', rooms_1.getRoomDetails);
exports.default = routers;
//# sourceMappingURL=routers.js.map