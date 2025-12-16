# Spark Wallet Zap Profile Pictures - Implementation Attempts

## Goal
Display sender profile pictures and usernames for incoming Nostr zaps in Spark wallet payment history (similar to WebLN wallet functionality).

## Current SDK Version
- **Breez Spark SDK**: 0.5.2
- **Status**: Stable, but lacks built-in zap metadata support

## Problem
SDK 0.5.2 payment objects only contain:
- `type`, `preimage`, `invoice`, `paymentHash`, `destinationPubkey`
- **Missing**: sender pubkey, zap comment, or any NIP-57 zap-specific data

## Attempts Made

### Attempt 1: Query Zap Receipts with #P Tag (Uppercase)
**Approach**: Query kind 9735 (zap receipts) with `#P` tag (uppercase P = recipient)
**Result**: ❌ Failed - fetched receipts but invoices didn't match

**Issue**: NIP-57 spec uses lowercase `#p` for recipient in zap receipts, not uppercase `#P`

### Attempt 2: Query Zap Requests (kind 9734)
**Approach**: Query kind 9734 (zap requests) sent to recipient, match by amount and timestamp
**Result**: ❌ Failed - zap requests exist but matching logic too fuzzy

**Issue**: Matching by amount/time is unreliable (multiple zaps of same amount, timing drift)

### Attempt 3: Query Zap Receipts with #p Tag (Lowercase)
**Approach**:
- Query kind 9735 (zap receipts) with `#p` tag (lowercase) = recipient pubkey
- Match by exact bolt11 invoice string
- Extract zap request from `description` tag
**Result**: ❌ Failed - receipts fetched but no invoice matches found

**Issue**: The zap receipts on Nostr don't match the invoices in Spark wallet payments
- Possible reasons:
  1. Zap receipts not published by all senders/wallets
  2. Timing mismatch (receipts published later than payments received)
  3. Private mode in Spark may affect receipt publication
  4. Different relays may have different receipt coverage

### Root Cause Analysis

**WebLN Wallet Works** because it:
1. Subscribes to zap receipts (kind 9735) in real-time
2. Matches receipts as they arrive
3. Doesn't rely on Spark SDK payment data

**Spark Wallet Can't Work** with SDK 0.5.2 because:
1. Payment objects don't include zap metadata
2. Zap receipts on Nostr don't reliably match payment invoices
3. Need to query Nostr retroactively, which is unreliable

## The Solution (Requires SDK Upgrade)

According to Breez developer:
> "The latest sdk release contains nostr zap support in private mode (if the sdk is online, otherwise it takes a while to publish the zap receipt). It also contains lnurl comment support and shows the zap receipts on the payments."

**SDK 0.6.x includes**:
- Built-in zap metadata in payment objects
- Automatic zap receipt handling
- LNURL comment support
- Sender pubkey in payment data

**Blocker**: Upgrading to SDK 0.6.3 previously broke the app
- Wallet hung at "Restoring your wallet..."
- `syncWallet()` promise didn't resolve
- Had to revert to 0.5.2

## Recommendation

### Short Term (Current State)
- Revert profile picture implementation attempts
- Keep Spark wallet functional on SDK 0.5.2
- Accept that zap sender info won't be displayed

### Medium Term
- Debug and fix SDK 0.6.x upgrade issues:
  - Review breaking changes between 0.5.2 → 0.6.x
  - Update event listeners (Sync event structure changed)
  - Fix initialization code
  - Test thoroughly before merging

### Long Term
- Once SDK 0.6.x is stable, zap profiles will work automatically
- No Nostr querying needed - data comes from SDK

## Files Modified (To Be Reverted)

1. `src/Helpers/Spark/spark-zap-receipt.service.js`
   - Added `fetchZapReceiptFromNostr()` method
   - Modified `extractZapRequestFromPayment()` to be async
   - Added Nostr relay querying logic

2. `src/Components/Spark/SparkPaymentsList.js`
   - Added zap request caching (`zapRequests` state)
   - Modified profile fetching to await async zap extraction
   - Added detailed debug logging

3. `src/Components/UserBalance.js`
   - Minor changes for Spark wallet detection

4. `src/Components/AppInit.js`
   - Auto-connect logic for Spark wallet

## Key Learnings

1. **NIP-57 Zap Flow**:
   - Sender creates kind 9734 zap request
   - LNURL service creates invoice with `description_hash`
   - Sender pays invoice
   - LNURL service publishes kind 9735 zap receipt to Nostr
   - Receipt contains zap request in `description` tag

2. **Tag Naming**:
   - `#p` (lowercase) = recipient pubkey in both requests and receipts
   - `#P` (uppercase) = used in some contexts but not standard NIP-57

3. **SDK Limitations**:
   - SDK 0.5.2 is stable but feature-incomplete for zaps
   - SDK 0.6.x has the features but introduces breaking changes
   - Cannot mix approaches - either use SDK data OR Nostr queries, not both

## References

- NIP-57 Spec: https://github.com/nostr-protocol/nips/blob/master/57.md
- Breez Spark SDK: https://github.com/breez/breez-sdk-spark
- PR #381: Expose private mode config (0.4.2+)
- PR #465: LNURL receive metadata docs

---

**Date**: December 12, 2025
**SDK Version**: 0.5.2
**Conclusion**: Feature requires SDK 0.6.x upgrade, which needs debugging work before it can be used.
