import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import { connectDatabase } from '../database/index.js';
import logger from '../utils/logger.js';

// ===== IMPORT COMMAND HANDLERS =====
import { handleStart } from './commands/start.js';
import { 
  handleWallet, 
  handleCreateWallet, 
  handleImportWallet,
  handleCheckBalance,
  handleExportKeys 
} from './commands/wallet.js';
import { handleDeposit } from './commands/deposit.js';
import { handlePosition } from './commands/position.js';
import { handleWithdraw } from './commands/withdraw.js';
import { handleSettings } from './commands/settings.js';
import { handleHelp } from './commands/help.js';

// ===== IMPORT HANDLERS =====
import { handleCallbacks } from './handlers/callbacks.js';
import { handleText } from './handlers/text.js';
import { handleError } from './handlers/errors.js';

// ===== VALIDATE ENVIRONMENT =====
function validateEnvironment() {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'MONGODB_URI',
    'RPC_URL',
    'ENCRYPTION_KEY',
    'POOL_ADDRESS',
    'USDC_ADDRESS'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your .env file');
    process.exit(1);
  }

  // Validate encryption key length
  if (process.env.ENCRYPTION_KEY.length !== 64) {
    logger.error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    logger.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  logger.success('Environment variables validated');
}

// ===== INITIALIZE BOT =====
if (!process.env.TELEGRAM_BOT_TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ===== MIDDLEWARE =====

// 1. Logging middleware - logs all updates
bot.use(async (ctx, next) => {
  const updateType = ctx.updateType;
  const user = ctx.from;
  
  if (user) {
    const username = user.username ? `@${user.username}` : user.first_name;
    const action = ctx.message?.text || ctx.callbackQuery?.data || updateType;
    logger.bot(`${username} (${user.id}): ${action}`);
  }
  
  await next();
});

// 2. Error catching middleware
bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    logger.error('Error in bot middleware', error);
    await ctx.reply('❌ An unexpected error occurred. Please try again.').catch(() => {});
  }
});

// ===== COMMANDS =====

// Core commands
bot.command('start', handleStart);
bot.command('help', handleHelp);

// Wallet commands
bot.command('wallet', handleWallet);

// Trading commands
bot.command('deposit', handleDeposit);
bot.command('position', handlePosition);
bot.command('withdraw', handleWithdraw);

// Settings
bot.command('settings', handleSettings);

// Admin commands (if admin telegram ID is set)
if (process.env.ADMIN_TELEGRAM_ID) {
  bot.command('stats', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.ADMIN_TELEGRAM_ID) {
      return ctx.reply('⛔ Unauthorized');
    }
    
    try {
      const User = (await import('../database/models/User.js')).default;
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      
      await ctx.reply(
        `📊 *Bot Statistics*\n\n` +
        `👥 Total Users: ${totalUsers}\n` +
        `✅ Active Users: ${activeUsers}\n` +
        `🤖 Uptime: ${process.uptime().toFixed(0)}s`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('Error fetching stats', error);
      await ctx.reply('❌ Error fetching statistics');
    }
  });
}

// Cancel command - clears session state
bot.command('cancel', async (ctx) => {
  try {
    const User = (await import('../database/models/User.js')).default;
    const user = await User.findByTelegramId(ctx.from.id);
    
    if (user) {
      await user.clearSessionState();
      await ctx.reply('✅ Action cancelled.', Markup.removeKeyboard());
    } else {
      await ctx.reply('No active action to cancel.');
    }
  } catch (error) {
    logger.error('Error in cancel command', error);
  }
});

// ===== CALLBACK QUERIES (Button Clicks) =====
bot.on('callback_query', handleCallbacks);

// ===== TEXT MESSAGES =====
bot.on('text', handleText);

// ===== OTHER MESSAGE TYPES =====

// Handle stickers
bot.on('sticker', (ctx) => {
  ctx.reply('Nice sticker! 😊\nUse /help to see available commands.');
});

// Handle photos
bot.on('photo', (ctx) => {
  ctx.reply('I received your photo, but I can only process text commands for now.\nUse /help to see what I can do!');
});

// Handle documents
bot.on('document', (ctx) => {
  ctx.reply('I received your file, but I can only process text commands for now.\nUse /help to see what I can do!');
});

// ===== ERROR HANDLING =====
bot.catch(handleError);

// ===== START BOT =====
async function startBot() {
  try {
    logger.info('🚀 Starting HypurrFi Telegram Bot...\n');
    
    // Step 1: Validate environment
    logger.info('Step 1: Validating environment variables...');
    validateEnvironment();
    
    // Step 2: Connect to database
    logger.info('Step 2: Connecting to database...');
    await connectDatabase();
    
    // Step 3: Test blockchain connection
    logger.info('Step 3: Testing blockchain connection...');
    const { getBlockNumber } = await import('../blockchain/provider.js');
    const blockNumber = await getBlockNumber();
    logger.success(`Connected to blockchain (Block: ${blockNumber})`);
    
    // Step 4: Launch bot
    logger.info('Step 4: Launching Telegram bot...');
    await bot.launch();
    
    // Success!
    console.log('\n' + '='.repeat(50));
    logger.success('🤖 Bot is running successfully!');
    console.log('='.repeat(50));
    logger.info(`Bot username: @${bot.botInfo.username}`);
    logger.info(`Bot ID: ${bot.botInfo.id}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`MongoDB: Connected`);
    logger.info(`Blockchain: HyperEVM (Block ${blockNumber})`);
    console.log('='.repeat(50) + '\n');
    
    logger.info('💡 Tip: Send /start to your bot in Telegram to begin!');
    logger.info('💡 Press Ctrl+C to stop the bot\n');
    
  } catch (error) {
    logger.error('❌ Failed to start bot', error);
    logger.error('\nPlease check:');
    logger.error('1. MongoDB is running (sudo systemctl status mongodb)');
    logger.error('2. .env file has all required variables');
    logger.error('3. TELEGRAM_BOT_TOKEN is valid');
    logger.error('4. Network connection is working\n');
    process.exit(1);
  }
}

// ===== GRACEFUL SHUTDOWN =====
const shutdown = async (signal) => {
  logger.warn(`\n${signal} received, shutting down gracefully...`);
  
  try {
    // Stop bot
    logger.info('Stopping bot...');
    bot.stop(signal);
    
    // Disconnect database
    logger.info('Disconnecting database...');
    const { disconnectDatabase } = await import('../database/index.js');
    await disconnectDatabase();
    
    logger.success('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

// ===== RUN BOT =====
startBot();