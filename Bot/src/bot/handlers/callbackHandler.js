import { Markup } from 'telegraf';
import User from '../models/User.js';
import { 
  createWallet, 
  importWalletFromPrivateKey, 
  importWalletFromMnemonic,
  getWalletBalance 
} from '../services/walletService.js';

// Store temporary states for multi-step flows
const userStates = new Map();

export async function callbackHandler(ctx) {
  const action = ctx.callbackQuery.data;
  const telegramId = ctx.from.id.toString();
  
  try {
    await ctx.answerCbQuery();
    
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      await ctx.reply('❌ User not found. Please use /start to begin.');
      return;
    }
    
    switch (action) {
      case 'get_started':
        await handleGetStarted(ctx, user);
        break;
        
      case 'create_new_wallet':
        await handleCreateWallet(ctx, user);
        break;
        
      case 'import_wallet':
        await handleImportWallet(ctx, user);
        break;
        
      case 'import_private_key':
        await handleImportPrivateKey(ctx, user);
        break;
        
      case 'import_mnemonic':
        await handleImportMnemonic(ctx, user);
        break;
        
      case 'check_balance':
        await handleCheckBalance(ctx, user);
        break;
        
      case 'wallet_settings':
        await handleWalletSettings(ctx, user);
        break;
        
      case 'export_private_key':
        await handleExportPrivateKey(ctx, user);
        break;
        
      case 'export_mnemonic':
        await handleExportMnemonic(ctx, user);
        break;
        
      case 'view_strategies':
        await handleViewStrategies(ctx);
        break;
        
      case 'create_vault':
        await handleCreateVault(ctx, user);
        break;
        
      case 'learn_more':
        await handleLearnMore(ctx);
        break;
        
      case 'back_to_start':
        // Simulate /start command
        await ctx.deleteMessage().catch(() => {});
        const startModule = await import('./startHandler.js');
        await startModule.startHandler(ctx);
        break;
        
      default:
        await ctx.reply(
          `⚠️ This feature is under development.\n\n` +
          `We're working hard to bring you the best DeFi experience!\n\n` +
          `Use /start to go back to the main menu.`
        );
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    await ctx.reply('❌ An error occurred. Please try again.');
  }
}

async function handleGetStarted(ctx, user) {
  if (user.wallet && user.wallet.address) {
    await ctx.reply(
      `✅ **You already have a wallet!**\n\n` +
      `Address: \`${user.wallet.address}\`\n\n` +
      `What would you like to do?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💰 Check Balance', 'check_balance')],
          [Markup.button.callback('💼 Create Vault', 'create_vault')],
          [Markup.button.callback('⚙️ Wallet Settings', 'wallet_settings')],
          [Markup.button.callback('⬅️ Back', 'back_to_start')]
        ])
      }
    );
  } else {
    await ctx.reply(
      `🚀 **Let's Get Started!**\n\n` +
      `First, you need to set up your wallet:\n\n` +
      `🔹 **Create New Wallet** - Generate a new wallet\n` +
      `🔹 **Import Wallet** - Use existing wallet\n\n` +
      `⚠️ **Security Note:** Your keys are encrypted and stored securely.`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✨ Create New Wallet', 'create_new_wallet')],
          [Markup.button.callback('📥 Import Wallet', 'import_wallet')],
          [Markup.button.callback('⬅️ Back', 'back_to_start')]
        ])
      }
    );
  }
}

async function handleCreateWallet(ctx, user) {
  try {
    await ctx.reply('⏳ Creating your wallet...');
    
    const walletData = await createWallet();
    
    user.wallet = walletData;
    await user.save();
    
    await ctx.reply(
      `✅ **Wallet Created Successfully!**\n\n` +
      `🔐 **Address:**\n\`${walletData.address}\`\n\n` +
      `⚠️ **IMPORTANT:** Save your private key and mnemonic in a safe place!\n\n` +
      `Use /start to continue or check your wallet settings to export your keys.`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💰 Check Balance', 'check_balance')],
          [Markup.button.callback('⚙️ Wallet Settings', 'wallet_settings')],
          [Markup.button.callback('⬅️ Back to Menu', 'back_to_start')]
        ])
      }
    );
  } catch (error) {
    console.error('Error creating wallet:', error);
    await ctx.reply('❌ Failed to create wallet. Please try again.');
  }
}

