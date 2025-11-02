# Spark Wallet UI Components

Comprehensive React components for Breez Spark Lightning wallet integration in Yakihonne. These components match Yakihonne's existing design system and provide a complete user interface for wallet operations.

## Components Overview

### 1. SparkWalletSetup.js
**Purpose:** Onboarding component for creating and restoring Spark wallets

**Features:**
- **Create New Wallet Tab**
  - Generates 12-word BIP39 mnemonic
  - Option to backup to Nostr (encrypted)
  - Display seed phrase in a secure, readable grid
  - Copy to clipboard functionality
  - Download encrypted backup file
  - Confirmation flow before completing setup

- **Restore from Nostr Tab**
  - Auto-detects encrypted backup on Nostr relays
  - One-click restoration
  - Decrypts using user's Nostr keys

- **Restore from File Tab**
  - File upload interface with drag-and-drop styling
  - Accepts .json/.txt encrypted backup files
  - Validates and decrypts backup

- **Enter Seed Phrase Tab**
  - Manual seed phrase entry
  - Supports 12 or 24 word mnemonics
  - Real-time word count display
  - Input validation

**Props:**
- `onComplete`: Function called when setup is successfully completed
- `onCancel`: Function called when user cancels setup

**Usage:**
```javascript
import { SparkWalletSetup } from '@/Components/Spark'

<SparkWalletSetup
  onComplete={() => console.log('Setup complete')}
  onCancel={() => console.log('Setup cancelled')}
/>
```

---

### 2. SparkWalletManager.js
**Purpose:** Main wallet management interface with full functionality

**Features:**
- **Header Section**
  - Balance display with sync button
  - Lightning address display with copy functionality
  - Last sync timestamp
  - Close button (optional)

- **Send Tab**
  - Input for Lightning invoice (BOLT11) or Lightning address
  - Dynamic amount field (appears for Lightning addresses)
  - Send button with loading state
  - Comprehensive error handling
  - Auto-refresh after successful payment

- **Receive Tab**
  - Amount input field
  - Optional description field
  - Generate invoice button
  - QR code display (256x256)
  - Copy invoice to clipboard
  - Reset to create new invoice

- **Transactions Tab**
  - Shows SparkPaymentsList component
  - Full payment history
  - Expandable transaction details

- **Settings Tab**
  - **Lightning Address Management**
    - Register new Lightning address (@breez.tips)
    - Real-time username availability checking
    - Display current Lightning address
    - Delete Lightning address option

  - **Backup Section**
    - Download encrypted backup button
    - Clear instructions

  - **Danger Zone**
    - Delete wallet permanently
    - Confirmation dialog
    - Warning about needing backup

**Props:**
- `onClose`: Optional function called when close button is clicked

**Usage:**
```javascript
import { SparkWalletManager } from '@/Components/Spark'

<SparkWalletManager
  onClose={() => console.log('Wallet manager closed')}
/>
```

---

### 3. SparkPaymentsList.js
**Purpose:** Transaction history display with expandable details

**Features:**
- **Transaction List**
  - Incoming (📥) and outgoing (📤) indicators
  - Amount in sats with +/- prefix
  - Status badges (Completed, Pending, Failed)
  - Date and time
  - Description (if available)
  - Click to expand for full details

- **Expanded Transaction Details**
  - Full amount breakdown
  - Fee information
  - Status with color coding
  - Full date/time
  - Description
  - Payment hash (copyable)
  - Payment preimage (for successful payments)
  - BOLT11 invoice (for outgoing payments)
  - Error details (for failed payments)

- **Pagination**
  - Load more button
  - Loads 20 transactions at a time
  - Disables when no more transactions

- **Empty State**
  - Friendly message when no transactions exist

**Props:** None (uses Redux state)

**Usage:**
```javascript
import { SparkPaymentsList } from '@/Components/Spark'

<SparkPaymentsList />
```

---

### 4. SparkBalanceDisplay.js
**Purpose:** Compact balance widget for displaying wallet balance

