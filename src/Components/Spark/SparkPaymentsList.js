'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import sparkWalletManager from '@/Helpers/Spark/spark-wallet-manager';
import sparkZapReceipt from '@/Helpers/Spark/spark-zap-receipt.service';
import { setToast } from '@/Store/Slides/Publishers';
import LoadingDots from '@/Components/LoadingDots';
import Date_ from '@/Components/Date_';
import UserProfilePic from '@/Components/UserProfilePic';
import { ndkInstance } from '@/Helpers/NDKInstance';
import { getEmptyuserMetadata } from '@/Helpers/Encryptions';

export default function SparkPaymentsList() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sparkPayments = useSelector((state) => state.sparkPayments);
  const [loading, setLoading] = useState(false);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  // Nostr profile management for zap senders
  const [nostrProfiles, setNostrProfiles] = useState({}); // pubkey -> profile map

  useEffect(() => {
    loadPayments();
  }, []);

  // Fetch Nostr profiles for zap payments
  useEffect(() => {
    if (!ndkInstance || !sparkPayments || sparkPayments.length === 0) return;

    const fetchProfiles = async () => {
      try {
        // Extract unique pubkeys from zap payments
        const pubkeysToFetch = new Set();

        sparkPayments.forEach((payment) => {
          // Skip if already fetched
          if (nostrProfiles[payment.id]) return;

          // Check if this is a zap payment
          const zapRequest = sparkZapReceipt.extractZapRequestFromPayment(payment);
          if (zapRequest && zapRequest.pubkey) {
            pubkeysToFetch.add(zapRequest.pubkey);
          }
        });

        if (pubkeysToFetch.size === 0) return;

        console.log('[SparkPaymentsList] Fetching profiles for', pubkeysToFetch.size, 'zap senders');

        // Fetch profiles from Nostr
        const profiles = {};
        for (const pubkey of pubkeysToFetch) {
          try {
            const user = ndkInstance.getUser({ pubkey });
            await user.fetchProfile();

            if (user.profile) {
              profiles[pubkey] = {
                pubkey,
                name: user.profile.name || user.profile.displayName || 'Anonymous',
                display_name: user.profile.displayName || user.profile.name,
                picture: user.profile.image || user.profile.picture,
                ...user.profile
              };
            } else {
              profiles[pubkey] = getEmptyuserMetadata(pubkey);
            }
          } catch (error) {
            console.warn('[SparkPaymentsList] Failed to fetch profile for', pubkey, error);
            profiles[pubkey] = getEmptyuserMetadata(pubkey);
          }
        }

        // Update state with fetched profiles
        setNostrProfiles((prev) => ({ ...prev, ...profiles }));
      } catch (error) {
        console.error('[SparkPaymentsList] Failed to fetch profiles:', error);
      }
    };

    fetchProfiles();
  }, [sparkPayments]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Load initial batch of payments
      const payments = await sparkWalletManager.refreshPayments(0, limit, false);
      setOffset(limit);
      setHasMore(payments.length >= limit);
    } catch (error) {
      console.error('Failed to load payments:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('Failed to load payments'),
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadMorePayments = async () => {
    try {
      setLoading(true);
      // Append more payments to existing ones
      const morePayments = await sparkWalletManager.refreshPayments(offset, limit, true);

      if (morePayments.length < limit) {
        setHasMore(false);
      }
      setOffset(offset + morePayments.length);
    } catch (error) {
      console.error('Failed to load more payments:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('Failed to load more payments'),
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentDetails = (paymentId) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return t('Unknown');
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatSats = (sats) => {
    if (!sats && sats !== 0) return '0';
    return new Intl.NumberFormat('en-US').format(sats);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'complete':
      case 'succeeded':
        return 'green-c';
      case 'pending':
        return 'orange-c';
      case 'failed':
        return 'red-c';
      default:
        return 'gray-c';
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'complete':
      case 'succeeded':
        return t('Completed');
      case 'pending':
        return t('Pending');
      case 'failed':
        return t('Failed');
      default:
        return status;
    }
  };

  const getPaymentTypeIcon = (payment) => {
    if (payment.paymentType === 'received') return '📥';
    if (payment.paymentType === 'sent') return '📤';
    return '⚡';
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    dispatch(setToast({
      show: true,
      message: `${label} ${t('copied to clipboard')}`,
      type: 'success'
    }));
  };

  if (loading && sparkPayments.length === 0) {
    return (
      <div className="fx-centered fit-container box-pad-v">
        <LoadingDots />
      </div>
    );
  }

  if (!sparkPayments || sparkPayments.length === 0) {
    return (
      <div
        className="fit-container fx-centered fx-col"
        style={{ height: "30vh" }}
      >
        <h4>{t("Ag3spMM")}</h4>
        <p className="gray-c p-centered">{t("AgaoyPx")}</p>
      </div>
    );
  }

  // Debug: Log payments to see structure - always log for debugging
  if (sparkPayments.length > 0) {
    console.log('[SparkPaymentsList] Total payments:', sparkPayments.length);
    console.log('[SparkPaymentsList] First payment RAW:', sparkPayments[0]);
    console.log('[SparkPaymentsList] All payment fields:', Object.keys(sparkPayments[0]));
    // Log each field individually to handle BigInt
    const firstPayment = sparkPayments[0];
    Object.keys(firstPayment).forEach(key => {
      const value = firstPayment[key];
      console.log(`  ${key}:`, typeof value === 'bigint' ? `${value.toString()} (BigInt)` : value);
    });
  }

  return (
    <div className="fit-container box-pad-v fx-centered fx-col fx-start-v">
      <p className="gray-c">{t('Transactions')}</p>
      {sparkPayments.map((payment, index) => {
        // Debug each payment
        if (index === 0) {
          console.log('[SparkPaymentsList] Processing payment:', payment);
        }

        // Check if this is a zap payment and extract sender info
        const zapRequest = sparkZapReceipt.extractZapRequestFromPayment(payment);
        const isZap = !!zapRequest;
        const senderPubkey = zapRequest?.pubkey;
        const senderProfile = senderPubkey ? nostrProfiles[senderPubkey] : null;
        const zapComment = zapRequest?.content || '';

        // Handle different possible field names from Breez SDK
        // Breez Spark SDK uses lowercase 'send'/'receive' for paymentType
        const isOutgoing = payment.paymentType === 'send' || payment.paymentType === 'sent' ||
                          payment.paymentType === 'Sent' || payment.direction === 'outbound';

        // Handle BigInt and different field names for amount
        // Breez Spark SDK uses 'amount' field directly in sats (as BigInt)
        let amountSats = payment.amount || payment.amountSat || 0;

        // Convert BigInt to Number if needed
        if (typeof amountSats === 'bigint') {
          amountSats = Number(amountSats);
        }

        // If we have amountMsat instead, convert it to sats
        if (payment.amountMsat && !payment.amount) {
          let amountMsat = payment.amountMsat;
          // Convert BigInt to Number if needed
          if (typeof amountMsat === 'bigint') {
            amountMsat = Number(amountMsat);
          }
          amountSats = Math.floor(amountMsat / 1000);
        }

        // Get all available payment details
        const paymentTime = payment.paymentTime || payment.payment_time || payment.timestamp || 0;
        const status = payment.status || 'unknown';
        const fees = payment.fees || payment.fee || 0;
        let feesSats = typeof fees === 'bigint' ? Number(fees) : fees;

        return (
          <div
            key={payment.id || `payment-${index}`}
            className="fit-container fx-scattered fx-col sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
            style={{
              overflow: 'visible'
            }}
          >
            <div className="fit-container fx-scattered">
              <div className="fx-centered fx-start-h">
                {/* Show profile pic for incoming zaps, otherwise direction indicator */}
                {!isOutgoing && isZap && senderProfile ? (
                  <UserProfilePic
                    user={senderProfile}
                    size="small"
                  />
                ) : (
                  <>
                    {/* Direction indicator for non-zap payments */}
                    {isOutgoing && (
                      <div
                        className="round-icon round-icon-tooltip"
                        data-tooltip={t('AkPQ73T')}
                      >
                        <p className="red-c">&#8593;</p>
                      </div>
                    )}
                    {!isOutgoing && (
                      <div
                        className="round-icon round-icon-tooltip"
                        data-tooltip={t('A4G4OJ7')}
                      >
                        <p className="green-c">&#8595;</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <p className="gray-c p-medium">
                    <Date_
                      toConvert={new Date(paymentTime * 1000)}
                      time={true}
                    />
                  </p>
                  <p>
                    {!isOutgoing && isZap && senderProfile ? (
                      <>
                        <span className="gray-c">{senderProfile.name || senderProfile.display_name || 'Anonymous'}</span>
                        {' '}{t('sent you')}{' '}
                        <span className="orange-c">
                          {amountSats}{' '}
                          <span className="gray-c">Sats</span>
                        </span>
                      </>
                    ) : (
                      <>
                        {isOutgoing ? t('ATyFagO') : t('AyVA6Q3')}
                        <span className="orange-c">
                          {' '}
                          {amountSats}{' '}
                          <span className="gray-c">Sats</span>
                        </span>
                      </>
                    )}
                  </p>
                  {/* Show zap comment if available */}
                  {!isOutgoing && isZap && zapComment && (
                    <p className="gray-c p-small" style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                      "{zapComment}"
                    </p>
                  )}
                </div>
              </div>

              {/* Always show expand button */}
              <div
                className="round-icon-small round-icon-tooltip pointer"
                data-tooltip={expandedPayment === payment.id ? t('Hide details') : t('Show details')}
                onClick={() => togglePaymentDetails(payment.id)}
              >
                <p>{expandedPayment === payment.id ? '−' : '+'}</p>
              </div>
            </div>

            {/* Expanded payment details */}
            {expandedPayment === payment.id && (
              <div className="fit-container fx-col box-pad-v-s" style={{ gap: 'var(--8)' }}>
                {/* Zap sender info (if available) */}
                {isZap && senderProfile && (
                  <div className="fit-container fx-col" style={{ gap: 'var(--4)' }}>
                    <p className="gray-c p-small">{t('From')}:</p>
                    <div className="fx-centered fx-start-h" style={{ gap: 'var(--8)' }}>
                      <UserProfilePic user={senderProfile} size="tiny" />
                      <p className="p-small">
                        {senderProfile.name || senderProfile.display_name || 'Anonymous'}
                      </p>
                    </div>
                    {zapComment && (
                      <>
                        <p className="gray-c p-small" style={{ marginTop: 'var(--8)' }}>{t('Message')}:</p>
                        <p className="p-small" style={{ fontStyle: 'italic' }}>"{zapComment}"</p>
                      </>
                    )}
                  </div>
                )}

                {/* Payment ID - Hidden for privacy (private mode enabled by default) */}
                {/* Note: Payment IDs and block explorer links are intentionally hidden
                    to protect user privacy when using Spark wallet in private mode.
                    This prevents on-chain transaction correlation. */}
                {false && payment.id && (
                  <div className="fit-container fx-col" style={{ gap: 'var(--4)' }}>
                    <p className="gray-c p-small">{t('Payment ID')}:</p>
                    <div className="fx-scattered fit-container" style={{ gap: 'var(--8)' }}>
                      <p className="p-small" style={{ fontFamily: 'monospace', fontSize: '0.85em', flex: 1 }}>
                        {payment.id}
                      </p>
                      <div className="fx-centered" style={{ gap: 'var(--8)' }}>
                        <div
                          className="round-icon-small pointer"
                          onClick={() => copyToClipboard(payment.id, t('Payment ID'))}
                          title={t('Copy')}
                        >
                          <div className="copy"></div>
                        </div>
                        <a
                          href={`https://www.sparkscan.io/tx/${payment.id}?network=mainnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="round-icon-small pointer"
                          title={t('View on Sparkscan')}
                        >
                          <p>🔍</p>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="fx-scattered fit-container">
                  <p className="gray-c p-small">{t('Status')}:</p>
                  <p className={`p-small ${getPaymentStatusColor(status)}`}>
                    {getPaymentStatusLabel(status)}
                  </p>
                </div>

                {/* Amount */}
                <div className="fx-scattered fit-container">
                  <p className="gray-c p-small">{t('Amount')}:</p>
                  <p className="p-small orange-c">{formatSats(amountSats)} sats</p>
                </div>

                {/* Fees (if available and non-zero) */}
                {feesSats > 0 && (
                  <div className="fx-scattered fit-container">
                    <p className="gray-c p-small">{t('Fee')}:</p>
                    <p className="p-small">{formatSats(feesSats)} sats</p>
                  </div>
                )}

                {/* Timestamp */}
                <div className="fx-scattered fit-container">
                  <p className="gray-c p-small">{t('Time')}:</p>
                  <p className="p-small">{formatDate(paymentTime)}</p>
                </div>

                {/* Description (if available) */}
                {payment.description && (
                  <div className="fit-container fx-col" style={{ gap: 'var(--4)' }}>
                    <p className="gray-c p-small">{t('Description')}:</p>
                    <p className="p-small">{payment.description}</p>
                  </div>
                )}

                {/* Payment Hash (if available) */}
                {payment.paymentHash && (
                  <div className="fit-container fx-col" style={{ gap: 'var(--4)' }}>
                    <p className="gray-c p-small">{t('Payment Hash')}:</p>
                    <div className="fx-scattered fit-container" style={{ gap: 'var(--8)' }}>
                      <p className="p-small" style={{ fontFamily: 'monospace', fontSize: '0.75em', wordBreak: 'break-all', flex: 1 }}>
                        {payment.paymentHash}
                      </p>
                      <div
                        className="round-icon-small pointer"
                        onClick={() => copyToClipboard(payment.paymentHash, t('Payment Hash'))}
                        title={t('Copy')}
                      >
                        <div className="copy"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preimage (if available) */}
                {payment.preimage && (
                  <div className="fit-container fx-col" style={{ gap: 'var(--4)' }}>
                    <p className="gray-c p-small">{t('Preimage')}:</p>
                    <div className="fx-scattered fit-container" style={{ gap: 'var(--8)' }}>
                      <p className="p-small" style={{ fontFamily: 'monospace', fontSize: '0.75em', wordBreak: 'break-all', flex: 1 }}>
                        {payment.preimage}
                      </p>
                      <div
                        className="round-icon-small pointer"
                        onClick={() => copyToClipboard(payment.preimage, t('Preimage'))}
                        title={t('Copy')}
                      >
                        <div className="copy"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && sparkPayments.length > 0 && (
        <div className="fit-container fx-centered box-pad-v">
          <button
            className="btn btn-gray"
            onClick={loadMorePayments}
            disabled={loading}
          >
            {loading ? <LoadingDots /> : t('Load More')}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && sparkPayments.length === 0 && (
        <div className="fit-container fx-centered box-pad-v">
          <LoadingDots />
        </div>
      )}
    </div>
  );
}
