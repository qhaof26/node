import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';

const app = express();



app.use(cors());
app.use(cookieParser());
app.use(express.json());
dotenv.config();

const PORT = process.env.PORT;

// Routes
app.use("/v1/auth", authRoutes);
app.use("/v1/users", userRoutes);

app.listen(PORT,() =>{
    console.log(`server runing on ${PORT}`)
    connectDB();
})