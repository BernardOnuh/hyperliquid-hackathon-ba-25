import { Markup } from 'telegraf';

export function getStrategyKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🚀 Levered HYPE', 'strategy_levered_hype'),
      Markup.button.callback('💵 Stable Yield', 'strategy_stable_yield')
    ],
    [
      Markup.button.callback('🔄 USDXL Loop', 'strategy_usdxl'),
      Markup.button.callback('⭐ Auto Optimizer', 'strategy_auto')
    ],
    [
      Markup.button.callback('❌ Cancel', 'cancel')
    ]
  ]);
}

export function getLeverageKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('2x - Safe ✅', 'leverage_2'),
      Markup.button.callback('3x - Balanced ⚖️', 'leverage_3')
    ],
    [
      Markup.button.callback('4x - Aggressive 🔥', 'leverage_4'),
      Markup.button.callback('Custom...', 'leverage_custom')
    ],
    [
      Markup.button.callback('❌ Cancel', 'cancel')
    ]
  ]);
}

export function getConfirmKeyboard(action) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Confirm', `confirm_${action}`),
      Markup.button.callback('❌ Cancel', 'cancel')
    ]
  ]);
}

export function getPositionActionsKeyboard(positionId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔄 Refresh', `refresh_${positionId}`),
      Markup.button.callback('➕ Add More', `add_${positionId}`)
    ],
    [
      Markup.button.callback('🔄 Rebalance', `rebalance_${positionId}`),
      Markup.button.callback('🚪 Withdraw', `withdraw_${positionId}`)
    ]
  ]);
}

export function getImportOptionsKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔑 Private Key', 'import_private_key'),
      Markup.button.callback('📝 Mnemonic', 'import_mnemonic')
    ],
    [
      Markup.button.callback('❌ Cancel', 'cancel')
    ]
  ]);
}

export function getExportOptionsKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔑 Show Private Key', 'export_private_key'),
      Markup.button.callback('📝 Show Mnemonic', 'export_mnemonic')
    ],
    [
      Markup.button.callback('❌ Cancel', 'cancel')
    ]
  ]);
}

export function getYesNoKeyboard(action) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Yes', `yes_${action}`),
      Markup.button.callback('❌ No', `no_${action}`)
    ]
  ]);
}
