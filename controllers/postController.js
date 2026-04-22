import Post from '../models/Post.js';
import mongoose from 'mongoose';

// GET /posts — barcha postlar
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('getAllPosts error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /posts/chef/:chefPhone — oshpaz postlari
export const getChefPosts = async (req, res) => {
  try {
    const posts = await Post.find({ chefPhone: req.params.chefPhone }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('getChefPosts error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// POST /posts — post qo'shish
export const createPost = async (req, res) => {
  try {
    const { chefPhone, chefName, chefImage, dishName, image } = req.body;
    if (!chefPhone || !dishName || !image) {
      return res.status(400).json({ message: 'chefPhone, dishName va image majburiy' });
    }
    const post = await Post.create({ chefPhone, chefName: chefName || '', chefImage: chefImage || '', dishName, image });
    res.status(201).json({ ok: true, post });
  } catch (err) {
    console.error('createPost error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// DELETE /posts/:id — post o'chirish
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    // ID to'g'riligini tekshirish
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Noto\'g\'ri post ID' });
    }
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: 'Post topilmadi' });
    }
    res.json({ ok: true, message: 'Post o\'chirildi' });
  } catch (err) {
    console.error('deletePost error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};