async function handleImportWallet(ctx, user) {
  await ctx.reply(
    `📥 **Import Wallet**\n\n` +
    `Choose your import method:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔑 Private Key', 'import_private_key')],
        [Markup.button.callback('📝 Mnemonic Phrase', 'import_mnemonic')],
        [Markup.button.callback('⬅️ Back', 'get_started')]
      ])
    }
  );
}

async function handleImportPrivateKey(ctx, user) {
  const telegramId = ctx.from.id.toString();
  userStates.set(telegramId, { action: 'awaiting_private_key' });
  
  await ctx.reply(
    `🔑 **Import via Private Key**\n\n` +
    `Please send your private key.\n\n` +
    `⚠️ **Security:** This message will be deleted immediately after processing.\n\n` +
    `Send /cancel to abort.`,
    { parse_mode: 'Markdown' }
  );
}

async function handleImportMnemonic(ctx, user) {
  const telegramId = ctx.from.id.toString();
  userStates.set(telegramId, { action: 'awaiting_mnemonic' });
  
  await ctx.reply(
    `📝 **Import via Mnemonic**\n\n` +
    `Please send your 12 or 24-word mnemonic phrase.\n\n` +
    `⚠️ **Security:** This message will be deleted immediately after processing.\n\n` +
    `Send /cancel to abort.`,
    { parse_mode: 'Markdown' }
  );
}

async function handleCheckBalance(ctx, user) {
  if (!user.wallet || !user.wallet.address) {
    await ctx.reply(
      `❌ No wallet found!\n\n` +
      `Please create or import a wallet first.`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🚀 Get Started', 'get_started')]
        ])
      }
    );
    return;
  }
  
  try {
    await ctx.reply('⏳ Fetching balances...');
    
    const balances = await getWalletBalance(user.wallet.address);
    
    // Update user balances
    user.balances = balances;
    await user.save();
    
    await ctx.reply(
      `💰 **Your Balances**\n\n` +
      `🔷 HYPE: ${balances.HYPE.toFixed(2)}\n` +
      `🔶 stHYPE: ${balances.stHYPE.toFixed(2)}\n` +
      `💵 USDXL: ${balances.USDXL.toFixed(2)}\n` +
      `💚 USDC: ${balances.USDC.toFixed(2)}\n\n` +
      `📊 Wallet: \`${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}\``,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Refresh', 'check_balance')],
          [Markup.button.callback('💼 Create Vault', 'create_vault')],
          [Markup.button.callback('⬅️ Back', 'back_to_start')]
        ])
      }
    );
  } catch (error) {
    console.error('Error checking balance:', error);
    await ctx.reply('❌ Failed to fetch balance. Please try again.');
  }
}

async function handleWalletSettings(ctx, user) {
  if (!user.wallet || !user.wallet.address) {
    await ctx.reply('❌ No wallet found! Please create or import a wallet first.');
    return;
  }
  
  await ctx.reply(
    `⚙️ **Wallet Settings**\n\n` +
    `Address: \`${user.wallet.address}\`\n\n` +
    `⚠️ **Warning:** Exporting keys should be done in a secure environment.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔑 Export Private Key', 'export_private_key')],
        [Markup.button.callback('📝 Export Mnemonic', 'export_mnemonic')],
        [Markup.button.callback('💰 Check Balance', 'check_balance')],
        [Markup.button.callback('⬅️ Back', 'back_to_start')]
      ])
    }
  );
}

async function handleExportPrivateKey(ctx, user) {
  if (!user.wallet || !user.wallet.privateKey) {
    await ctx.reply('❌ No private key found!');
    return;
  }
  
  try {
    const { exportPrivateKey } = await import('../services/walletService.js');
    const privateKey = exportPrivateKey(user.wallet.privateKey);
    
    const msg = await ctx.reply(
      `🔑 **Your Private Key:**\n\n` +
      `\`${privateKey}\`\n\n` +
      `⚠️ **This message will be deleted in 30 seconds for security!**`,
      { parse_mode: 'Markdown' }
    );
    
    // Delete message after 30 seconds
    setTimeout(async () => {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id);
      } catch (e) {
        console.error('Failed to delete message:', e);
      }
    }, 30000);
  } catch (error) {
    console.error('Error exporting private key:', error);
    await ctx.reply('❌ Failed to export private key.');
  }
}

