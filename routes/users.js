import express from 'express';
import {
  getAllChefs, getAllChefsAdmin, getChefByPhone, upsertChef, updateChef, deleteChef, toggleBlockChef, notifyChef, notifyChefEvent, linkChefTelegram,
  upsertCustomer, updateCustomer, getCustomerByPhone, getAllCustomers, deleteCustomer, toggleBlockCustomer,
} from '../controllers/userController.js';

const router = express.Router();

// ─── OSHPAZLAR ───────────────────────────────────────────────
router.get('/chefs', getAllChefs);                        // Foydalanuvchilar uchun (bloklanganlarsiz)
router.get('/admin/chefs', getAllChefsAdmin);             // Admin uchun (barchasi)
router.get('/chefs/:phone', getChefByPhone);             // Bitta oshpaz
router.post('/chefs', upsertChef);                       // Qo'shish / yangilash
router.put('/chefs/:phone', updateChef);                 // Profil yangilash
router.patch('/chefs/:phone/block', toggleBlockChef);    // Bloklash toggle
router.post('/chefs/:phone/notify', notifyChef);         // Ogohlantirish yuborish
router.post('/chefs/:phone/link-telegram', linkChefTelegram); // TelegramId ni saqlash
router.delete('/chefs/:phone', deleteChef);              // O'chirish

router.post('/notify/chef-event', notifyChefEvent);      // Mijoz xabari/buyurtma/baho bildirishi

// ─── MIJOZLAR ─────────────────────────────────────────────────
router.get('/customers', getAllCustomers);                        // Admin: barcha mijozlar
router.get('/customers/:phone', getCustomerByPhone);             // Bitta mijoz
router.post('/customers', upsertCustomer);                       // Qo'shish / yangilash
router.put('/customers/:phone', updateCustomer);                 // Profil yangilash
router.patch('/customers/:phone/block', toggleBlockCustomer);    // Bloklash toggle
router.delete('/customers/:phone', deleteCustomer);              // O'chirish

export default router;