import mongoose, { Schema } from 'mongoose';
const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String, required: true },
    title: { type: String, required: true },
    variantName: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sku: { type: String, required: true },
    slug: { type: String, required: true },
});
const StatusHistorySchema = new Schema({
    status: { type: String, required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
});
const OrderSchema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'Pakistan' },
        notes: { type: String },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COLLECTED', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
    },
    orderStatus: {
        type: String,
        enum: [
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'PACKED',
            'DISPATCHED',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED',
            'RETURN_REQUESTED',
            'RETURNED',
        ],
        default: 'PENDING',
    },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    courierCompany: { type: String, default: 'TCS / Leopards Courier' },
    trackingNumber: { type: String },
    deliveryNotes: { type: String },
    statusHistory: [StatusHistorySchema],
}, {
    timestamps: true,
});
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
