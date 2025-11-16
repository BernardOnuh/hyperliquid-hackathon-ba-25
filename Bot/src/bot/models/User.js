import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: String,
  firstName: String,
  lastName: String,
  wallet: {
    address: String,
    privateKey: String, // Encrypted
    mnemonic: String,   // Encrypted
    createdAt: Date
  },
  balances: {
    HYPE: { type: Number, default: 0 },
    stHYPE: { type: Number, default: 0 },
    USDXL: { type: Number, default: 0 },
    USDC: { type: Number, default: 0 }
  },
  vaults: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vault'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Update last active on each interaction
userSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);