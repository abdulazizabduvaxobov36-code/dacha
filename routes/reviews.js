import express from 'express';
import { addReview, getChefReviews, getCustomerReview } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', addReview);         // Baho qo'shish
router.get('/:chefPhone', getChefReviews);    // Oshpaz baholari
router.get('/:chefPhone/customer/:customerPhone', getCustomerReview); // Mijozning bahosi

export default router;