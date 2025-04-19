import express from 'express'
import { verifyUser } from '../utils/verifyUser.js';
import { createListing, deleteListing } from '../controller/LisitingController.js';

const router = express.Router();

router.post('/create',verifyUser, createListing);
router.post('/delete/:id', verifyUser, deleteListing);

export default router;