import mongoose from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption.js';

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
  
  address: {
    type: String,
    required: true,
    lowercase: true
  },
  encryptedPrivateKey: {
    iv: String,
    encryptedData: String,
    authTag: String
  },
  encryptedMnemonic: {
    iv: String,
    encryptedData: String,
    authTag: String
  },
  
  settings: {
    defaultLeverage: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    defaultAsset: {
      type: String,
      default: 'USDC'
    },
    targetHealthFactor: {
      type: Number,
      default: 2.0
    },
    autoRebalance: {
      type: Boolean,
      default: false
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  sessionState: {
    currentFlow: String,
    step: String,
    data: mongoose.Schema.Types.Mixed
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ address: 1 });
userSchema.index({ isActive: 1 });

userSchema.methods.getPrivateKey = function() {
  if (!this.encryptedPrivateKey) return null;
  return decrypt(this.encryptedPrivateKey);
};

userSchema.methods.getMnemonic = function() {
  if (!this.encryptedMnemonic) return null;
  return decrypt(this.encryptedMnemonic);
};

userSchema.methods.updateLastActive = async function() {
  this.lastActive = new Date();
  await this.save();
};

userSchema.methods.setSessionState = async function(flow, step, data = {}) {
  this.sessionState = { currentFlow: flow, step, data };
  await this.save();
};

userSchema.methods.clearSessionState = async function() {
  this.sessionState = { currentFlow: null, step: null, data: {} };
  await this.save();
};

userSchema.statics.findByTelegramId = function(telegramId) {
  return this.findOne({ telegramId: telegramId.toString() });
};

userSchema.statics.createUser = async function(telegramId, walletData, userInfo = {}) {
  const encryptedPrivateKey = encrypt(walletData.privateKey);
  const encryptedMnemonic = walletData.mnemonic ? encrypt(walletData.mnemonic) : null;

  const user = new this({
    telegramId: telegramId.toString(),
    username: userInfo.username,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    address: walletData.address.toLowerCase(),
    encryptedPrivateKey,
    encryptedMnemonic
  });

  await user.save();
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
