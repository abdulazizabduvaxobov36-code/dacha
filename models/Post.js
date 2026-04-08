import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    chefPhone: { type: String, required: true },
    chefName:  { type: String, default: '' },
    chefImage: { type: String, default: '' },
    dishName:  { type: String, required: true },
    image:     { type: String, required: true }, // base64
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
