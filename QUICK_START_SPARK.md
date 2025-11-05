# Spark Wallet - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Breez API Key
1. Visit: https://breez.technology/spark/
2. Request an API key (free for testing)

### Step 2: Configure Environment
```bash
# Create .env.local if it doesn't exist
cp .env.example .env.local

# Add your API key
echo "NEXT_PUBLIC_BREEZ_SPARK_API_KEY=your_api_key_here" >> .env.local
```

### Step 3: Install & Run
```bash
# Dependencies already installed via npm install

# Start development server
npm run dev

# Visit http://localhost:3400/wallet
```

### Step 4: Create Your Wallet
1. Login to Yakihonne
2. Go to `/wallet` page
3. Click "Add Wallet"
4. Select "Spark Wallet (Self-Custodial)"
5. Choose "Create New Wallet"
6. **Save your 12-word seed phrase!** (Download backup)
7. Backup is automatically saved to Nostr relays

### Step 5: Test It Out
1. **Get Some Sats:** Generate a receive invoice
2. **Send Sats:** Use a Bolt11 invoice or Lightning address
3. **View History:** Check your transaction list

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/src/Components/AddWallet.js` | Entry point - adds Spark option |
| `/src/Components/Spark/` | All UI components |
| `/src/Helpers/Spark/` | All services & logic |
| `/src/Store/Slides/SparkWallet.js` | Redux state |
| `/src/styles/spark-wallet.css` | Styling |

---

## 🎯 Quick Commands

```javascript
// Import manager
import sparkWalletManager from '@/Helpers/Spark/spark-wallet-manager'

// Create wallet
await sparkWalletManager.createWallet()

// Restore wallet
await sparkWalletManager.restoreWallet()

// Send payment
import sparkService from '@/Helpers/Spark/spark.service'
await sparkService.sendPayment('invoice_or_address', 1000) // 1000 sats

// Get balance
const info = await sparkService.getInfo()
console.log(info.balanceSats)
```

---

## 🔧 Redux State

```javascript
import { useSelector } from 'react-redux'

// In your component
const sparkConnected = useSelector((state) => state.sparkConnected)
const sparkBalance = useSelector((state) => state.sparkBalance)
const sparkLightningAddress = useSelector((state) => state.sparkLightningAddress)
```

---

## 💡 Common Issues

### Issue: "API Key not configured"
**Solution:** Add `NEXT_PUBLIC_BREEZ_SPARK_API_KEY` to `.env.local`

### Issue: "Failed to initialize WASM"
**Solution:** Clear browser cache and reload. WASM file is 6.84 MB.

### Issue: "No backup found"
**Solution:** First time users must create a new wallet or manually enter seed phrase.

### Issue: Wallet doesn't auto-restore
**Solution:** Check localStorage for `spark_wallet_{pubkey}` key. May need to restore from Nostr.

---

## 📚 Documentation

- **Full Integration Guide:** `/SPARK_WALLET_INTEGRATION.md`
- **Component Docs:** `/src/Components/Spark/README.md`
- **Integration Patterns:** `/src/Components/Spark/INTEGRATION.md`
- **Feature Matrix:** `/src/Components/Spark/FEATURES.md`

---

## ✅ Testing Checklist

Quick tests to verify everything works:

- [ ] Create new wallet
- [ ] View seed phrase
- [ ] Download backup
- [ ] Generate receive invoice
- [ ] Send to test invoice
- [ ] View transaction history
- [ ] Register Lightning address
- [ ] Sync wallet
- [ ] Logout and auto-restore

---

## 🎨 Customization

### Change Theme Colors
Edit `/src/styles/spark-wallet.css`:
```css
/* Change primary color from orange to your color */
.spark-balance-container {
  background: var(--your-color-side);
  border-color: var(--your-color-main);
}
```

### Add Translations
Add keys to your i18next translation files:
```json
{
  "spark_wallet_title": "Spark Wallet",
  "spark_create_new": "Create New Wallet",
  // ... etc
}
```

---

## 🚨 Important Notes

1. **Mainnet Only:** Currently supports mainnet only (real Bitcoin)
2. **Test with Small Amounts:** Use < 1000 sats for testing
3. **Backup Your Seed:** Without it, you cannot recover your wallet
4. **Hot Wallet:** Not suitable for large amounts (recommended max: 100k sats)
5. **Experimental:** Breez Spark SDK is still in beta

---

## 🆘 Need Help?

1. Check console logs (comprehensive logging included)
2. Review documentation files
3. Check Redux state with DevTools
4. Open an issue on GitHub

---

## 🎉 You're Ready!

The Spark wallet is fully integrated and ready to use. Happy Lightning-ing! ⚡

---

*Built with [Claude Code](https://claude.com/claude-code)*
