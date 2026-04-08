import express from 'express';
import { getAllPosts, getChefPosts, createPost, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.get('/',                   getAllPosts);   // Barcha postlar
router.get('/chef/:chefPhone',    getChefPosts); // Oshpaz postlari — /chef/ prefiksi bilan
router.post('/',                  createPost);   // Post qo'shish
router.delete('/:id',             deletePost);   // Post o'chirish

export default router;
