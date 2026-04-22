import express from 'express';
import {
  getAllChefs, getChefByPhone, upsertChef, updateChef, deleteChef,
  upsertCustomer, updateCustomer, getCustomerByPhone, getAllCustomers,
} from '../controllers/userController.js';

const router = express.Router();

// ─── OSHPAZLAR ───────────────────────────────────────────────
router.get('/chefs', getAllChefs);       // Barcha oshpazlar
router.get('/chefs/:phone', getChefByPhone);   // Bitta oshpaz
router.post('/chefs', upsertChef);       // Qo'shish / yangilash
router.put('/chefs/:phone', updateChef);       // Profil yangilash
router.delete('/chefs/:phone', deleteChef);       // O'chirish

// ─── MIJOZLAR ─────────────────────────────────────────────────
router.get('/customers', getAllCustomers);   // Admin: barcha mijozlar
router.get('/customers/:phone', getCustomerByPhone); // Bitta mijoz
router.post('/customers', upsertCustomer);   // Qo'shish / yangilash
router.put('/customers/:phone', updateCustomer);   // Profil yangilash

export default router;