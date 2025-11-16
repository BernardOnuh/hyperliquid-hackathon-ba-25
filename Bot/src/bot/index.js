import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { connectDB } from './config/database.js';
import { startHandler } from './handlers/startHandler.js';
import { helpHandler } from './handlers/helpHandler.js';
import { callbackHandler } from './handlers/callbackHandler.js';
import { textHandler } from './handlers/textHandler.js';

// ===== VALIDATE BOT TOKEN =====
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  console.error('💡 Create a bot with @BotFather on Telegram and add the token to .env');
  process.exit(1);
}

// ===== INITIALIZE BOT =====
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ===== REGISTER HANDLERS =====
bot.command('start', startHandler);
bot.command('help', helpHandler);
bot.on('callback_query', callbackHandler);
bot.on('text', textHandler);

// ===== ERROR HANDLING =====
bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
  ctx.reply('❌ Something went wrong. Please try again or contact support.').catch(() => {});
});

// ===== START BOT =====
async function startBot() {
  try {
    console.log('🚀 Starting HypurrFi Telegram Bot...\n');
    
    // Connect to database
    await connectDB();
    
    await bot.launch();
    
    console.log('✅ Bot is running!');
    console.log(`🤖 Bot username: @${bot.botInfo.username}`);
    console.log(`🆔 Bot ID: ${bot.botInfo.id}`);
    console.log('\n💡 Send /start to your bot in Telegram!');
    console.log('💡 Press Ctrl+C to stop\n');
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
  }
}

// ===== GRACEFUL SHUTDOWN =====
process.once('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  bot.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  bot.stop('SIGTERM');
  process.exit(0);
});

// ===== RUN =====
startBot();