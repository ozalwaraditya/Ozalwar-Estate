import express from 'express'
import { signin, signup, signout } from '../controller/authController.js';

const app = express.Router();


app.post('/signup',signup);
app.post('/signin',signin);
app.get('/signout',signout);


export default app;