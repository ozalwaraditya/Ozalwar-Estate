import express from 'express'
import { DeleteUser, GetUserListings, UpdateUser } from '../controller/UserController.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/update/:id',verifyUser, UpdateUser);
router.delete('/delete/:id',verifyUser, DeleteUser);
router.get("/listings/:id", verifyUser, GetUserListings);

export default router;