async function handleExportMnemonic(ctx, user) {
  if (!user.wallet || !user.wallet.mnemonic) {
    await ctx.reply('❌ No mnemonic found! This wallet was imported via private key.');
    return;
  }
  
  try {
    const { exportMnemonic } = await import('../services/walletService.js');
    const mnemonic = exportMnemonic(user.wallet.mnemonic);
    
    const msg = await ctx.reply(
      `📝 **Your Mnemonic Phrase:**\n\n` +
      `\`${mnemonic}\`\n\n` +
      `⚠️ **This message will be deleted in 30 seconds for security!**`,
      { parse_mode: 'Markdown' }
    );
    
    // Delete message after 30 seconds
    setTimeout(async () => {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id);
      } catch (e) {
        console.error('Failed to delete message:', e);
      }
    }, 30000);
  } catch (error) {
    console.error('Error exporting mnemonic:', error);
    await ctx.reply('❌ Failed to export mnemonic.');
  }
}

async function handleViewStrategies(ctx) {
  await ctx.reply(
    `📊 **Available Strategies**\n\n` +
    `**1. Leveraged HYPE Long** 🚀\n` +
    `• APY: ~45%\n` +
    `• Risk: Medium-High\n` +
    `• Min Deposit: 100 HYPE\n\n` +
    `**2. USDXL Farming** 🌾\n` +
    `• APY: ~12%\n` +
    `• Risk: Low\n` +
    `• Min Deposit: 50 USDXL\n\n` +
    `**3. Stable Loops** 🔄\n` +
    `• APY: ~8%\n` +
    `• Risk: Very Low\n` +
    `• Min Deposit: 100 USDC`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💼 Create Vault', 'create_vault')],
        [Markup.button.callback('⬅️ Back', 'back_to_start')]
      ])
    }
  );
}

async function handleCreateVault(ctx, user) {
  if (!user.wallet || !user.wallet.address) {
    await ctx.reply(
      `❌ **Wallet Required**\n\n` +
      `You need to create or import a wallet before creating a vault.`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🚀 Get Started', 'get_started')]
        ])
      }
    );
    return;
  }
  
  await ctx.reply(
    `💼 **Create Your Vault**\n\n` +
    `Choose your strategy type:\n\n` +
    `🔹 **Leverage Loop** - Auto-compound with leverage\n` +
    `🔹 **Yield Optimizer** - Highest APY allocation\n` +
    `🔹 **DCA Strategy** - Dollar-cost averaging\n` +
    `🔹 **Custom** - Build your own`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('⚡ Leverage Loop', 'strategy_leverage')],
        [Markup.button.callback('📈 Yield Optimizer', 'strategy_yield')],
        [Markup.button.callback('💵 DCA Strategy', 'strategy_dca')],
        [Markup.button.callback('🛠️ Custom', 'strategy_custom')],
        [Markup.button.callback('⬅️ Back', 'back_to_start')]
      ])
    }
  );
}

async function handleLearnMore(ctx) {
  await ctx.reply(
    `ℹ️ **About HypurrFi**\n\n` +
    `HypurrFi is a smart-contract system that creates and manages:\n\n` +
    `✅ Leveraged lending loops\n` +
    `✅ Yield optimization\n` +
    `✅ DCA hooks\n` +
    `✅ Health factor tracking\n` +
    `✅ Auto-rebalancing\n\n` +
    `Built on top of HypurrFi's pooled markets for maximum efficiency!\n\n` +
    `🌐 Website: hypurrfi.com\n` +
    `📖 Docs: docs.hypurrfi.com\n` +
    `💬 Community: t.me/hypurrfi`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Back', 'back_to_start')]
      ])
    }
  );
}

// Export the states map for use in text handler
export { userStates };