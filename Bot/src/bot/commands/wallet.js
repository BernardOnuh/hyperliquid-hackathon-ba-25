import User from '../../database/models/User.js';
import { WalletManager } from '../../blockchain/wallet.js';
import { getWalletKeyboard, getMainKeyboard } from '../keyboards/main.js';
import { formatAddress } from '../../blockchain/utils/formatters.js';
import logger from '../../utils/logger.js';

export async function handleWallet(ctx) {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findByTelegramId(telegramId);
    
    if (!user) {
      return ctx.reply('No wallet found. Use /start', getMainKeyboard());
    }
    
    await user.updateLastActive();
    
    await ctx.reply(
      'Your Wallet\n\nAddress: ' + user.address,
      getWalletKeyboard()
    );
    
  } catch (error) {
    logger.error('Wallet error', error);
    await ctx.reply('Error occurred');
  }
}

export async function handleCreateWallet(ctx) {
  try {
    const telegramId = ctx.from.id;
    
    const existingUser = await User.findByTelegramId(telegramId);
    if (existingUser) {
      return ctx.reply('You already have a wallet!', getMainKeyboard());
    }
    
    const loadingMsg = await ctx.reply('Creating wallet...');
    
    const walletData = WalletManager.createWallet();
    
    const userInfo = {
      username: ctx.from.username,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name
    };
    
    await User.createUser(telegramId, walletData, userInfo);
    
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
    await ctx.reply(
      'Wallet Created!\n\nAddress: ' + walletData.address + '\n\nRecovery Phrase:\n' + walletData.mnemonic + '\n\nSave this securely!'
    );
    
    await ctx.reply('Ready!', getMainKeyboard());
    
    logger.success('Wallet created for user ' + telegramId);
    
  } catch (error) {
    logger.error('Create wallet error', error);
    await ctx.reply('Failed to create wallet');
  }
}

export async function handleCheckBalance(ctx) {
  try {
    const telegramId = ctx.from.id;
    const user = await User.findByTelegramId(telegramId);
    
    if (!user) {
      return ctx.reply('No wallet found');
    }
    
    const loadingMsg = await ctx.reply('Fetching balances...');
    
    const balances = await WalletManager.getAllBalances(user.address);
    
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
    await ctx.reply(
      'Your Balances\n\n' +
      'USDC: ' + balances.usdc + '\n' +
      'USDT: ' + balances.usdt + '\n' +
      'HYPE: ' + balances.hype,
      getWalletKeyboard()
    );
    
  } catch (error) {
    logger.error('Balance error', error);
    await ctx.reply('Failed to fetch balances');
  }
}

export async function handleImportWallet(ctx) {
  await ctx.reply('Import coming soon!', getMainKeyboard());
}

export async function handleExportKeys(ctx) {
  await ctx.reply('Export coming soon!', getMainKeyboard());
}