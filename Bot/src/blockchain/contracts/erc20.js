import { ethers } from 'ethers';
import { getProvider } from '../provider.js';
import logger from '../../utils/logger.js';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

export class ERC20Contract {
  constructor(tokenAddress, signerOrProvider = null) {
    this.address = tokenAddress;
    this.provider = signerOrProvider || getProvider();
    this.contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
  }

  async getInfo() {
    try {
      const [name, symbol, decimals] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals()
      ]);

      return { name, symbol, decimals: Number(decimals), address: this.address };
    } catch (error) {
      logger.error('Error fetching token info', error);
      throw error;
    }
  }

  async balanceOf(address) {
    try {
      const decimals = await this.contract.decimals();
      const balance = await this.contract.balanceOf(address);
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      logger.error('Error fetching balance', error);
      return '0';
    }
  }

  async approve(spender, amount, signer) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const decimals = await this.contract.decimals();
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      logger.blockchain(`Approving ${amount} tokens to ${spender}...`);
      const tx = await contractWithSigner.approve(spender, amountWei);
      
      logger.blockchain(`Approval tx sent: ${tx.hash}`);
      const receipt = await tx.wait();
      
      logger.success(`Approval confirmed: ${tx.hash}`);
      return receipt;
    } catch (error) {
      logger.error('Approval failed', error);
      throw error;
    }
  }

  async allowance(owner, spender) {
    try {
      const decimals = await this.contract.decimals();
      const allowance = await this.contract.allowance(owner, spender);
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      logger.error('Error fetching allowance', error);
      return '0';
    }
  }
}

export function getTokenContract(symbol, signerOrProvider = null) {
  const addresses = {
    'USDC': process.env.USDC_ADDRESS,
    'USDT': process.env.USDT_ADDRESS,
    'HYPE': process.env.HYPE_ADDRESS,
    'stHYPE': process.env.STHYPE_ADDRESS,
    'USDXL': process.env.USDXL_ADDRESS
  };

  const address = addresses[symbol.toUpperCase()];
  if (!address) {
    throw new Error(`Unknown token: ${symbol}`);
  }

  return new ERC20Contract(address, signerOrProvider);
}