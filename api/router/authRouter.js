import express from 'express'
import { signup } from '../controller/authController.js';

const router = express.Router()

router.get('/signup',signup);

export default router;