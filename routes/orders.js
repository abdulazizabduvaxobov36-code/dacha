import express from 'express';
import {
  createOrder,
  getChefOrders,
  updateOrderStatus,
  getAllOrders,
  getCommissions,
  getChefCommission,
  getCustomerOrdersForChef,
  getCustomerAllOrders,
  getCustomerChefPairs,
} from '../controllers/orderController.js';
import {
  updateOrderRating,
  getChefRatings,
  getCustomerRatings,
} from '../controllers/ratingController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// ─── OSHPAZ endpointlari ─────────────────────────────────────
router.post('/',                    createOrder);          // Yangi buyurtma
router.get('/chef/:chefPhone',      getChefOrders);        // Oshpazning buyurtmalari + hisob
router.get('/customer/:customerPhone/chef/:chefPhone', getCustomerOrdersForChef); // Mijozning berilgan oshpazga buyurtmalari
router.get('/customer/:customerPhone/all', getCustomerAllOrders); // Mijozning barcha buyurtmalari (barcha oshpazlar)
router.get('/customer-chef-pairs', getCustomerChefPairs); // Admin: barcha mijoz-oshpaz juftliklari
router.patch('/:id/status',         updateOrderStatus);    // Holatni yangilash
router.patch('/:id/rating',         updateOrderRating);    // Baho va izoh qoldirish
router.get('/chef/:chefPhone/ratings', getChefRatings);    // Oshpazning barcha baholari
router.get('/customer/:customerPhone/ratings', getCustomerRatings); // Mijoz qoldirgan barcha baholar

// ─── ADMIN endpointlari ──────────────────────────────────────
router.get('/admin/orders',                 getAllOrders);         // Barcha buyurtmalar
router.get('/admin/commissions',            getCommissions);       // Barcha oshpazlar hisobi
router.get('/admin/commissions/:chefPhone', getChefCommission);    // Bitta oshpaz hisobi

export default router;
