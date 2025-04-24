import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import AuthRouter from './router/AuthRouter.js';
import UserRouter from './router/UserRouter.js';
import ListingRouter from './router/ListingRouter.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://ozalwarestate.vercel.app'
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Server is working!');
});

app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);
app.use('/api/listing', ListingRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

connectDb();

export default app;
