import { Markup } from 'telegraf';

export function getMainKeyboard() {
  return Markup.keyboard([
    ['💰 Deposit', '📊 Position'],
    ['👛 Wallet', '⚙️ Settings'],
    ['❓ Help']
  ]).resize();
}

export function removeKeyboard() {
  return Markup.removeKeyboard();
}

export function getWalletKeyboard() {
  return Markup.keyboard([
    ['🆕 Create Wallet', '📥 Import Wallet'],
    ['💵 Check Balance', '📤 Export Keys'],
    ['🔙 Back to Menu']
  ]).resize();
}

export function getDepositKeyboard() {
  return Markup.keyboard([
    ['🚀 Levered HYPE', '💵 Stable Yield'],
    ['🔄 USDXL Loop', '⭐ Auto Optimizer'],
    ['🔙 Back to Menu']
  ]).resize();
}

export function getPositionKeyboard() {
  return Markup.keyboard([
    ['📊 View All', '🔄 Refresh'],
    ['➕ Add More', '🚪 Withdraw'],
    ['🔙 Back to Menu']
  ]).resize();
}

export function getSettingsKeyboard() {
  return Markup.keyboard([
    ['🔔 Notifications', '🎯 Defaults'],
    ['🔐 Security', '🌐 Language'],
    ['🔙 Back to Menu']
  ]).resize();
}