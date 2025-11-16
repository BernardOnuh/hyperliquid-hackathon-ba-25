import { ethers } from 'ethers';

export function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

export function isValidPrivateKey(key) {
  try {
    new ethers.Wallet(key);
    return true;
  } catch {
    return false;
  }
}

export function isValidMnemonic(mnemonic) {
  try {
    return ethers.Mnemonic.isValidMnemonic(mnemonic);
  } catch {
    return false;
  }
}

export function sanitizeAmount(amount) {
  return amount.toString().replace(/[^0-9.]/g, '');
}

export function validateLeverage(leverage) {
  const num = parseFloat(leverage);
  return !isNaN(num) && num >= 1 && num <= 10;
}

export function validateHealthFactor(hf) {
  const num = parseFloat(hf);
  return !isNaN(num) && num >= 1.1 && num <= 10;
}