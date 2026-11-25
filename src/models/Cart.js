import mongoose, { Schema } from 'mongoose';
const CartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String, required: true },
    title: { type: String, required: true },
    variantName: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    sku: { type: String, required: true },
    slug: { type: String, required: true },
});
const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    guestId: { type: String },
    items: [CartItemSchema],
}, {
    timestamps: true,
});
CartSchema.index({ userId: 1 });
CartSchema.index({ guestId: 1 });
export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
