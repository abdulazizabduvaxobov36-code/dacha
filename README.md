# Oshpaz Backend API

Professional oshpazlar va mijozlar uchun to'liq backend xizmati.

## Xususiyatlar

- Foydalanuvchi ro'yxatdan o'tish va tizimga kirish
- Buyurtmalar boshqaruvi
- Oshpazlar baholash tizimi
- Postlar va sharhlar
- MongoDB ma'lumotlar bazasi
- JWT autentifikatsiya

## O'rnatish

```bash
npm install
```

## Ishga tushirish

```bash
npm run dev
# yoki
npm start
```

## API Endpoints

### Auth
- POST /auth/register - Ro'yxatdan o'tish
- POST /auth/login - Tizimga kirish
- GET /auth/me - Profil ma'lumotlari

### Orders
- POST /orders - Yangi buyurtma
- GET /orders/chef/:phone - Oshpaz buyurtmalari
- PATCH /orders/:id/status - Buyurtma holatini o'zgartirish

### Reviews
- POST /reviews - Baholash
- GET /reviews/:chefPhone - Oshpaz baholari

### Posts
- POST /posts - Yangi post
- GET /posts - Barcha postlar
- DELETE /posts/:id - Postni o'chirish
