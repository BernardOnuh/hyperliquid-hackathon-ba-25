import { ethers } from 'ethers';
import crypto from 'crypto';

// Encryption key from environment (should be 32 bytes)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const ALGORITHM = 'aes-256-cbc';

// Encrypt sensitive data
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt sensitive data
function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Create new wallet
export async function createWallet() {
  try {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: encrypt(wallet.privateKey),
      mnemonic: encrypt(wallet.mnemonic.phrase),
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error('Failed to create wallet');
  }
}

// Import wallet from private key
export async function importWalletFromPrivateKey(privateKey) {
  try {
    // Validate and create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    
    return {
      address: wallet.address,
      privateKey: encrypt(wallet.privateKey),
      mnemonic: null, // No mnemonic when importing from private key
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error importing wallet:', error);
    throw new Error('Invalid private key');
  }
}

// Import wallet from mnemonic
export async function importWalletFromMnemonic(mnemonic) {
  try {
    // Validate and create wallet from mnemonic
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    
    return {
      address: wallet.address,
      privateKey: encrypt(wallet.privateKey),
      mnemonic: encrypt(wallet.mnemonic.phrase),
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error importing wallet from mnemonic:', error);
    throw new Error('Invalid mnemonic phrase');
  }
}

// Get wallet balance (mock - replace with actual RPC calls)
export async function getWalletBalance(address) {
  try {
    // TODO: Replace with actual blockchain RPC calls
    // This is a mock implementation
    
    // Example with ethers.js and RPC provider:
    // const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    // const balance = await provider.getBalance(address);
    
    return {
      HYPE: Math.random() * 1000,
      stHYPE: Math.random() * 500,
      USDXL: Math.random() * 2000,
      USDC: Math.random() * 1500
    };
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch balance');
  }
}

// Export private key (decrypted)
export function exportPrivateKey(encryptedPrivateKey) {
  try {
    return decrypt(encryptedPrivateKey);
  } catch (error) {
    console.error('Error exporting private key:', error);
    throw new Error('Failed to export private key');
  }
}

// Export mnemonic (decrypted)
export function exportMnemonic(encryptedMnemonic) {
  try {
    return decrypt(encryptedMnemonic);
  } catch (error) {
    console.error('Error exporting mnemonic:', error);
    throw new Error('Failed to export mnemonic');
  }
}