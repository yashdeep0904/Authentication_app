import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import dotenv from 'dotenv';
import helmet from 'helmet';
import getConnection from "./config/mongoDb.js";
import userRouter from './routes/user.routes.js';
import passport from "passport";
import "./config/passport.js";
import { connectRedis } from "./utils/redisClient.js";

dotenv.config({ path: './.env' });

const app = express();

// Enable reverse proxy support (Required for cloud platforms like Render/Heroku to handle secure HTTPS cookies)
app.set('trust proxy', 1);

// 1. Security Headers
app.use(helmet());

// 2. Production-Ready CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL // Your deployed Vercel/Netlify/Render frontend URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server / Postman requests (no origin) or allowed domains
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation: Access denied'));
        }
    },
    credentials: true,               // Required for secure HTTP-Only cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// (app.options('*', cors()) removed here to prevent path-to-regexp v8+ errors)

// 3. Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser()); // Required to read incoming cookies

// 4. Passport & Routes
app.use(passport.initialize());

app.get('/api/user', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is live' });
});
app.use('/api/user', userRouter);

// 5. Global Error Handler
app.use((error, req, res, next) => {
    const message = error.message || "server error";
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: message });
});

// 6. Database and Server Start
getConnection();
connectRedis();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running securely on port: ${PORT}`);
});