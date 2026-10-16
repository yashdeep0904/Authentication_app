import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    googleId: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    
    // ADVANCED UPGRADE: Store session metadata alongside the token
    refreshTokens: [{ 
        token: { type: String, required: true },
        deviceInfo: { type: String }, // e.g., "Mozilla/5.0 (Macintosh...)"
        ipAddress: { type: String },  // e.g., "192.168.1.1"
        createdAt: { type: Date, default: Date.now }
    }] 
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export { User }