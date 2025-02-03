import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './router/authRouter.js'
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use(express.json())
app.use(cookieParser())


const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connect to Db!!!!!")
    }).catch((err)=>{
        console.log(err)
    })
}


app.listen(process.env.PORT ,()=>{
    console.log("Server is working : " + process.env.PORT )
    connectDB();
})

app.use('/api/v1/auth',authRouter);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
});