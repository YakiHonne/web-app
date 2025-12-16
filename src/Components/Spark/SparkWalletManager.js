'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import sparkWalletManager from '@/Helpers/Spark/spark-wallet-manager';
import sparkService from '@/Helpers/Spark/spark.service';
import sparkStorage from '@/Helpers/Spark/spark-storage.service';
import { setToast } from '@/Store/Slides/Publishers';
import LoadingDots from '@/Components/LoadingDots';
import QRCode from 'react-qr-code';
import SparkPaymentsList from './SparkPaymentsList';
import { shortenKey } from '@/Helpers/Encryptions';

export default function SparkWalletManager({ onClose, inlineMode = false, externalOps = null, setExternalOps = null }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sparkConnected = useSelector((state) => state.sparkConnected);
  const sparkConnecting = useSelector((state) => state.sparkConnecting);
  const sparkBalance = useSelector((state) => state.sparkBalance);
  const sparkLightningAddress = useSelector((state) => state.sparkLightningAddress);
  const sparkLastSync = useSelector((state) => state.sparkLastSync);

  // Use external ops state if provided (inline mode), otherwise use internal state
  // In inline mode, default to empty (show transactions), otherwise default to 'send'
  const [internalActiveTab, setInternalActiveTab] = useState(inlineMode ? '' : 'send');
  const activeTab = inlineMode && externalOps !== null ? externalOps : internalActiveTab;
  const setActiveTab = inlineMode && setExternalOps ? setExternalOps : setInternalActiveTab;
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Send tab state
  const [sendInput, setSendInput] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [useInvoice, setUseInvoice] = useState(false);

  // Receive tab state
  const [receiveAmount, setReceiveAmount] = useState('');
  const [receiveDescription, setReceiveDescription] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState('');

  // Settings tab state
  const [lightningUsername, setLightningUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Seed phrase reveal state
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [loadingSeedPhrase, setLoadingSeedPhrase] = useState(false);

  useEffect(() => {
    if (sparkConnected) {
      refreshWallet();
    }
  }, [sparkConnected]);

  // Also refresh on mount if already connected
  useEffect(() => {
    if (sparkConnected) {
      refreshWallet();
    }
  }, []);

  const refreshWallet = async () => {
    try {
      setSyncing(true);
      await sparkWalletManager.syncWallet();
      await sparkWalletManager.refreshPayments();
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSendPayment = async () => {
    if (!sendInput.trim()) {
      dispatch(setToast({
        desc: t('Please enter an invoice or Lightning address'),
        type: 2
      }));
      return;
    }

    // Check if it's a Lightning address (not using invoice) and needs amount
    if (!useInvoice && !sendAmount) {
      dispatch(setToast({
        desc: t('Please enter an amount'),
        type: 2
      }));
      return;
    }

    // Validate amount if provided
    const amount = sendAmount ? parseInt(sendAmount) : undefined;
    if (amount && amount > sparkBalance) {
      dispatch(setToast({
        type: 2,
        desc: t('Insufficient balance')
      }));
      return;
    }

    try {
      setLoading(true);
      await sparkService.sendPayment(sendInput, amount);
      dispatch(setToast({
        type: 1,
        desc: t('Payment sent successfully')
      }));
      setSendInput('');
      setSendAmount('');
      await refreshWallet();
      setActiveTab('transactions');
    } catch (error) {
      console.warn('Failed to send payment (handled):', error);

      // Parse error message for common issues
      let errorMessage = error.message || t('Failed to send payment');

      if (errorMessage === 'INSUFFICIENT_FUNDS' ||
          errorMessage.toLowerCase().includes('insufficient') ||
          errorMessage.toLowerCase().includes('balance')) {
        errorMessage = t('Insufficient balance for this payment');
      } else if (errorMessage === 'USER_REJECTED' ||
          errorMessage.toLowerCase().includes('user rejected')) {
        // Don't show toast for user rejection
        setLoading(false);
        return;
      } else if (errorMessage.toLowerCase().includes('invalid invoice')) {
        errorMessage = t('Invalid Lightning invoice');
      } else if (errorMessage.toLowerCase().includes('expired')) {
        errorMessage = t('Invoice has expired');
      }

      dispatch(setToast({
        type: 2,
        desc: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!receiveAmount || parseInt(receiveAmount) <= 0) {
      dispatch(setToast({
        desc: t('Please enter a valid amount'),
        type: 2
      }));
      return;
    }

    try {
      setLoading(true);
      const response = await sparkService.receivePayment(
        parseInt(receiveAmount),
        receiveDescription || 'Yakihonne payment'
      );
      setGeneratedInvoice(response.paymentRequest);
      dispatch(setToast({
        desc: t('Invoice generated'),
        type: 1
      }));
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      dispatch(setToast({
        desc: error.message || t('Failed to generate invoice'),
        type: 2
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(generatedInvoice);
    dispatch(setToast({
      show: true,
      message: t('Invoice copied to clipboard'),
      type: 1
    }));
  };

  const handleCopyLightningAddress = () => {
    navigator.clipboard.writeText(sparkLightningAddress);
    dispatch(setToast({
      show: true,
      message: t('Lightning address copied'),
      type: 1
    }));
  };

  const handleCheckUsername = async () => {
    if (!lightningUsername.trim()) return;

    try {
      setCheckingUsername(true);
      const available = await sparkWalletManager.checkLightningAddressAvailable(lightningUsername);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Failed to check username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleRegisterLightningAddress = async () => {
    if (!lightningUsername.trim()) {
      dispatch(setToast({
        desc: t('Please enter a username'),
        type: 2
      }));
      return;
    }

    if (usernameAvailable === false) {
      dispatch(setToast({
        desc: t('Username not available'),
        type: 2
      }));
      return;
    }

    try {
      setLoading(true);
      await sparkWalletManager.registerLightningAddress(lightningUsername);
      dispatch(setToast({
        desc: t('Lightning address registered'),
        type: 1
      }));
      setLightningUsername('');
      setUsernameAvailable(null);
    } catch (error) {
      console.error('Failed to register Lightning address:', error);
      dispatch(setToast({
        desc: error.message || t('Failed to register Lightning address'),
        type: 2
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLightningAddress = async () => {
    if (!confirm(t('Are you sure you want to delete your Lightning address?'))) {
      return;
    }

    try {
      setLoading(true);
      await sparkWalletManager.deleteLightningAddress();
      dispatch(setToast({
        desc: t('Lightning address deleted'),
        type: 1
      }));
    } catch (error) {
      console.error('Failed to delete Lightning address:', error);
      dispatch(setToast({
        desc: error.message || t('Failed to delete Lightning address'),
        type: 2
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      await sparkWalletManager.downloadBackup();
      dispatch(setToast({
        desc: t('Backup downloaded'),
        type: 1
      }));
    } catch (error) {
      console.error('Failed to download backup:', error);
      dispatch(setToast({
        desc: error.message || t('Failed to download backup'),
        type: 2
      }));
    }
  };

  const handleRevealSeedPhrase = async () => {
    if (showSeedPhrase) {
      // Hide seed phrase
      setShowSeedPhrase(false);
      setSeedPhrase('');
      return;
    }

    try {
      setLoadingSeedPhrase(true);
      const pubkey = sparkWalletManager.getUserPubkey();
      const mnemonic = await sparkStorage.loadMnemonic(pubkey);

      if (!mnemonic) {
        throw new Error('No seed phrase found');
      }

      setSeedPhrase(mnemonic);
      setShowSeedPhrase(true);
    } catch (error) {
      console.error('Failed to load seed phrase:', error);
      dispatch(setToast({
        desc: error.message || t('Failed to load seed phrase'),
        type: 2
      }));
    } finally {
      setLoadingSeedPhrase(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!confirm(t('Are you sure you want to delete your wallet? This cannot be undone. Make sure you have backed up your seed phrase.'))) {
      return;
    }

    try {
      setLoading(true);
      await sparkWalletManager.deleteWallet(true); // true = delete Nostr backups too

      dispatch(setToast({
        type: 1,
        desc: t('Wallet deleted successfully'),
      }));

      // Close modal if onClose is provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      dispatch(setToast({
        type: 2,
        desc: error.message || t('Failed to delete wallet'),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopySeedPhrase = () => {
    navigator.clipboard.writeText(seedPhrase);
    dispatch(setToast({
      show: true,
      message: t('Seed phrase copied to clipboard'),
      type: 1
    }));
  };

  const formatSats = (sats) => {
    if (!sats && sats !== 0) return '0';
    return new Intl.NumberFormat('en-US').format(sats);
  };

  const getTimeSinceSync = () => {
    if (!sparkLastSync) return t('Never');
    const seconds = Math.floor((Date.now() - sparkLastSync) / 1000);
    if (seconds < 60) return t('Just now');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const tabs = [
    { id: 'send', label: t('Send'), icon: '⚡' },
    { id: 'receive', label: t('Receive'), icon: '📥' },
    { id: 'transactions', label: t('Transactions'), icon: '📋' },
    { id: 'settings', label: t('Settings'), icon: '⚙️' }
  ];

  // Show loading state while wallet is connecting
  if (sparkConnecting) {
    return (
      <div className="fx-centered fit-container fx-col box-pad-h box-pad-v">
        <LoadingDots />
        <p className="gray-c" style={{ marginTop: '1rem' }}>{t('Connecting wallet...')}</p>
      </div>
    );
  }

  // Show not connected message only if wallet is truly not connected (not in connecting state)
  if (!sparkConnected) {
    return (
      <div className="fx-centered fit-container fx-col box-pad-h box-pad-v">
        <p className="gray-c">{t('Wallet not connected')}</p>
      </div>
    );
  }

  return (
    <div className="fx-centered fit-container fx-col">
      <div className="fit-container fx-centered fx-col" style={{ maxWidth: '800px', width: '100%' }}>
        {/* Header with Balance and Tabs - Only show in standalone mode */}
        {!inlineMode && (
          <>
            {/* Header with Balance */}
            <div className="fit-container fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--16)', marginBottom: 'var(--24)' }}>
              <div className="fx-scattered fit-container">
                <div className="fx-centered fx-col fx-start-h">
                  <p className="gray-c p-medium">{t('Balance')}</p>
                  <div className="fx-centered" style={{ gap: 'var(--16)' }}>
                    <h2 className="orange-c">{formatSats(sparkBalance)} sats</h2>
                    <button
                      className="btn btn-small btn-gray"
                      onClick={refreshWallet}
                      disabled={syncing}
                      style={{ minWidth: 'auto', padding: '8px 12px' }}
                    >
                      {syncing ? <LoadingDots /> : '🔄'}
                    </button>
                  </div>
                  <p className="gray-c p-small">{t('Last sync')}: {getTimeSinceSync()}</p>
                </div>

                {onClose && (
                  <button className="btn btn-small btn-gray" onClick={onClose}>
                    {t('Close')}
                  </button>
                )}
              </div>

              {sparkLightningAddress && (
                <div
                  className="fit-container fx-scattered pointer option box-pad-h-s box-pad-v-s"
                  onClick={handleCopyLightningAddress}
                  style={{ borderRadius: 'var(--border-r-6)' }}
                >
                  <p className="p-medium">{sparkLightningAddress}</p>
                  <div className="copy-24"></div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="fx-centered fit-container" style={{ gap: 'var(--16)', marginBottom: 'var(--24)', flexWrap: 'wrap' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`btn btn-small ${activeTab === tab.id ? 'btn-orange' : 'btn-gray'}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ minWidth: '120px' }}
                >
                  <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Send Tab */}
        {activeTab === 'send' && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            <div className="fit-container fx-scattered">
              <h4>{t('Send')}</h4>
              <div
                className="close"
                style={{ position: 'static' }}
                onClick={() => setActiveTab(inlineMode ? '' : 'transactions')}
              >
                <div></div>
              </div>
            </div>

            <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)' }}>
              {/* Use invoice toggle */}
              <div className="fx-scattered fit-container if pointer" onClick={() => setUseInvoice(!useInvoice)}>
                <p>{t('Use invoice')}</p>
                <div className={`toggle ${!useInvoice ? 'toggle-dim-gray' : ''} ${useInvoice ? 'toggle-c1' : 'toggle-dim-gray'}`}></div>
              </div>

              <input
                type="text"
                className="if ifs-full"
                placeholder={useInvoice ? t('Lightning invoice') : t('Lightning address')}
                value={sendInput}
                onChange={(e) => setSendInput(e.target.value)}
                disabled={loading}
              />

              {!useInvoice && (
                <input
                  type="number"
                  className="if ifs-full"
                  placeholder="0"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  disabled={loading}
                />
              )}

              <button
                className="btn btn-orange fit-container"
                onClick={handleSendPayment}
                disabled={loading || !sendInput.trim()}
              >
                {loading ? <LoadingDots /> : t('Send')}
              </button>
            </div>
          </div>
        )}

        {/* Receive Tab */}
        {activeTab === 'receive' && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            <div className="fit-container fx-scattered">
              <h4>{t('Generate invoice')}</h4>
              <div
                className="close"
                style={{ position: 'static' }}
                onClick={() => setActiveTab(inlineMode ? '' : 'transactions')}
              >
                <div></div>
              </div>
            </div>

            {!generatedInvoice ? (
              <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)' }}>
                <input
                  type="text"
                  className="if ifs-full"
                  placeholder={t('Message (optional)')}
                  value={receiveDescription}
                  onChange={(e) => setReceiveDescription(e.target.value)}
                  disabled={loading}
                />

                <input
                  type="number"
                  className="if ifs-full"
                  placeholder="0"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  disabled={loading}
                />

                <button
                  className="btn btn-orange fit-container"
                  onClick={handleGenerateInvoice}
                  disabled={loading || !receiveAmount}
                >
                  {loading ? <LoadingDots /> : t('Generate invoice')}
                </button>
              </div>
            ) : (
              <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--24)' }}>
                <div
                  className="fx-centered fit-container box-pad-h box-pad-v"
                  style={{ backgroundColor: 'white', borderRadius: 'var(--border-r-18)' }}
                >
                  <QRCode value={generatedInvoice} size={256} />
                </div>

                <div className="fx-centered fit-container">
                  <div
                    className="fx-scattered if pointer dashed-onH fit-container"
                    style={{ borderStyle: 'dashed' }}
                    onClick={handleCopyInvoice}
                  >
                    <p>{shortenKey(generatedInvoice)}</p>
                    <div className="copy-24"></div>
                  </div>
                  <button
                    className="btn btn-normal"
                    onClick={() => {
                      setGeneratedInvoice('');
                      setReceiveAmount('');
                      setReceiveDescription('');
                    }}
                  >
                    {t('Exit')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {(activeTab === 'transactions' || activeTab === '') && (
          <div className="fit-container">
            <SparkPaymentsList />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            {/* Settings Header */}
            <div className="fit-container fx-scattered">
              <h4>{t('Settings')}</h4>
              <div
                className="close"
                style={{ position: 'static' }}
                onClick={() => setActiveTab(inlineMode ? '' : 'transactions')}
              >
                <div></div>
              </div>
            </div>

            {/* Lightning Address Section */}
            <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)', paddingTop: 'var(--8)' }}>
              <h5 className="fit-container">{t('Lightning Address')}</h5>

              {sparkLightningAddress ? (
                <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)' }}>
                  <div className="fx-centered fx-col">
                    <p className="gray-c p-medium">{t('Your Lightning address')}</p>
                    <p className="p-bold orange-c">{sparkLightningAddress}</p>
                  </div>
                  <button
                    className="btn btn-gray fit-container"
                    onClick={handleDeleteLightningAddress}
                    disabled={loading}
                  >
                    {loading ? <LoadingDots /> : t('Delete Address')}
                  </button>
                </div>
              ) : (
                <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)' }}>
                  <div className="fx-centered fit-container" style={{ gap: 'var(--16)' }}>
                    <input
                      type="text"
                      className="if fx"
                      placeholder={t('username')}
                      value={lightningUsername}
                      onChange={(e) => {
                        setLightningUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                        setUsernameAvailable(null);
                      }}
                      onBlur={handleCheckUsername}
                      disabled={loading || checkingUsername}
                      style={{ flex: 1 }}
                    />
                    <span className="gray-c p-medium">@breez.tips</span>
                  </div>

                  {usernameAvailable !== null && (
                    <p className={`p-small ${usernameAvailable ? 'green-c' : 'red-c'}`}>
                      {usernameAvailable ? t('Username available') : t('Username not available')}
                    </p>
                  )}

                  <button
                    className="btn btn-orange fit-container"
                    onClick={handleRegisterLightningAddress}
                    disabled={loading || checkingUsername || !lightningUsername || usernameAvailable === false}
                  >
                    {loading ? <LoadingDots /> : t('Register Address')}
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="fit-container" style={{ height: '1px', backgroundColor: 'var(--pale-gray)' }}></div>

            {/* Wallet Recovery Section */}
            <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)', paddingBottom: 'var(--8)' }}>
              <h5 className="fit-container">{t('Wallet Recovery')}</h5>

              <div className="fx-centered fit-container" style={{ gap: 'var(--24)' }}>
                <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
                  <p className="gray-c p-medium p-centered">
                    {t('Your encrypted backup is tied to your Nostr account. You can only decrypt it when signed in with this account.')}
                  </p>
                  <button
                    className="btn btn-gray"
                    onClick={handleDownloadBackup}
                  >
                    {t('Download Backup')}
                  </button>
                </div>

                <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
                  <p className="gray-c p-medium p-centered">
                    {t('Never share your seed phrase with anyone. Anyone with access to your seed phrase can steal your funds.')}
                  </p>
                  <button
                    className="btn btn-gray"
                    onClick={handleRevealSeedPhrase}
                    disabled={loadingSeedPhrase}
                  >
                    {loadingSeedPhrase ? (
                      <LoadingDots />
                    ) : showSeedPhrase ? (
                      t('Hide Seed Phrase')
                    ) : (
                      t('Reveal Seed Phrase')
                    )}
                  </button>
                </div>
              </div>

              {showSeedPhrase && seedPhrase && (
                <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)' }}>
                  <div
                    className="fit-container box-pad-h box-pad-v"
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--border-r-6)',
                      border: '2px dashed var(--pale-gray)'
                    }}
                  >
                    <p
                      className="p-medium p-centered"
                      style={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-word',
                        lineHeight: '1.8'
                      }}
                    >
                      {seedPhrase}
                    </p>
                  </div>
                  <button
                    className="btn btn-gray fit-container"
                    onClick={handleCopySeedPhrase}
                  >
                    {t('Copy Seed Phrase')}
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="fit-container" style={{ height: '1px', backgroundColor: 'var(--pale-gray)' }}></div>

            {/* Danger Zone - Delete Wallet */}
            <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)', paddingBottom: 'var(--8)' }}>
              <h5 className="fit-container red-c">{t('Danger Zone')}</h5>
              <p className="gray-c p-medium p-centered">
                {t('Deleting your wallet will remove all local data. Make sure you have backed up your seed phrase before proceeding. This action cannot be undone.')}
              </p>
              <button
                className="btn btn-danger fit-container"
                onClick={handleDeleteWallet}
                disabled={loading}
                style={{
                  backgroundColor: 'var(--red-main)',
                  color: 'white'
                }}
              >
                {loading ? <LoadingDots /> : t('Delete Wallet')}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
