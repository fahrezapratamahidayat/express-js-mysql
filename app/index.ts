import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routers from './routes/routers';
import FileUpload from "express-fileupload"

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});
app.use(FileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true
}));
app.use(express.static("public"));

// app.use((req, res, next) => {
//     res.status(500).send('Something broke!');
// });

app.use("/api", routers)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});