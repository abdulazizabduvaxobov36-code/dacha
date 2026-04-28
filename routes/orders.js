import express from 'express';
import {
  createOrder,
  getChefOrders,
  updateOrderStatus,
  getAllOrders,
  getCommissions,
  getChefCommission,
  clearAllOrders,
} from '../controllers/orderController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// ─── OSHPAZ endpointlari ─────────────────────────────────────
router.post('/', createOrder);          // Yangi buyurtma
router.get('/chef/:chefPhone', getChefOrders);        // Oshpazning buyurtmalari + hisob
router.patch('/:id/status', updateOrderStatus);    // Holatni yangilash

// ─── ADMIN endpointlari ──────────────────────────────────────
router.get('/admin/orders', getAllOrders);         // Barcha buyurtmalar
router.get('/admin/commissions', getCommissions);       // Barcha oshpazlar hisobi
router.get('/admin/commissions/:chefPhone', getChefCommission);    // Bitta oshpaz hisobi
router.delete('/admin/clear-all', clearAllOrders);                 // Barcha buyurtmalarni o'chirish

export default router;