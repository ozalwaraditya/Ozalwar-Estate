import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRouter from './router/authRouter.js'

dotenv.config();

const app = express();
app.use(express.json());

const connectDb = async () => {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log('Connected to Db');
    }).catch((err)=>{
        console.log(err);
    })
}

app.listen(process.env.PORT,()=>{
    console.log("Server is working... port : "+ process.env.PORT);
    connectDb();
})

app.use('/api/auth',authRouter);


app.use((err, req, res, next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server error";
    return res.status(statusCode).json({
        success : false,
        statusCode,
        message : message
    })
})