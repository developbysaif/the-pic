import mongoose, { Schema } from 'mongoose';
const AddressSchema = new Schema({
    title: { type: String, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Pakistan' },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [AddressSchema],
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
}, {
    timestamps: true,
});
export default mongoose.models.User || mongoose.model('User', UserSchema);
