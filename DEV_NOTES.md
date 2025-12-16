 # Development Notes - Spark Wallet Integration

**Project**: Yakihonne (Spark wallet integration)
**Date**: 2025-11-01
**Purpose**: Document workflow and learnings for Lightning wallet integrations

---

## Integration Overview

This document captures the complete workflow for integrating **Breez Spark Lightning Wallet** into Yakihonne, a Nostr social client. The integration was modeled after Jumble.social's implementation and provides users with a self-custodial Lightning wallet option.

### Key Features Implemented
- ✅ Self-custodial Lightning wallet with Breez SDK
- ✅ BIP39 mnemonic seed phrase support (12/24 words)
- ✅ Multiple wallet restoration methods (auto-restore, Nostr backup, file upload, manual seed)
- ✅ Encrypted backup to Nostr relays (NIP-78)
- ✅ Lightning address registration (default: @breez.tips, customizable to @yakihonne.com)
- ✅ Send/receive Lightning payments
- ✅ Transaction history
- ✅ Wallet onboarding during new user signup
- ✅ Wallet management UI (connected wallets list)

**Note**: Yakihonne can replace @breez.tips with their own custom domain (e.g., @yakihonne.com) by configuring the Breez SDK. See `src/Components/Spark/README.md` for detailed instructions on custom domain setup.

---

## Tech Stack

### Core Dependencies
```json
{
  "@breeztech/breez-sdk-spark": "^0.5.2",
  "@scure/bip39": "^1.5.0",
  "@noble/ciphers": "^1.1.0",
  "@nostr-dev-kit/ndk": "^2.10.4",
  "react": "^19.0.0",
  "next": "^15.4.5",
  "@reduxjs/toolkit": "^2.5.0"
}
```

### Key Technologies
- **Breez Spark SDK 0.5.2** - WebAssembly-based Lightning wallet with privacy mode support
- **Next.js 15.4.5** - Pages Router with Turbopack (pinned for WASM compatibility)
- **React 19** - UI framework
- **Redux Toolkit** - State management
- **NDK** - Nostr Development Kit
- **XChaCha20-Poly1305** - Authenticated encryption
- **BIP39** - Mnemonic generation/validation

### SDK Version Notes
- **Current**: Breez SDK 0.5.2 (stable)
- **Privacy Mode**: SDK 0.5.2 includes privacy mode configuration via SDK initialization
- **Next.js Compatibility**: Next.js 15.4.5 required for proper WASM module handling (15.4.8+ has compatibility issues)

---

## Project Structure

```
src/
├── Helpers/Spark/
│   ├── spark.service.js              # Breez SDK wrapper
│   ├── spark-storage.service.js      # Local + Nostr storage
│   ├── spark-backup.service.js       # Backup/restore operations
│   └── spark-wallet-manager.js       # Central coordinator
│
├── Components/Spark/
│   ├── SparkWalletManager.js         # Main wallet UI component
│   ├── SparkWalletSetup.js           # Onboarding wizard (4 tabs)
│   ├── SparkReceive.js               # Receive payment UI
│   ├── SparkSend.js                  # Send payment UI
│   └── SparkHistory.js               # Transaction history
│
├── (PagesComponents)/
│   ├── Wallet.js                     # Main wallet page
│   └── Login.js                      # Signup/onboarding flow
│
└── Store/Slides/
    └── SparkWallet.js                # Redux slice
```

---

## Integration Workflow

### Phase 1: Reference Implementation Analysis

**Source**: Jumble.social (open-source Nostr client)

**Key Files Reviewed**:
- `/src/services/spark.service.js` - SDK wrapper patterns
- `/src/services/spark-storage.service.js` - Encryption/storage
- `/src/services/spark-backup.service.js` - NIP-78 backup
- `/src/components/SparkWalletManager.jsx` - UI component structure

