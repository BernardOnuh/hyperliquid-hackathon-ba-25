import User from '../models/User.js';
import { importWalletFromPrivateKey, importWalletFromMnemonic } from '../services/walletService.js';
import { userStates } from './callbackHandler.js';
import { Markup } from 'telegraf';

export async function textHandler(ctx) {
  const text = ctx.message.text;
  const telegramId = ctx.from.id.toString();
  
  // Check if user is in a special state (awaiting input)
  const userState = userStates.get(telegramId);
  
  if (userState) {
    await handleStateBasedInput(ctx, text, telegramId, userState);
    return;
  }
  
  // Normal text handling
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('hello') || lowerText.includes('hi')) {
    await ctx.reply(`Hey ${ctx.from.first_name}! 👋\n\nType /start to see what I can do!`);
  } else if (lowerText.includes('help')) {
    await ctx.reply('Use /help to see all available commands! 📚');
  } else {
    await ctx.reply(
      `I'm not sure what you mean. 🤔\n\n` +
      `Try:\n` +
      `/start - Main menu\n` +
      `/help - List of commands`
    );
  }
}

async function handleStateBasedInput(ctx, text, telegramId, userState) {
  const user = await User.findOne({ telegramId });
  
  if (!user) {
    await ctx.reply('❌ User not found. Please use /start to begin.');
    userStates.delete(telegramId);
    return;
  }
  
  // Handle cancel
  if (text.toLowerCase() === '/cancel') {
    userStates.delete(telegramId);
    await ctx.reply(
      '❌ Operation cancelled.',
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Back to Menu', 'back_to_start')]
        ])
      }
    );
    return;
  }
  
  try {
    if (userState.action === 'awaiting_private_key') {
      await handlePrivateKeyImport(ctx, text, user, telegramId);
    } else if (userState.action === 'awaiting_mnemonic') {
      await handleMnemonicImport(ctx, text, user, telegramId);
    }
  } catch (error) {
    console.error('Error handling state-based input:', error);
    await ctx.reply('❌ An error occurred. Please try again.');
    userStates.delete(telegramId);
  }
}

async function handlePrivateKeyImport(ctx, privateKey, user, telegramId) {
  // Delete user's message for security
  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.log('Could not delete message');
  }
  
  await ctx.reply('⏳ Importing wallet...');
  
  try {
    const walletData = await importWalletFromPrivateKey(privateKey.trim());
    
    user.wallet = walletData;
    await user.save();
    
    userStates.delete(telegramId);
    
    await ctx.reply(
      `✅ **Wallet Imported Successfully!**\n\n` +
      `🔐 **Address:**\n\`${walletData.address}\`\n\n` +
      `You can now start using HypurrFi!`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💰 Check Balance', 'check_balance')],
          [Markup.button.callback('💼 Create Vault', 'create_vault')],
          [Markup.button.callback('⬅️ Back to Menu', 'back_to_start')]
        ])
      }
    );
  } catch (error) {
    userStates.delete(telegramId);
    await ctx.reply(
      `❌ Failed to import wallet. Please check your private key and try again.\n\n` +
      `Error: ${error.message}`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Try Again', 'import_wallet')],
          [Markup.button.callback('⬅️ Back', 'get_started')]
        ])
      }
    );
  }
}

async function handleMnemonicImport(ctx, mnemonic, user, telegramId) {
  // Delete user's message for security
  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.log('Could not delete message');
  }
  
  await ctx.reply('⏳ Importing wallet...');
  
  try {
    const walletData = await importWalletFromMnemonic(mnemonic.trim());
    
    user.wallet = walletData;
    await user.save();
    
    userStates.delete(telegramId);
    
    await ctx.reply(
      `✅ **Wallet Imported Successfully!**\n\n` +
      `🔐 **Address:**\n\`${walletData.address}\`\n\n` +
      `You can now start using HypurrFi!`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💰 Check Balance', 'check_balance')],
          [Markup.button.callback('💼 Create Vault', 'create_vault')],
          [Markup.button.callback('⬅️ Back to Menu', 'back_to_start')]
        ])
      }
    );
  } catch (error) {
    userStates.delete(telegramId);
    await ctx.reply(
      `❌ Failed to import wallet. Please check your mnemonic phrase and try again.\n\n` +
      `Error: ${error.message}`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Try Again', 'import_wallet')],
          [Markup.button.callback('⬅️ Back', 'get_started')]
        ])
      }
    );
  }
}