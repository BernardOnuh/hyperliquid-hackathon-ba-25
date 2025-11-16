import { ethers } from 'ethers';
import logger from '../utils/logger.js';

let provider = null;

export function getProvider() {
  if (!provider) {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error('RPC_URL not configured in .env');
    }
    
    provider = new ethers.JsonRpcProvider(rpcUrl);
    logger.blockchain('Provider initialized');
  }
  return provider;
}

export async function getBlockNumber() {
  try {
    const provider = getProvider();
    return await provider.getBlockNumber();
  } catch (error) {
    logger.error('Failed to get block number', error);
    throw error;
  }
}

export async function getGasPrice() {
  try {
    const provider = getProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice;
  } catch (error) {
    logger.error('Failed to get gas price', error);
    throw error;
  }
}

export async function waitForTransaction(txHash, confirmations = 1) {
  try {
    const provider = getProvider();
    logger.blockchain(`Waiting for tx: ${txHash}`);
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    logger.success(`Transaction confirmed: ${txHash}`);
    return receipt;
  } catch (error) {
    logger.error('Transaction wait failed', error);
    throw error;
  }
}