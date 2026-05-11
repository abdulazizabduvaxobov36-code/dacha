import express from 'express';
import { addReview, getChefReviews, getCustomerReview, deleteReview, getAllReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', addReview);
router.get('/admin/all', getAllReviews);                                           // Admin: barcha izohlar
router.get('/:chefPhone', getChefReviews);
router.get('/:chefPhone/customer/:customerPhone', getCustomerReview);
router.delete('/:id', deleteReview);

export default router;