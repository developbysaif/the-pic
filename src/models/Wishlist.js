import mongoose, { Schema } from 'mongoose';

const WishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