**Features:**
- **Balance Display**
  - Shows balance in sats
  - Optional USD conversion (uses CoinGecko API)
  - Show/hide toggle for privacy
  - Click to open full wallet manager

- **Display Modes**
  - **Compact Mode**: Minimal display for sidebars/headers
  - **Full Mode**: Larger display with more information

- **Connection States**
  - Connecting state
  - Connected state
  - Hidden when not connected

**Props:**
- `onClick`: Function called when component is clicked
- `showUSD`: Boolean to show/hide USD conversion (default: true)
- `compact`: Boolean for compact mode (default: false)

**Usage:**
```javascript
import { SparkBalanceDisplay } from '@/Components/Spark'

// Full display
<SparkBalanceDisplay
  onClick={() => setShowWalletManager(true)}
  showUSD={true}
  compact={false}
/>

// Compact display
<SparkBalanceDisplay
  onClick={() => setShowWalletManager(true)}
  compact={true}
/>
```

---

## Design System Integration

All components strictly follow Yakihonne's design system:

### Colors
- Primary: `--c1` / `--orange-main` (#ee7700)
- Background: `--bg-main`, `--bg-sp`, `--c1-side`
- Text: `orange-c`, `gray-c`, `red-c`, `green-c`

### Typography
- Font: 'DM Sans'
- Classes: `.p-medium`, `.p-small`, `.p-bold`, `.p-big`, `.p-maj`

### Buttons
- `.btn` - Base button
- `.btn-orange` - Primary action
- `.btn-gray` - Secondary action
- `.btn-small` - Compact button
- `.btn-orange-gst` - Ghost style
- `.fx` - Flex sizing

### Layout
- `.fx-centered` - Center items
- `.fx-scattered` - Space between
- `.fx-col` - Flex column
- `.fx-start-h` - Start alignment horizontal
- `.fx-start-v` - Start alignment vertical
- `.fit-container` - Full width

### Spacing
- `--16`, `--24`, `--32`, `--40`, `--48` - CSS variables
- `.box-pad-h` - Horizontal padding
- `.box-pad-v` - Vertical padding
- `.box-pad-h-s`, `.box-pad-v-s` - Small padding
- `.box-pad-h-m`, `.box-pad-v-m` - Medium padding

### Borders
- `--border-r-6` - Small radius (inputs)
- `--border-r-18` - Medium radius (buttons)
- `--border-r-50` - Full radius (circles)
- `.sc-s` - Standard card shadow

### Interactive
- `.pointer` - Cursor pointer
- `.option` - Hover effect
- `.option-no-scale` - Hover without scale

---

## State Management

All components use Redux for state management:

### Required Redux State
```javascript
// From SparkWallet slice
state.sparkConnected      // boolean
state.sparkConnecting     // boolean
state.sparkBalance        // number (sats)
state.sparkLightningAddress  // string
state.sparkWalletInfo     // object
state.sparkLastSync       // timestamp
state.sparkPayments       // array

// From main state
state.userKeys           // user's Nostr keys
state.userMetadata       // user's profile
```

### Redux Actions Used
```javascript
import {
  setSparkConnected,
  setSparkConnecting,
  setSparkBalance,
  setSparkLightningAddress,
  setSparkWalletInfo,
  setSparkLastSync,
  setSparkPayments
} from '@/Store/Slides/SparkWallet'

import { setToast } from '@/Store/Slides/Publishers'
```

---

## Internationalization

All user-facing text uses i18next:

```javascript
const { t } = useTranslation()

// Usage
<p>{t('Create New Wallet')}</p>
<button>{t('Send Payment')}</button>
```

### Translation Keys Used
- Wallet setup: 'Create New Wallet', 'Restore from Nostr', etc.
- Actions: 'Send Payment', 'Generate Invoice', 'Copy', etc.
- Status: 'Connecting...', 'Connected', 'Failed', etc.
- Messages: 'Wallet created successfully', 'Invalid seed phrase', etc.

---

## Error Handling

All components implement comprehensive error handling:

1. **Try-Catch Blocks**: All async operations wrapped in try-catch
2. **Loading States**: Disable buttons and show loading indicators
3. **User Feedback**: Toast notifications for success/error
4. **Validation**: Input validation before API calls
5. **Error Messages**: User-friendly error messages

Example pattern:
```javascript
const handleAction = async () => {
  try {
    setLoading(true)
    await sparkWalletManager.someAction()
    dispatch(setToast({
      show: true,
      message: t('Success message'),
      type: 'success'
    }))
  } catch (error) {
    console.error('Error:', error)
    dispatch(setToast({
      show: true,
      message: error.message || t('Error message'),
      type: 'error'
    }))
  } finally {
    setLoading(false)
  }
}
```

---

## Dependencies

### External Libraries
- `react` - Core framework
- `react-i18next` - Internationalization
- `react-redux` - State management
- `react-qr-code` - QR code generation

### Internal Dependencies
- `@/Helpers/Spark/spark-wallet-manager` - Wallet operations
- `@/Helpers/Spark/spark.service` - SDK service
- `@/Helpers/Spark/spark-backup.service` - Backup operations
- `@/Components/LoadingDots` - Loading indicator
- `@/Store/Slides/SparkWallet` - Redux actions
- `@/Store/Slides/Publishers` - Toast notifications

---

## Best Practices

1. **Always use sparkWalletManager**: Don't call SDK methods directly
2. **Loading states**: Always show loading indicators for async operations
3. **Error messages**: Always display user-friendly error messages
4. **Validation**: Validate inputs before making API calls
5. **Cleanup**: Reset form states after successful operations
6. **Accessibility**: Use semantic HTML and proper ARIA labels
7. **Responsive**: Use flex layouts and relative units
8. **Security**: Never log sensitive data (mnemonics, keys)

---

## Integration Example

Complete example of integrating Spark wallet into Yakihonne:

```javascript
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  SparkWalletSetup,
  SparkWalletManager,
  SparkBalanceDisplay
} from '@/Components/Spark'

export default function WalletPage() {
  const sparkConnected = useSelector((state) => state.sparkConnected)
  const [showSetup, setShowSetup] = useState(false)
  const [showManager, setShowManager] = useState(false)

  return (
    <div>
      {/* Balance widget in header/sidebar */}
      {sparkConnected && (
        <SparkBalanceDisplay
          onClick={() => setShowManager(true)}
          compact={true}
        />
      )}

      {/* Setup wizard */}
      {!sparkConnected && showSetup && (
        <SparkWalletSetup
          onComplete={() => {
            setShowSetup(false)
            setShowManager(true)
          }}
          onCancel={() => setShowSetup(false)}
        />
      )}

      {/* Wallet manager */}
      {sparkConnected && showManager && (
        <SparkWalletManager
          onClose={() => setShowManager(false)}
        />
      )}

      {/* Setup button for new users */}
      {!sparkConnected && !showSetup && (
        <button onClick={() => setShowSetup(true)}>
          Setup Spark Wallet
        </button>
      )}
    </div>
  )
}
```

---

## Testing Checklist

- [ ] Create new wallet and save seed phrase
- [ ] Download encrypted backup file
- [ ] Restore wallet from Nostr backup
- [ ] Restore wallet from file
- [ ] Restore wallet from seed phrase
- [ ] Send payment to BOLT11 invoice
- [ ] Send payment to Lightning address
- [ ] Generate and display invoice
- [ ] Copy invoice to clipboard
- [ ] View transaction history
- [ ] Expand transaction details
- [ ] Register Lightning address
- [ ] Check username availability
- [ ] Delete Lightning address
- [ ] Download backup from settings
- [ ] Delete wallet
- [ ] Toggle balance visibility
- [ ] Sync wallet manually
- [ ] Load more transactions

---

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify Redux state is properly configured
3. Ensure all required dependencies are installed
4. Check that Breez API key is configured in environment variables

---

## License

Part of the Yakihonne project. See main project LICENSE file.