**Learnings**:
- Use singleton pattern for SparkWalletManager
- Implement event listeners for SDK events
- Store encrypted mnemonics locally + Nostr
- Use NIP-78 (kind 30078) for application data
- Use NIP-04 encryption for mnemonic backups

### Phase 2: Core Services Implementation

**2.1 Breez SDK Service** (`spark.service.js`)
- Wrapper around Breez SDK with clean API
- Connection management (connect/disconnect)
- Wallet operations (getInfo, syncWallet, etc.)
- Payment operations (send/receive)
- Lightning address management
- Event system for SDK callbacks

**2.2 Storage Service** (`spark-storage.service.js`)
- XChaCha20-Poly1305 encryption for mnemonics
- localStorage for local backups
- NIP-78 for Nostr relay backups
- NDK integration for relay operations
- Key derivation from Nostr privkey

**2.3 Backup Service** (`spark-backup.service.js`)
- Download encrypted backups as files
- Restore from uploaded backup files
- Check backup existence on Nostr relays

**2.4 Wallet Manager** (`spark-wallet-manager.js`)
- Central coordinator between services, Redux, and UI
- Auto-updates Redux state from SDK events
- Manages wallet lifecycle (create/restore/delete)
- Integrates with Yakihonne's wallet list system

### Phase 3: Redux Integration

**Redux Slice** (`Store/Slides/SparkWallet.js`)
```javascript
{
  sparkConnected: false,
  sparkConnecting: false,
  sparkBalance: null,
  sparkLightningAddress: null,
  sparkWalletInfo: null,
  sparkPayments: [],
  sparkLastSync: null
}
```

**Key Actions**:
- `setSparkConnected` - Connection state
- `setSparkBalance` - Current balance in sats
- `setSparkLightningAddress` - User's Lightning address
- `setSparkWalletInfo` - Full wallet info (balances, fees, etc.)
- `setSparkPayments` - Transaction history

### Phase 4: UI Components

**4.1 SparkWalletSetup** - Onboarding wizard with 4 tabs:
1. **Create New** - Generate new 12-word mnemonic
2. **Restore from Nostr** - Auto-restore from relays
3. **Restore from File** - Upload encrypted backup
4. **Restore from Seed** - Manual 12/24-word entry

**4.2 SparkWalletManager** - Main management UI:
- Wallet status and connection
- Balance display
- Lightning address management
- Backup/export options
- Wallet deletion with confirmation

**4.3 SparkReceive** - Receive payments:
- Generate Lightning invoice
- Register Lightning address
- QR code display
- Invoice copy functionality

**4.4 SparkSend** - Send payments:
- Parse Lightning invoice or address
- Amount input (min/max validation)
- Fee calculation
- Payment confirmation

**4.5 SparkHistory** - Transaction list:
- All payments (sent/received)
- Status indicators
- Amount/description display
- Timestamp formatting

### Phase 5: Wallet Page Integration

**File**: `Wallet.js`

**Changes**:
1. Import Spark components and Redux selectors
2. Add Spark wallet restoration logic in useEffect
3. Handle wallet type selection (NWC vs Spark)
4. Update balance display for kind 4 (Spark) wallets
5. Render SparkWalletManager for kind 4
6. Add Spark wallet to connected wallets list

**Wallet Type System**:
```javascript
{
  kind: 1, // NWC (Nostr Wallet Connect)
  kind: 2, // Alby
  kind: 3, // WebLN
  kind: 4  // Spark (NEW)
}
```

**Balance Display Pattern**:
```javascript
// Sidebar and main display
{selectedWallet && selectedWallet.kind === 4
  ? (sparkBalance !== null ? sparkBalance : 'N/A')
  : userBalance
}
```

**Auto-Restoration Logic**:
```javascript
useEffect(() => {
  if (selectedWallet?.kind === 4) {
    if (!sparkConnected && !sparkConnecting) {
      sparkWalletManager.restoreWallet().catch(console.error);
    } else if (sparkConnected) {
      sparkWalletManager.refreshWalletState().catch(console.error);
    }
  }
}, [selectedWallet, sparkConnected, sparkConnecting]);
```

