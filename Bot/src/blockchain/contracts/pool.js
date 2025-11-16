import { ethers } from 'ethers';
import { getProvider } from '../provider.js';
import logger from '../../utils/logger.js';

const POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external',
  'function withdraw(address asset, uint256 amount, address to) external returns (uint256)',
  'function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf) external returns (uint256)',
  'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
];

export class PoolContract {
  constructor(signerOrProvider = null) {
    this.address = process.env.POOL_ADDRESS;
    
    if (!this.address) {
      throw new Error('POOL_ADDRESS not set in environment variables');
    }
    
    this.provider = signerOrProvider || getProvider();
    this.contract = new ethers.Contract(this.address, POOL_ABI, this.provider);
  }

  async supply(asset, amount, onBehalfOf, signer, decimals = 6) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      logger.blockchain(`Supplying ${amount} to pool...`);
      const tx = await contractWithSigner.supply(asset, amountWei, onBehalfOf, 0);
      
      logger.blockchain(`Supply tx sent: ${tx.hash}`);
      const receipt = await tx.wait();
      
      logger.success(`Supply confirmed: ${tx.hash}`);
      return receipt;
    } catch (error) {
      logger.error('Supply failed', error);
      throw error;
    }
  }

  async borrow(asset, amount, interestRateMode, onBehalfOf, signer, decimals = 6) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      logger.blockchain(`Borrowing ${amount}...`);
      const tx = await contractWithSigner.borrow(asset, amountWei, interestRateMode, 0, onBehalfOf);
      
      logger.blockchain(`Borrow tx sent: ${tx.hash}`);
      const receipt = await tx.wait();
      
      logger.success(`Borrow confirmed: ${tx.hash}`);
      return receipt;
    } catch (error) {
      logger.error('Borrow failed', error);
      throw error;
    }
  }

  async withdraw(asset, amount, to, signer, decimals = 6) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const amountWei = amount === 'max' ? ethers.MaxUint256 : ethers.parseUnits(amount.toString(), decimals);

      logger.blockchain(`Withdrawing ${amount}...`);
      const tx = await contractWithSigner.withdraw(asset, amountWei, to);
      
      logger.blockchain(`Withdraw tx sent: ${tx.hash}`);
      const receipt = await tx.wait();
      
      logger.success(`Withdraw confirmed: ${tx.hash}`);
      return receipt;
    } catch (error) {
      logger.error('Withdrawal failed', error);
      throw error;
    }
  }

  async repay(asset, amount, rateMode, onBehalfOf, signer, decimals = 6) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const amountWei = amount === 'max' ? ethers.MaxUint256 : ethers.parseUnits(amount.toString(), decimals);

      logger.blockchain(`Repaying ${amount}...`);
      const tx = await contractWithSigner.repay(asset, amountWei, rateMode, onBehalfOf);
      
      logger.blockchain(`Repay tx sent: ${tx.hash}`);
      const receipt = await tx.wait();
      
      logger.success(`Repay confirmed: ${tx.hash}`);
      return receipt;
    } catch (error) {
      logger.error('Repayment failed', error);
      throw error;
    }
  }

  async getUserAccountData(userAddress) {
    try {
      const data = await this.contract.getUserAccountData(userAddress);
      
      return {
        totalCollateralBase: ethers.formatUnits(data[0], 8),
        totalDebtBase: ethers.formatUnits(data[1], 8),
        availableBorrowsBase: ethers.formatUnits(data[2], 8),
        currentLiquidationThreshold: Number(data[3]) / 100,
        ltv: Number(data[4]) / 100,
        healthFactor: ethers.formatUnits(data[5], 18)
      };
    } catch (error) {
      logger.error('Error fetching user account data', error);
      return {
        totalCollateralBase: '0',
        totalDebtBase: '0',
        availableBorrowsBase: '0',
        currentLiquidationThreshold: 0,
        ltv: 0,
        healthFactor: '0'
      };
    }
  }

  async createLeveragedPosition(asset, depositAmount, targetLeverage, userAddress, signer, decimals = 6) {
    try {
      logger.blockchain(`Creating ${targetLeverage}x leveraged position...`);
      
      const transactions = [];
      
      const supplyReceipt = await this.supply(asset, depositAmount, userAddress, signer, decimals);
      transactions.push({ type: 'supply', amount: depositAmount, hash: supplyReceipt.hash });
      
      const ltv = ((targetLeverage - 1) / targetLeverage) * 100;
      const safetyMargin = 0.85;
      const borrowPercentage = (ltv / 100) * safetyMargin;
      
      let remainingToLoop = depositAmount;
      let loopCount = 0;
      const maxLoops = 5;
      
      while (loopCount < maxLoops && remainingToLoop > 0.01) {
        const borrowAmount = remainingToLoop * borrowPercentage;
        
        if (borrowAmount < 0.01) break;
        
        const borrowReceipt = await this.borrow(asset, borrowAmount, 2, userAddress, signer, decimals);
        transactions.push({ type: 'borrow', amount: borrowAmount, hash: borrowReceipt.hash });
        
        const resupplyReceipt = await this.supply(asset, borrowAmount, userAddress, signer, decimals);
        transactions.push({ type: 'supply', amount: borrowAmount, hash: resupplyReceipt.hash });
        
        remainingToLoop = borrowAmount;
        loopCount++;
      }
      
      logger.success(`Leveraged position created with ${loopCount} loops`);
      
      const accountData = await this.getUserAccountData(userAddress);
      
      return {
        transactions,
        loopCount,
        finalPosition: accountData
      };
      
    } catch (error) {
      logger.error('Failed to create leveraged position', error);
      throw error;
    }
  }
}