import express from 'express'
import { UpdateUser } from '../controller/UserController.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/update/:id',verifyUser, UpdateUser);

export default router;