### Phase 6: Onboarding Flow

**File**: `Login.js`

**Changes**:
1. Add wallet type selection in Step 3
2. Create two paths: NWC (custodial) vs Spark (self-custodial)
3. Integrate SparkWalletSetup component
4. Save Spark wallet in initializeAccount()
5. Add Lightning address to Nostr metadata (kind 0)

**Wallet Selection UI**:
```javascript
// Step 3: Choose wallet type
- Yaki Wallet (Custodial) - Hosted wallet with automatic setup
- Spark Wallet (Self-Custodial) - Full control with Breez SDK
```

**Wallet Persistence**:
```javascript
const sparkWallet = {
  id: Date.now(),
  kind: 4,
  entitle: sparkLightningAddress || 'Spark Wallet',
  active: true,
  data: 'spark-self-custodial'
};
```

---

## Key Patterns & Best Practices

### 1. Singleton Pattern for Managers
```javascript
class SparkWalletManager {
  static instance;

  constructor() {
    if (!SparkWalletManager.instance) {
      SparkWalletManager.instance = this;
      this.setupEventListeners();
    }
    return SparkWalletManager.instance;
  }
}

const instance = new SparkWalletManager();
export default instance;
```

### 2. Event-Driven State Updates
```javascript
setupEventListeners() {
  sparkService.onEvent((event) => {
    switch (event.type) {
      case 'paymentSucceeded':
      case 'paymentFailed':
        this.refreshPayments();
        break;
      case 'synced':
        this.refreshWalletState();
        break;
    }
  });
}
```

### 3. Comprehensive Logging
```javascript
console.log('[SparkWalletManager] Refreshing wallet state...');
console.log('[SparkWalletManager] Got wallet info:', {
  balanceSats: info.balanceSats,
  pendingSendSats: info.pendingSendSats,
  pendingReceiveSats: info.pendingReceiveSats
});
console.log('[SparkWalletManager] ✅ Wallet state refreshed - Balance:', info.balanceSats, 'sats');
```

### 4. Error Handling with State Cleanup
```javascript
try {
  store.dispatch(setSparkConnecting(true));
  // ... operation
  store.dispatch(setSparkConnected(true));
  store.dispatch(setSparkConnecting(false));
} catch (error) {
  console.error('[SparkWalletManager] Failed:', error);
  store.dispatch(setSparkConnecting(false));
  store.dispatch(setSparkConnected(false));
  throw error;
}
```

### 5. Multi-Source Restoration
```javascript
// Priority: Local storage → Nostr relays
async loadMnemonic(pubkey) {
  // Try local first (faster)
  const localMnemonic = this.getMnemonicFromLocalStorage(pubkey);
  if (localMnemonic) return localMnemonic;

  // Fall back to Nostr
  return await this.getMnemonicFromNostr();
}
```

---

## Environment Setup

### Required Environment Variables
```bash
NEXT_PUBLIC_BREEZ_SPARK_API_KEY=your_breez_api_key_here
```

