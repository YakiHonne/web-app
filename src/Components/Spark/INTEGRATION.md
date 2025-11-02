# Spark Wallet Integration Guide

Quick guide for integrating Spark wallet components into Yakihonne pages.

## Quick Start

### 1. Import Components

```javascript
import {
  SparkWalletSetup,
  SparkWalletManager,
  SparkBalanceDisplay,
  SparkPaymentsList
} from '@/Components/Spark'
```

### 2. Check Connection State

```javascript
import { useSelector } from 'react-redux'

const sparkConnected = useSelector((state) => state.sparkConnected)
const sparkConnecting = useSelector((state) => state.sparkConnecting)
const sparkBalance = useSelector((state) => state.sparkBalance)
```

## Common Integration Patterns

### Pattern 1: Wallet Page (Full Experience)

```javascript
'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { SparkWalletSetup, SparkWalletManager } from '@/Components/Spark';

export default function WalletPage() {
  const sparkConnected = useSelector((state) => state.sparkConnected);
  const [showSetup, setShowSetup] = useState(!sparkConnected);

  if (!sparkConnected && showSetup) {
    return (
      <SparkWalletSetup
        onComplete={() => setShowSetup(false)}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="fx-centered fit-container">
      <SparkWalletManager />
    </div>
  );
}
```

### Pattern 2: Balance Widget in Header/Navbar

```javascript
'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { SparkBalanceDisplay, SparkWalletManager } from '@/Components/Spark';

export default function Navbar() {
  const sparkConnected = useSelector((state) => state.sparkConnected);
  const [showManager, setShowManager] = useState(false);

  return (
    <nav>
      {/* Other navbar items */}

      {sparkConnected && (
        <SparkBalanceDisplay
          onClick={() => setShowManager(true)}
          compact={true}
        />
      )}

      {showManager && (
        <div className="fixed-container fx-centered" style={{ zIndex: 2000 }}>
          <div
            className="sc-s bg-sp box-pad-h box-pad-v"
            style={{ maxWidth: '900px', width: '100%' }}
          >
            <SparkWalletManager
              onClose={() => setShowManager(false)}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
```

### Pattern 3: Modal Wallet Manager

```javascript
'use client';
import { useState } from 'react';
import { SparkWalletManager } from '@/Components/Spark';

export default function WalletModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      style={{ zIndex: 2000000 }}
      onClick={onClose}
    >
      <div
        className="sc-s bg-sp slide-up"
        style={{ maxWidth: '800px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <SparkWalletManager onClose={onClose} />
      </div>
    </div>
  );
}
```

### Pattern 4: Send Payment Flow

```javascript
'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import sparkService from '@/Helpers/Spark/spark.service';
import { setToast } from '@/Store/Slides/Publishers';
import LoadingDots from '@/Components/LoadingDots';
import { useTranslation } from 'react-i18next';

export default function QuickSendPayment({ invoice, amount, onSuccess }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      await sparkService.sendPayment(invoice, amount);
      dispatch(setToast({
        show: true,
        message: t('Payment sent successfully'),
        type: 'success'
      }));
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setToast({
        show: true,
        message: error.message,
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v">
      <h4>{t('Send Payment')}</h4>
      <p className="gray-c">{amount} sats</p>
      <button
        className="btn btn-orange fit-container"
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? <LoadingDots /> : t('Confirm Payment')}
      </button>
    </div>
  );
}
```

### Pattern 5: Receive Payment Flow

```javascript
'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import sparkService from '@/Helpers/Spark/spark.service';
import { setToast } from '@/Store/Slides/Publishers';
import QRCode from 'react-qr-code';
import LoadingDots from '@/Components/LoadingDots';
import { useTranslation } from 'react-i18next';

export default function QuickReceivePayment({ amount, description }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState('');

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await sparkService.receivePayment(amount, description);
      setInvoice(response.paymentRequest);
      dispatch(setToast({
        show: true,
        message: t('Invoice generated'),
        type: 'success'
      }));
    } catch (error) {
      dispatch(setToast({
        show: true,
        message: error.message,
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(invoice);
    dispatch(setToast({
      show: true,
      message: t('Copied to clipboard'),
      type: 'success'
    }));
  };

  return (
    <div className="fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v">
      {!invoice ? (
        <>
          <h4>{t('Generate Invoice')}</h4>
          <p className="gray-c">{amount} sats</p>
          <button
            className="btn btn-orange fit-container"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <LoadingDots /> : t('Generate')}
          </button>
        </>
      ) : (
        <>
          <div className="fx-centered fit-container box-pad-h box-pad-v" style={{ backgroundColor: 'white' }}>
            <QRCode value={invoice} size={200} />
          </div>
          <button className="btn btn-gray fit-container" onClick={handleCopy}>
            {t('Copy Invoice')}
          </button>
        </>
      )}
    </div>
  );
}
```

