import User from '../../database/models/User.js';
import { getMainKeyboard } from '../keyboards/main.js';
import { getYesNoKeyboard } from '../keyboards/inline.js';
import logger from '../../utils/logger.js';

export async function handleStart(ctx) {
  try {
    const telegramId = ctx.from.id;
    const userInfo = {
      username: ctx.from.username,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name
    };
    
    let user = await User.findByTelegramId(telegramId);
    
    if (user) {
      await user.updateLastActive();
      
      await ctx.reply(
        `👋 Welcome back, ${ctx.from.first_name}!\n\n` +
        `🏦 Address: \`${user.address}\`\n\n` +
        `What would you like to do?`,
        {
          parse_mode: 'Markdown',
          ...getMainKeyboard()
        }
      );
      
    } else {
      await ctx.reply(
        `🐱 *Welcome to HypurrFi Bot!*\n\n` +
        `I help you manage leveraged lending positions on HypurrFi.\n\n` +
        `*Features:*\n` +
        `• One-click leverage loops\n` +
        `• Auto-rebalancing\n` +
        `• Health factor monitoring\n` +
        `• DCA strategies\n\n` +
        `To get started, you need a wallet.\n` +
        `Do you want to create a new wallet?`,
        {
          parse_mode: 'Markdown',
          ...getYesNoKeyboard('create_wallet')
        }
      );
    }
    
  } catch (error) {
    logger.error('Error in /start command', error);
    await ctx.reply('❌ An error occurred. Please try again.');
  }
}
