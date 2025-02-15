import express, { Application } from "express";
import cors from 'cors';
import router from './router';
import { errorResponse } from './Middlewares/errorMiddleware';
import { noPath } from './Middlewares/noPathMiddleware';
import { accessLog } from "./Middlewares/accessLog";

const app: Application = express();

const corsOptions = {
    origin: 'http://localhost:80',
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());
const PORT = 80;

app.use(accessLog);
app.use(router);
app.use(noPath);
app.use(errorResponse);

try {
    app.listen(PORT, () => {
        console.log('[info] the server is running');
    });
} catch (e) {
    if (e instanceof Error) {
        console.error(e.message);
    }
};
