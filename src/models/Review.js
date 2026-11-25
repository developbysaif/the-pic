import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
}, {
    timestamps: true,
});
ReviewSchema.index({ productId: 1, status: 1 });
export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
