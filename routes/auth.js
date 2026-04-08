import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);       // Ro'yxatdan o'tish
router.post('/login',    login);          // Kirish
router.get ('/me',       protect, getMe); // O'z profilini olish (token kerak)
router.post('/logout',   protect, logout);// Chiqish

export default router;
