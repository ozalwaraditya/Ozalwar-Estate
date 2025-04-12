import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import AuthRouter from './router/AuthRouter.js'
import cors from 'cors'

const corsOptions = {
  origin: 'http://localhost:5173',  
  credentials: true,
};

dotenv.config();
const app = express();

// Database connection functions
const connectDb = async () => {
    await mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("Connected to DB!!")
        })
        .catch((error) => {
            console.log("Error: " + error);
        })
}

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.listen(process.env.PORT, () => {
    console.log("Server is running on port: " + process.env.PORT);
    connectDb();
})

app.use('/api/auth', AuthRouter);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });