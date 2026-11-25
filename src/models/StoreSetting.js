import mongoose, { Schema } from 'mongoose';
const StoreSettingSchema = new Schema({
    siteName: { type: String, default: 'SAGE & BOTANICA' },
    announcementText: {
        type: String,
        default: '🌿 Complimentary Express Delivery on all orders over Rs. 3,500 | 100% Pure Organic Extracts',
    },
    announcementActive: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 3500 },
    shippingFee: { type: Number, default: 250 },
    supportEmail: { type: String, default: 'concierge@sageandbotanica.com' },
    supportPhone: { type: String, default: '+92 300 1234567' },
    instagramUrl: { type: String, default: 'https://instagram.com' },
    heroTitle: { type: String, default: 'Botanical Alchemy for Mind & Skin' },
    heroSubtitle: {
        type: String,
        default: 'Crafted with cold-pressed alpine sage, organic seed elixirs, and restorative earth minerals. Made for timeless rejuvenation.',
    },
}, {
    timestamps: true,
});
export default mongoose.models.StoreSetting ||
    mongoose.model('StoreSetting', StoreSettingSchema);