### Pattern 6: Balance Display Only

```javascript
'use client';
import { useSelector } from 'react-redux';

export default function SimpleBalanceDisplay() {
  const sparkBalance = useSelector((state) => state.sparkBalance);
  const sparkConnected = useSelector((state) => state.sparkConnected);

  if (!sparkConnected) return null;

  const formatSats = (sats) => {
    return new Intl.NumberFormat('en-US').format(sats);
  };

  return (
    <div className="fx-centered" style={{ gap: '8px' }}>
      <span style={{ fontSize: '20px' }}>⚡</span>
      <span className="p-bold orange-c">{formatSats(sparkBalance)} sats</span>
    </div>
  );
}
```

## Adding to Existing Pages

### Navbar Integration

```javascript
// In src/Components/Navbar.js

import { SparkBalanceDisplay } from '@/Components/Spark';

// Add to navbar items
{sparkConnected && (
  <SparkBalanceDisplay
    onClick={() => router.push('/wallet')}
    compact={true}
  />
)}
```

### Settings Page Integration

```javascript
// In src/pages/settings.js or src/app/settings/page.js

import { SparkWalletManager } from '@/Components/Spark';

// Add a wallet settings section
<section>
  <h3>Lightning Wallet</h3>
  <SparkWalletManager />
</section>
```

### Profile Page Integration

```javascript
// Show user's Lightning address on profile

import { useSelector } from 'react-redux';

const sparkLightningAddress = useSelector((state) => state.sparkLightningAddress);

{sparkLightningAddress && (
  <div className="fx-centered" style={{ gap: '8px' }}>
    <span>⚡</span>
    <span>{sparkLightningAddress}</span>
  </div>
)}
```

## Styling Customization

All components use Yakihonne's design system, but you can customize:

### Custom Container Width

```javascript
<div style={{ maxWidth: '600px', margin: '0 auto' }}>
  <SparkWalletManager />
</div>
```

### Custom Modal Background

```javascript
<div
  className="fixed-container fx-centered"
  style={{
    zIndex: 2000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  }}
>
  <SparkWalletSetup />
</div>
```

### Custom Card Style

```javascript
<div className="sc-s box-pad-h box-pad-v" style={{ borderRadius: 'var(--border-r-18)' }}>
  <SparkBalanceDisplay compact={true} />
</div>
```

## Error Handling

All components handle errors internally, but you can add additional error boundaries:

```javascript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="fx-centered fx-col box-pad-h box-pad-v">
      <h4>Something went wrong</h4>
      <p className="gray-c">{error.message}</p>
      <button className="btn btn-orange" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <SparkWalletManager />
</ErrorBoundary>
```

## Performance Optimization

### Lazy Loading

```javascript
import dynamic from 'next/dynamic';

const SparkWalletManager = dynamic(
  () => import('@/Components/Spark').then(mod => mod.SparkWalletManager),
  { ssr: false }
);
```

### Conditional Rendering

```javascript
// Only load when needed
{showWallet && <SparkWalletManager />}
```

## Troubleshooting

### Component Not Showing
- Check if `sparkConnected` state is true
- Verify Redux store is configured correctly
- Check console for errors

### Styling Issues
- Ensure Yakihonne's CSS is loaded
- Check for CSS conflicts
- Verify CSS variables are defined

### State Not Updating
- Check Redux DevTools
- Verify sparkWalletManager is initialized
- Check network tab for API calls

## Additional Resources

- See `README.md` for detailed component documentation
- Check `spark-wallet-manager.js` for available methods
- Review existing Yakihonne components for patterns
- Test with Redux DevTools for state debugging
