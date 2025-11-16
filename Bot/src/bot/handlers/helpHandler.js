export async function helpHandler(ctx) {
    const helpMessage = `📚 **HypurrFi Bot Commands**
  
  **Wallet Management:**
  /start - Welcome message & main menu
  /help - Show this help message
  
  **Quick Actions:**
  • 🚀 Get Started - Create or import wallet
  • 💰 Check Balance - View your token balances
  • 💼 Create Vault - Set up a new strategy vault
  • 📊 View Strategies - Browse available strategies
  • ⚙️ Wallet Settings - Manage your wallet
  
  **Available Strategies:**
  • Leveraged HYPE Long (~45% APY)
  • USDXL Farming (~12% APY)
  • Stable Loops (~8% APY)
  • Custom Vaults
  
  **Security Features:**
  ✅ Encrypted private keys
  ✅ Secure wallet import/export
  ✅ Auto-deleted sensitive messages
  
  **Coming Soon:**
  • Automated rebalancing
  • Health factor monitoring
  • Multi-strategy vaults
  • Advanced analytics
  • Push notifications
  
  Need help? Contact @HypurrFiSupport`;
  
    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }