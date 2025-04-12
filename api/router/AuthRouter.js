import express from 'express'
import { google, signin, signout, signup } from '../controller/AuthController.js';

const router = express.Router();

router.post('/sign-up',signup);
router.post('/sign-in',signin);
router.post("/sign-out",signout);
router.post("/google",google);

export default router;