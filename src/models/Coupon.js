import mongoose, { Schema } from 'mongoose';
const CouponSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
}, {
    timestamps: true,
});
export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