### Deployment Considerations
1. **Vercel/Production**: Only add required env vars (don't import entire .env.local)
2. **WASM Support**: Breez SDK requires WebAssembly support
3. **HTTPS Required**: Lightning operations require secure context
4. **Relay Access**: Needs access to Nostr relays for backup/restore

---

## Testing Workflow

### Local Development
```bash
npm run dev  # Turbopack development server
```

### Test Scenarios
1. **New Wallet Creation**
   - Generate mnemonic
   - Verify encrypted backup saved
   - Check wallet appears in connected list
   - Verify Lightning address registered

2. **Wallet Restoration**
   - Test auto-restore from local storage
   - Test auto-restore from Nostr relays
   - Test manual seed phrase entry
   - Test backup file upload
   - Verify balance/history restored correctly

3. **Payments**
   - Send to Lightning invoice
   - Send to Lightning address
   - Receive via invoice
   - Receive via Lightning address
   - Verify transaction history updates

4. **Onboarding Flow**
   - Test new user signup with Spark wallet
   - Verify wallet saved in localStorage
   - Verify Lightning address in Nostr metadata
   - Test login/logout persistence

### Debugging Tools
- **Browser Console**: All operations log with `[ServiceName]` prefix
- **Redux DevTools**: Monitor state changes
- **Network Tab**: Check Nostr relay connections
- **localStorage**: Inspect encrypted backups

---

## Common Issues & Solutions

### Issue 1: Balance Shows N/A After Restoration
**Symptom**: Wallet restores but balance doesn't display

**Causes**:
- Wallet not synced with network
- Balance display not checking Spark wallet type
- Redux state not updated after sync

**Solutions**:
1. Ensure `refreshWalletState()` called after connection
2. Update UI to check `selectedWallet.kind === 4`
3. Use sparkBalance selector for Spark wallets
4. Call `sparkService.getInfo(true)` to force sync

**Example Fix**:
```javascript
// Before: Only showed userBalance
<h2>{userBalance}</h2>

// After: Check wallet type
<h2>
  {selectedWallet?.kind === 4
    ? (sparkBalance !== null ? sparkBalance : 'N/A')
    : userBalance
  }
</h2>
```

### Issue 2: Redux Serialization Warnings
**Symptom**: Console warnings about non-serializable values

**Causes**:
- Breez SDK returns Map objects (`tokenBalances`)
- BigInt values in payment amounts

**Example Warning**:
```
A non-serializable value was detected in the path: `payload.tokenBalances`
Value: Map(0) {size: 0}
```

**Solutions** (Optional - cosmetic issue):
1. Serialize Map to Object before dispatch
2. Convert BigInt to Number/String
3. Configure Redux middleware to ignore specific paths

### Issue 3: Wallet Not Auto-Restoring on Page Refresh
**Symptom**: User has to manually restore wallet each time

**Causes**:
- Missing auto-restore logic in Wallet.js useEffect
- selectedWallet not persisting in localStorage
- sparkConnected state not triggering restoration

**Solution**:
```javascript
useEffect(() => {
  if (selectedWallet?.kind === 4) {
    if (!sparkConnected && !sparkConnecting) {
      sparkWalletManager.restoreWallet().catch(console.error);
    } else if (sparkConnected) {
      sparkWalletManager.refreshWalletState().catch(console.error);
    }
  }
}, [selectedWallet, sparkConnected, sparkConnecting]);
```

### Issue 4: Multiple Display Locations Need Updates
**Symptom**: One balance display works, others show N/A

**Cause**: Multiple UI locations showing balance, not all updated

**Solution**: Search for all `userBalance` references:
```bash
# Find all balance displays
grep -r "userBalance" src/
```

Update each location to check wallet type:
- Main balance display
- Sidebar balance
- Header balance
- Mobile view balance
- Any modals/popups showing balance

---

## Future Integration Template

When integrating similar wallet providers (e.g., Mutiny, Zeus, Blink):

### Step 1: Analyze Reference Implementation
- [ ] Review provider's SDK documentation
- [ ] Find working reference implementation
- [ ] Document key files and patterns
- [ ] Identify SDK initialization requirements

### Step 2: Create Service Layer
- [ ] SDK wrapper service (`provider.service.js`)
- [ ] Storage service (`provider-storage.service.js`)
- [ ] Backup service (`provider-backup.service.js`)
- [ ] Manager coordinator (`provider-wallet-manager.js`)

### Step 3: State Management
- [ ] Create Redux slice with required state
- [ ] Define actions for wallet operations
- [ ] Add selectors for UI consumption
- [ ] Setup event listeners for auto-updates

### Step 4: UI Components
- [ ] Setup/onboarding wizard
- [ ] Main management component
- [ ] Send payment UI
- [ ] Receive payment UI
- [ ] Transaction history

### Step 5: Integration Points
- [ ] Wallet.js - Display and management
- [ ] Login.js - Onboarding flow
- [ ] Update wallet type system (new kind number)
- [ ] Add to connected wallets list

### Step 6: Testing Checklist
- [ ] New wallet creation flow
- [ ] All restoration methods
- [ ] Send/receive payments
- [ ] Balance display (all locations)
- [ ] Transaction history
- [ ] Onboarding with new users
- [ ] Auto-restore on page refresh
- [ ] Wallet deletion

---

## Lessons Learned

### What Went Well
1. **Reference Implementation**: Having Jumble.social as reference saved significant time
2. **Service Layer Pattern**: Clean separation made debugging easier
3. **Comprehensive Logging**: Detailed logs helped identify issues quickly
4. **Event-Driven Updates**: SDK events auto-updating Redux reduced boilerplate
5. **Multiple Restoration Methods**: Users appreciated flexibility

### What Could Be Improved
1. **Complete UI Updates**: Need checklist for all balance display locations ✅ (Addressed 2025-11-04)
2. **Testing Coverage**: Should test all wallet types together
3. **Documentation**: In-code comments for complex encryption/backup logic
4. **Error Messages**: More user-friendly error messages ✅ (Addressed 2025-11-04)
5. **Type Safety**: Consider TypeScript for better type checking

### Key Takeaways
1. **Always check multiple display locations** - Balance, addresses, etc. appear in many places
2. **Log everything** - `console.log` with service prefixes is invaluable (but clean up for production!)
3. **Test restoration thoroughly** - Users care most about not losing funds
4. **State management is critical** - Redux makes wallet state predictable
5. **Reference implementations** - Don't reinvent the wheel, learn from working code
6. **Error handling is UX** - User-friendly error messages prevent support tickets
7. **Loading states matter** - Eliminate UI flashes with proper connection state checks
8. **Mobile-first design** - Always test responsive behavior with narrow viewports
9. **Translation from the start** - Add i18n keys immediately, not as an afterthought
10. **Production cleanup** - Remove debug code and optimize logging before deployment

---

## Production Deployment Checklist

Before deploying Spark wallet features to production:

### Code Quality
- [x] Remove all debug `console.log` statements
- [x] Convert informational logs to `console.warn` with `(handled)` annotation
- [x] Keep `console.error` only for actual errors
- [x] Remove TODO/FIXME comments or address them
- [x] Clean up temporary debugging code

### Error Handling
- [x] All wallet operations wrapped in try-catch
- [x] User-friendly error messages for common failures
- [x] Toast notifications instead of runtime errors
- [x] Prevent Next.js error overlay on handled errors
- [x] Specific error messages for network issues, insufficient funds, etc.

### UX Polish
- [x] No "N/A" or "Wallet not connected" flashes on page load
- [x] Loading states for all async operations
- [x] Proper wallet connection state checks
- [x] Balance displays handle large numbers gracefully
- [x] Mobile responsive design tested
- [x] All text translated to supported languages

### State Management
- [x] Redux state properly initialized
- [x] No memory leaks from event listeners
- [x] Cleanup functions in useEffect hooks
- [x] State properly reset on wallet disconnect
- [x] Loading/connecting states properly toggled

### Testing Checklist
- [ ] Test new wallet creation
- [ ] Test all 4 restoration methods
- [ ] Test send/receive payments
- [ ] Test wallet switching (Spark ↔ NWC ↔ Alby)
- [ ] Test page refresh with active wallet
- [ ] Test mobile viewport
- [ ] Test with large balances (formatting)
- [ ] Test error scenarios (wrong backup, insufficient funds, network issues)
- [ ] Test in different browsers (Chrome, Firefox, Safari)
- [ ] Test onboarding flow for new users

### Environment Variables
- [ ] `NEXT_PUBLIC_BREEZ_SPARK_API_KEY` set in production
- [ ] Verify API key is valid and not rate-limited
- [ ] Check relay URLs are accessible from production

### Lightning Address Domain (Optional Customization)
- [ ] Decide if using default @breez.tips or custom domain (@yakihonne.com)
- [ ] If custom domain: Contact Breez team for domain setup
- [ ] If custom domain: Configure DNS records as specified
- [ ] If custom domain: Update `spark.service.js` configuration
- [ ] If custom domain: Test username registration with new domain
- [ ] Default @breez.tips works out-of-the-box with no additional setup

### Performance
- [ ] WASM module loads efficiently
- [ ] No excessive re-renders
- [ ] Event listeners properly cleaned up
- [ ] LocalStorage not bloated with old data
- [ ] Reasonable sync intervals configured

### Security
- [ ] Mnemonics encrypted before storage
- [ ] Never log sensitive data (mnemonics, private keys)
- [ ] HTTPS enforced for all operations
- [ ] Proper CORS configuration for relays
- [ ] Input validation on all user inputs

---

## Resources

### Documentation
- [Breez SDK Docs](https://sdk-doc-spark.breez.technology/)
- [Breez SDK GitHub](https://github.com/breez/breez-sdk-spark)
- [Nostr NIPs](https://github.com/nostr-protocol/nips)
- [NDK Docs](https://ndk.fyi/)

### Reference Implementations
- [Jumble.social](https://github.com/starbackr-dev/jumble) - Primary reference
- [Breez SDK Examples](https://github.com/breez/breez-sdk-spark/tree/main/examples)

### Community
- Breez Telegram: [@breeztechnology](https://t.me/breeztechnology)
- Nostr Developers: Various relays and clients
- Lightning Dev Kit: [LDK Discord](https://discord.gg/xnWYzgQ)

---

## Changelog

### 2025-12-13 - SDK 0.5.2 Stabilization & WASM Fixes
- ✅ **Breez SDK 0.5.2 Integration**
  - Upgraded from SDK 0.3.4 to 0.5.2
  - Added privacy mode support in SDK configuration
  - Stable SDK version with reliable sync and connection
- ✅ **WASM Runtime Error Fixes**
  - Fixed WASM function signature mismatch errors
  - Fixed memory access out of bounds errors
  - Restored working spark.service.js from commit 82fa56e
  - Resolved event listener compatibility issues
- ✅ **Next.js Version Pinning**
  - Pinned Next.js to 15.4.5 for WASM compatibility
  - Next.js 15.4.8+ causes WASM handling issues
  - Documented version requirement for future upgrades
- ✅ **Sync Improvements**
  - Made initial wallet sync non-blocking to prevent UI freezing
  - Implemented background sync pattern for better UX
  - Added sync timeout handling (60 second default)
  - Wallet connects immediately, syncs in background
- ✅ **Error Suppression**
  - Added global console.error interceptor for harmless WASM errors
  - Suppressed RecvError during wallet disconnect (cosmetic SDK issue)
  - Enhanced disconnect() method with comprehensive error handling
  - Users no longer see technical WASM errors in console
- ✅ **UI Reordering**
  - Moved Spark Wallet to top of wallet selection in Add Wallet modal
  - Prioritized self-custodial option for better visibility
- ✅ **Privacy Mode Configuration**
  - SDK 0.5.2 supports privacy mode via config object
  - Private mode prevents some metadata from being shared
  - Configurable during SDK initialization
- ✅ **Development Documentation**
  - Updated DEV_NOTES.md with SDK 0.5.2 information
  - Documented WASM compatibility issues and solutions
  - Added privacy mode configuration details
  - Removed deprecated Sparkscan references

### 2025-11-04 - Production Hardening & UX Improvements
- ✅ **Comprehensive Error Handling**
  - Converted all wallet connection errors to user-friendly toast notifications
  - Added specific error messages for NWC relay failures and authorization issues
  - Changed `console.log` to `console.warn` for handled errors to prevent Next.js error overlay
  - Users never see technical runtime errors - all errors gracefully handled
  - Added INSUFFICIENT_FUNDS detection with user-friendly message
- ✅ **Wallet Linking Logic Fix**
  - Fixed "None of connected wallets are linked" appearing incorrectly
  - Now checks ALL wallets against profile address, not just selected wallet
  - Users can switch between wallets without seeing false warnings
  - Spark Lightning addresses properly recognized when viewing other wallet types
- ✅ **Loading State Improvements**
  - Eliminated "Wallet not connected" flash on page refresh
  - Added proper loading states showing "Connecting wallet..." with animation
  - Balance display hidden during Spark wallet connection
  - Sidebar balance hides gracefully when Spark not connected
  - Smooth user experience with no jarring N/A or error messages
- ✅ **Wallet Display Layout Fixes**
  - Fixed overflow issue where eyeball icon was pushed out by large USD values
  - Added text truncation with ellipsis for very large numbers
  - Improved number formatting with thousand separators (e.g., $65,758.10)
  - Added mobile wallet icon for narrow viewports
  - Proper flexbox layout prevents UI breaking with large balances
- ✅ **Translation Integration**
  - Added 9 new translation keys across all 11 languages
  - "Wallet not connected", "Connecting wallet..."
  - SparkBackupInvalidJson, SparkBackupWrongAccount, SparkBackupInvalidFormat
  - SparkBackupUnsupportedVersion, SparkBackupDecryptFailed
  - SparkWalletUnableReceive, SparkWalletUnableSend
  - Updated generic copy message to "Copied to clipboard!"
- ✅ **Code Cleanup for Production**
  - Removed all debug `console.log` statements
  - Cleaned up temporary debugging code
  - Maintained only `console.error` for actual failures and `console.warn` for handled errors
  - Production-ready logging with descriptive labels
- ✅ **Mobile UX Enhancement**
  - Added wallet icon in sidebar for mobile/narrow viewports
  - Users can access wallet page when balance display is hidden
  - Responsive design accommodates all viewport sizes

### 2025-11-02 - UI Polish & Payment History Enhancements
- ✅ Fixed profile link warning - Spark wallet Lightning address now properly recognized
- ✅ Updated Send/Receive UI to match NWC design patterns
  - Added close (X) buttons to Send and Receive tabs
  - Implemented "Use invoice" toggle switch in Send tab
  - Reordered fields to match NWC: Message → Amount → Button
  - Updated button text: "Send Payment" → "Send", "Generate Invoice" → "Generate invoice"
- ✅ Enhanced payment history with expandable details
  - Added expand (+/−) button to all payments
  - Shows comprehensive payment details: ID, status, amount, fees, time, description
  - Added copy functionality for Payment ID, Payment Hash, and Preimage
- ✅ Implemented payment pagination
  - Initial load: 20 payments
  - "Load More" button for additional batches
  - Append mode for infinite scroll capability
- ✅ Fixed payment direction indicators
  - Correctly identifies sent vs received payments (lowercase 'send'/'receive')
  - Properly displays amounts with BigInt support
  - Color-coded status labels (green/orange/red)

### 2025-11-01 - Initial Integration
- ✅ Initial Spark wallet integration complete
- ✅ All 4 restoration methods working
- ✅ Balance display in main wallet view
- ✅ Onboarding flow with wallet type selection

### Future Enhancements
- [ ] Add currency conversion (sats ↔ USD)
- [ ] Add QR code scanning for invoices
- [ ] Add payment request templates
- [ ] Add spending limits/budget features
- [ ] Add multi-wallet support (multiple Spark wallets)
- [ ] Add backup reminders/scheduling
- [ ] Add transaction filtering/search
- [ ] Add export transaction history (CSV)

---

## Notes

This document is meant to be a living reference for wallet integrations. Update it as:
- New issues are discovered and solved
- Patterns evolve
- New wallet providers are added
- Team learns better approaches

**Remember**: The goal is to make the next integration faster and smoother by documenting what worked (and what didn't) this time around.
