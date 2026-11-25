import mongoose, { Schema } from 'mongoose';
const VariantSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: String, required: true },
    image: { type: String },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    stock: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
});
const HotspotSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    partName: { type: String, required: true },
    description: { type: String, required: true },
    benefits: { type: String, required: true },
    technicalInfo: { type: String },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    image: { type: String },
});
const ProductSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String, required: true }],
    variants: [VariantSchema],
    specifications: [
        {
            key: { type: String },
            value: { type: String },
        },
    ],
    features: [{ type: String }],
    hotspots: [HotspotSchema],
    model3D: {
        enabled: { type: Boolean, default: true },
        color: { type: String, default: '#789575' },
        shape: { type: String, enum: ['serum', 'candle', 'jar', 'mist'], default: 'serum' },
    },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    SKU: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    ingredients: { type: String },
    howToUse: { type: String },
    shippingInfo: { type: String },
    returnPolicy: { type: String },
}, {
    timestamps: true,
});
ProductSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ featured: 1, bestSeller: 1, trending: 1 });
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
