import express from 'express';
import {
  sendFeedback,
  getCustomerFeedbacks,
  getChefFeedbacks,
  markFeedbackRead,
  deleteFeedback,
} from '../controllers/feedbackController.js';

const router = express.Router();

// Foydalanuvchi endpointlari
router.post('/', sendFeedback);                          // Xabar yuborish

// Admin endpointlari
router.get('/admin/customers', getCustomerFeedbacks);    // Mijozlar xabarlari
router.get('/admin/chefs', getChefFeedbacks);            // Oshpazlar xabarlari
router.patch('/admin/:id/read', markFeedbackRead);       // O'qildi
router.delete('/admin/:id', deleteFeedback);             // O'chirish

export default router;
