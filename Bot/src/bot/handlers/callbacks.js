import User from '../../database/models/User.js';
import { getMainKeyboard } from '../keyboards/main.js';
import logger from '../../utils/logger.js';

export async function handleCallbacks(ctx) {
  try {
    const data = ctx.callbackQuery.data;
    const telegramId = ctx.from.id;
    
    await ctx.answerCbQuery();
    
    switch (true) {
      case data === 'yes_create_wallet':
        return handleCreateWalletCallback(ctx);
      
      case data === 'no_create_wallet':
        return ctx.editMessageText(
          '👋 Okay! Come back when you\'re ready.\n\nType /start to begin.',
          { parse_mode: 'Markdown' }
        );
      
      case data === 'cancel':
        const user = await User.findByTelegramId(telegramId);
        if (user) await user.clearSessionState();
        
        return ctx.editMessageText('❌ Action cancelled.');
      
      default:
        return ctx.editMessageText('Unknown action.');
    }
    
  } catch (error) {
    logger.error('Error in callback handler', error);
    await ctx.answerCbQuery('❌ An error occurred');
  }
}

async function handleCreateWalletCallback(ctx) {
  const { handleCreateWallet } = await import('../commands/wallet.js');
  await ctx.deleteMessage();
  return handleCreateWallet(ctx);
}
