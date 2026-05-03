import express from 'express';
import { getMessages, saveMessage, markRead, getChefChats } from '../controllers/chatController.js';

const router = express.Router();

router.get('/chef/:chefPhone', getChefChats);    // Oshpaz chatlari ro'yxati
router.get('/:chatId', getMessages);             // Chat xabarlari
router.post('/:chatId', saveMessage);            // Xabar saqlash
router.patch('/:chatId/read', markRead);         // O'qildi

export default router;
