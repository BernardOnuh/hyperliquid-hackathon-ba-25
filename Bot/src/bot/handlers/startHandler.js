import { Markup } from 'telegraf';
import User from '../models/User.js';

export async function startHandler(ctx) {
  try {
    const telegramId = ctx.from.id.toString();
    const username = ctx.from.first_name || ctx.from.username || 'there';
    
    // Find or create user
    let user = await User.findOne({ telegramId });
    
    if (!user) {
      user = await User.create({
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name
      });
    } else {
      await user.updateActivity();
    }
    
    const hasWallet = user.wallet && user.wallet.address;
    
    const welcomeMessage = `👋 Hello ${username}, welcome to HypurrFi!

🏦 **Build Your Strategy Vault**

HypurrFi allows you to:
• 💰 **Accept Deposits** - HYPE, stHYPE, stablecoins
• 📈 **Auto-Optimize Yield** - Allocate to highest yield assets
• ⚡ **One-Click Leverage** - Built on pooled markets
• 🛡️ **Risk Management** - Auto-rebalancing & health monitoring
• 🎯 **Simple Interface** - Open, view, close positions easily

**Available Strategies:**
🔹 Leveraged HYPE Long
🔹 USDXL Farming
🔹 Stable Loops
🔹 Custom Vaults

${hasWallet ? '✅ Wallet Connected: `' + user.wallet.address.slice(0, 6) + '...' + user.wallet.address.slice(-4) + '`' : '⚠️ No wallet connected'}

Type /help to see all commands or choose an option below:`;

    const buttons = hasWallet ? [
      [Markup.button.callback('💼 Create Vault', 'create_vault')],
      [Markup.button.callback('📊 View Strategies', 'view_strategies')],
      [Markup.button.callback('💰 Check Balance', 'check_balance')],
      [Markup.button.callback('⚙️ Wallet Settings', 'wallet_settings')],
      [Markup.button.callback('ℹ️ Learn More', 'learn_more')]
    ] : [
      [Markup.button.callback('🚀 Get Started', 'get_started')],
      [Markup.button.callback('📊 View Strategies', 'view_strategies')],
      [Markup.button.callback('ℹ️ Learn More', 'learn_more')]
    ];

    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  } catch (error) {
    console.error('Error in start handler:', error);
    await ctx.reply('❌ An error occurred. Please try again.');
  }
}