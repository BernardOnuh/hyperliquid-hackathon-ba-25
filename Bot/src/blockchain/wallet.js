import { getWalletKeyboard, getMainKeyboard, getImportOptionsKeyboard, getExportOptionsKeyboard } from '../keyboards/index.js';

export async function handleWallet(ctx) {
  await ctx.reply(
    '👛 *Wallet Management*\n\n' +
    'Manage your wallet and view your balance.\n\n' +
    'Choose an option:',
    { 
      parse_mode: 'Markdown',
      ...getWalletKeyboard() 
    }
  );
}

export async function handleCreateWallet(ctx) {
  const address = '0x' + Math.random().toString(36).substring(2, 15).repeat(3);
  
  await ctx.reply(
    '🆕 *New Wallet Created!*\n\n' +
    `Address: \`${address}\`\n\n` +
    '⚠️ *Important:*\n' +
    '• Make sure to backup your private key\n' +
    '• Never share your private key with anyone\n' +
    '• Store it in a safe place\n\n' +
    'Use /export to view and backup your keys.',
    { parse_mode: 'Markdown' }
  );
}

export async function handleImportWallet(ctx) {
  await ctx.reply(
    '📥 *Import Wallet*\n\n' +
    'Choose how you want to import your wallet:',
    {
      parse_mode: 'Markdown',
      ...getImportOptionsKeyboard()
    }
  );
}

export async function handleCheckBalance(ctx) {
  const balances = {
    USDC: (Math.random() * 10000).toFixed(2),
    HYPE: (Math.random() * 5000).toFixed(2),
    ETH: (Math.random() * 2).toFixed(4)
  };

  await ctx.reply(
    '💵 *Your Balance*\n\n' +
    `💰 USDC: $${balances.USDC}\n` +
    `🚀 HYPE: ${balances.HYPE}\n` +
    `💎 ETH: ${balances.ETH}\n\n` +
    `Total Value: $${(parseFloat(balances.USDC) + parseFloat(balances.HYPE)).toFixed(2)}`,
    { parse_mode: 'Markdown' }
  );
}

export async function handleExportKeys(ctx) {
  await ctx.reply(
    '📤 *Export Keys*\n\n' +
    '⚠️ *Security Warning:*\n' +
    '• Your keys will be displayed only once\n' +
    '• The message will self-destruct in 30 seconds\n' +
    '• Make sure you are in a private place\n' +
    '• Never share your keys with anyone\n\n' +
    'Choose what to export:',
    {
      parse_mode: 'Markdown',
      ...getExportOptionsKeyboard()
    }
  );
}

export async function handlePrivateKeyImport(ctx, privateKey) {
  try {
    if (!privateKey.startsWith('0x') || privateKey.length < 64) {
      throw new Error('Invalid private key format');
    }

    try {
      await ctx.deleteMessage();
    } catch (error) {
      console.error('Could not delete message:', error);
    }

    const address = '0x' + Math.random().toString(36).substring(2, 15).repeat(3);

    await ctx.reply(
      '✅ *Wallet Imported Successfully!*\n\n' +
      `Address: \`${address}\`\n\n` +
      'Your wallet is now ready to use!',
      { 
        parse_mode: 'Markdown',
        ...getMainKeyboard() 
      }
    );
  } catch (error) {
    await ctx.reply(
      '❌ *Import Failed*\n\n' +
      'Invalid private key format. Please try again.',
      { parse_mode: 'Markdown' }
    );
  }
}

export async function handleMnemonicImport(ctx, mnemonic) {
  try {
    const words = mnemonic.trim().split(/\s+/);
    
    if (words.length !== 12 && words.length !== 24) {
      throw new Error('Invalid mnemonic length');
    }

    try {
      await ctx.deleteMessage();
    } catch (error) {
      console.error('Could not delete message:', error);
    }

    const address = '0x' + Math.random().toString(36).substring(2, 15).repeat(3);

    await ctx.reply(
      '✅ *Wallet Imported Successfully!*\n\n' +
      `Address: \`${address}\`\n\n` +
      'Your wallet is now ready to use!',
      { 
        parse_mode: 'Markdown',
        ...getMainKeyboard() 
      }
    );
  } catch (error) {
    await ctx.reply(
      '❌ *Import Failed*\n\n' +
      'Invalid mnemonic phrase. Please try again.',
      { parse_mode: 'Markdown' }
    );
  }
}