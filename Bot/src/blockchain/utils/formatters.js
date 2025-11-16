import { ethers } from 'ethers';

export function formatAmount(amount, decimals = 18) {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch (error) {
    return '0';
  }
}

export function parseAmount(amount, decimals = 18) {
  try {
    return ethers.parseUnits(amount.toString(), decimals);
  } catch (error) {
    throw new Error(`Invalid amount: ${amount}`);
  }
}

export function formatAddress(address) {
  if (!address) return 'N/A';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatHealthFactor(hf) {
  const num = Number(hf);
  if (num === 0 || !isFinite(num)) return 'N/A';
  if (num > 1000) return '∞';
  return num.toFixed(2);
}

export function formatPercentage(value) {
  const num = Number(value);
  if (!isFinite(num)) return '0%';
  return `${num.toFixed(2)}%`;
}

export function formatUSD(amount) {
  const num = Number(amount);
  if (!isFinite(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatDate(timestamp) {
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

export function getHealthFactorEmoji(hf) {
  const num = Number(hf);
  if (num >= 2) return '🟢';
  if (num >= 1.5) return '🟡';
  if (num >= 1.3) return '🟠';
  return '🔴';
}

export function getRiskLevel(hf) {
  const num = Number(hf);
  if (num >= 2) return 'Low';
  if (num >= 1.5) return 'Medium';
  if (num >= 1.3) return 'High';
  return 'Critical';
}

export function getStrategyEmoji(strategy) {
  const emojis = {
    'LEVERED_HYPE': '🚀',
    'STABLE_YIELD': '💵',
    'USDXL_FARMING': '🔄',
    'AUTO_OPTIMIZER': '⭐',
    'DCA': '📅'
  };
  return emojis[strategy] || '📊';
}