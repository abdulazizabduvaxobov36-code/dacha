import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import otpRoutes from './routes/otp.js';
import adminAuthRoutes from './routes/adminAuth.js';
import chatRoutes from './routes/chats.js';
import { startBot } from './bot.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: true, // Telegram Mini App har xil domendan kelishi mumkin
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));

app.use('/auth', authRoutes);
app.use('/auth', otpRoutes);
app.use('/auth', adminAuthRoutes);
app.use('/orders', orderRoutes);
app.use('/chats', chatRoutes);
app.use('/reviews', reviewRoutes);
app.use('/posts', postRoutes);
app.use('/', userRoutes);  // /chefs va /customers

app.get('/health', (_req, res) => res.json({ status: 'ok', message: '🍽️ DachaChef ishlayapti!' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dachachef';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB ulandi:', MONGO_URI))
  .catch((err) => console.error('❌ MongoDB xatosi:', err.message));

startBot();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🍽️  DachaChef backend ishga tushdi! → http://localhost:${PORT}`);
  console.log(`\n   AUTH:`);
  console.log(`   POST /auth/register | POST /auth/login | GET /auth/me`);
  console.log(`\n   OSHPAZLAR:`);
  console.log(`   GET  /chefs | POST /chefs | PUT /chefs/:phone | DELETE /chefs/:phone`);
  console.log(`\n   MIJOZLAR:`);
  console.log(`   GET  /customers/:phone | POST /customers | PUT /customers/:phone`);
  console.log(`\n   BUYURTMALAR:`);
  console.log(`   POST /orders | GET /orders/chef/:phone | PATCH /orders/:id/status`);
  console.log(`   GET  /orders/admin/orders | GET /orders/admin/commissions`);
  console.log(`\n   BAHOLAR:`);
  console.log(`   POST /reviews | GET /reviews/:chefPhone`);
  console.log(`\n   POSTLAR:`);
  console.log(`   POST /posts | GET /posts/chef/:chefPhone | DELETE /posts/:id\n`);
});