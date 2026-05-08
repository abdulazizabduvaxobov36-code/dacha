import express from 'express';
import {
  sendFeedback,
  getCustomerFeedbacks,
  getChefFeedbacks,
  markFeedbackRead,
  replyToFeedback,
  getMyFeedbacks,
  deleteFeedback,
} from '../controllers/feedbackController.js';

const router = express.Router();

// Foydalanuvchi endpointlari
router.post('/', sendFeedback);                          // Xabar yuborish
router.get('/my/:phone', getMyFeedbacks);                // O'z xabarlarini ko'rish

// Admin endpointlari
router.get('/admin/customers', getCustomerFeedbacks);    // Mijozlar xabarlari
router.get('/admin/chefs', getChefFeedbacks);            // Oshpazlar xabarlari
router.patch('/admin/:id/read', markFeedbackRead);       // O'qildi
router.patch('/admin/:id/reply', replyToFeedback);       // Javob berish
router.delete('/admin/:id', deleteFeedback);             // O'chirish

export default router;
