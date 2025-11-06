'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import sparkWalletManager from '@/Helpers/Spark/spark-wallet-manager';
import { setToast } from '@/Store/Slides/Publishers';
import LoadingDots from '@/Components/LoadingDots';
import sparkBackup from '@/Helpers/Spark/spark-backup.service';
import { shortenKey } from '@/Helpers/Encryptions';
import { nip19 } from 'nostr-tools';

export default function SparkWalletSetup({ onComplete, onCancel, isOnboarding = false, onboardingUserKeys = null }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reduxUserKeys = useSelector((state) => state.userKeys);
  const userKeys = isOnboarding && onboardingUserKeys ? onboardingUserKeys : reduxUserKeys;
  const userMetadata = useSelector((state) => state.userMetadata);
  const sparkLightningAddress = useSelector((state) => state.sparkLightningAddress);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [backupFile, setBackupFile] = useState(null);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [showSeedWords, setShowSeedWords] = useState(false);
  const [showLightningAddressPrompt, setShowLightningAddressPrompt] = useState(false);
  const [lightningUsername, setLightningUsername] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const handleCreateWallet = async () => {
    try {
      setLoading(true);

      // If onboarding with userKeys, temporarily set them in Redux so wallet manager can access
      if (isOnboarding && onboardingUserKeys && !reduxUserKeys) {
        const { setUserKeys } = await import('@/Store/Slides/UserData');
        dispatch(setUserKeys(onboardingUserKeys));
      }

      // Never save to Nostr relays - only use downloadable backups
      const { mnemonic } = await sparkWalletManager.createWallet(false);
      setGeneratedMnemonic(mnemonic);
      setShowMnemonic(true);
      setShowSeedWords(false); // Start with seed phrase hidden
      dispatch(setToast({
        show: true,
        message: t('Spark wallet created successfully'),
        type: 'success'
      }));
    } catch (error) {
      console.error('Failed to create wallet:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('Failed to create wallet'),
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromFile = async () => {
    if (!backupFile) {
      dispatch(setToast({
        show: true,
        message: t('Please select a backup file'),
        type: 'error'
      }));
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage(t('Reading backup file...'));

      // If onboarding with userKeys, temporarily set them in Redux so wallet manager can access
      if (isOnboarding && onboardingUserKeys && !reduxUserKeys) {
        const { setUserKeys } = await import('@/Store/Slides/UserData');
        dispatch(setUserKeys(onboardingUserKeys));
      }

      setLoadingMessage(t('Restoring your wallet...'));
      await new Promise(resolve => setTimeout(resolve, 100)); // Let UI update

      await sparkWalletManager.restoreFromFile(backupFile);

      setLoadingMessage(t('Syncing wallet...'));
      dispatch(setToast({
        show: true,
        message: t('Wallet restored from file'),
        type: 'success'
      }));
      if (onComplete) onComplete(sparkLightningAddress);
    } catch (error) {
      console.warn('Failed to restore from file (handled):', error);

      let errorMessage = error.message || t('Failed to restore from file');

      // Handle JSON parsing errors
      if (error.message?.includes('Unexpected token') || error.message?.includes('JSON')) {
        errorMessage = t('SparkBackupInvalidJson');
      }
      // Handle "wrong account" error with helpful details
      else if (error.message?.startsWith('WRONG_ACCOUNT:')) {
        const parts = error.message.split(':');
        const backupPubkey = parts[1];
        const currentPubkey = parts[2];

        // Convert hex pubkeys to npub format
        const backupNpub = nip19.npubEncode(backupPubkey);
        const currentNpub = nip19.npubEncode(currentPubkey);
        const backupShort = shortenKey(backupNpub, 8);
        const currentShort = shortenKey(currentNpub, 8);
        errorMessage = t('SparkBackupWrongAccount', {
          backupAccount: backupShort,
          currentAccount: currentShort
        });
      } else if (error.message?.includes('Invalid backup file format')) {
        errorMessage = t('SparkBackupInvalidFormat');
      } else if (error.message?.includes('Unsupported backup version')) {
        errorMessage = t('SparkBackupUnsupportedVersion');
      } else if (error.message?.includes('decrypt') || error.message?.includes('encryption')) {
        errorMessage = t('SparkBackupDecryptFailed');
      }

      dispatch(setToast({
        type: 2,
        desc: errorMessage
      }));
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleRestoreFromSeed = async () => {
    if (!seedPhrase.trim()) {
      dispatch(setToast({
        show: true,
        message: t('Please enter your seed phrase'),
        type: 'error'
      }));
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage(t('Validating seed phrase...'));

      // If onboarding with userKeys, temporarily set them in Redux so wallet manager can access
      if (isOnboarding && onboardingUserKeys && !reduxUserKeys) {
        const { setUserKeys } = await import('@/Store/Slides/UserData');
        dispatch(setUserKeys(onboardingUserKeys));
      }

      setLoadingMessage(t('Restoring your wallet...'));
      await new Promise(resolve => setTimeout(resolve, 100)); // Let UI update

      // Don't sync to Nostr during restore to avoid relay auth errors
      // Local backup is always saved, but Nostr sync can be done later from wallet settings
      await sparkWalletManager.restoreFromSeed(seedPhrase, false);

      setLoadingMessage(t('Syncing wallet...'));
      dispatch(setToast({
        show: true,
        message: t('Wallet restored successfully'),
        type: 'success'
      }));
      if (onComplete) onComplete(sparkLightningAddress);
    } catch (error) {
      console.error('Failed to restore from seed:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('Invalid seed phrase'),
        type: 'error'
      }));
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      await sparkBackup.downloadEncryptedBackup(userKeys.pub);
      dispatch(setToast({
        show: true,
        message: t('Backup downloaded successfully'),
        type: 'success'
      }));
      setMnemonicCopied(true);
    } catch (error) {
      console.error('Failed to download backup:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('Failed to download backup'),
        type: 'error'
      }));
    }
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(generatedMnemonic);
    setMnemonicCopied(true);
    dispatch(setToast({
      show: true,
      message: t('Seed phrase copied to clipboard'),
      type: 'success'
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackupFile(file);
    }
  };

  const handleCheckUsername = async () => {
    if (!lightningUsername || lightningUsername.length < 3) return;

    try {
      setCheckingUsername(true);
      const available = await sparkWalletManager.checkUsernameAvailability(lightningUsername);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Failed to check username:', error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleRegisterLightningAddress = async () => {
    if (!lightningUsername || usernameAvailable === false) return;

    try {
      setLoading(true);
      await sparkWalletManager.registerLightningAddress(lightningUsername);
      dispatch(setToast({
        show: true,
        message: t('Lightning address registered successfully!'),
        type: 'success'
      }));
      // Complete onboarding
      if (onComplete) onComplete(sparkLightningAddress || `${lightningUsername}@breez.tips`);
    } catch (error) {
      console.error('Failed to register lightning address:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('Failed to register lightning address'),
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLightningAddress = () => {
    if (onComplete) onComplete('Spark Wallet');
  };

  const handleContinueToLightningAddress = () => {
    setShowLightningAddressPrompt(true);
    setShowMnemonic(false);
  };

  const tabs = [
    { id: 'create', label: t('Create') },
    { id: 'file', label: t('From Backup File') },
    { id: 'seed', label: t('Seed Phrase') }
  ];

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && loadingMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            gap: 'var(--24)'
          }}
        >
          <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '4px solid var(--c1-side)',
              borderTop: '4px solid var(--orange-main)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h3 style={{ color: 'var(--text-main)', textAlign: 'center' }}>
              {loadingMessage}
            </h3>
            <p className="gray-c p-centered" style={{ maxWidth: '400px' }}>
              {t('This may take up to a minute. Please wait.')}
            </p>
          </div>
        </div>
      )}

      <div className="fx-centered fit-container fx-col box-pad-h box-pad-v">
        <div className="fx-centered fx-col" style={{ maxWidth: '600px', width: '100%' }}>
        <h4 style={{ marginBottom: showMnemonic ? 'var(--24)' : 'var(--16)' }}>Spark Wallet</h4>

        {/* Only show description and tabs when not showing mnemonic */}
        {!showMnemonic && (
          <>
            <p className="gray-c p-centered" style={{ marginBottom: 'var(--24)' }}>
              {t('Create or restore a wallet to send and receive zaps!')}
            </p>

            {/* Tabs */}
            <div className="fx-centered fit-container" style={{ gap: 'var(--12)', marginBottom: 'var(--24)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`btn btn-small ${activeTab === tab.id ? 'btn-orange' : 'btn-gray'}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMnemonic(false);
                    setMnemonicCopied(false);
                  }}
                  disabled={loading}
                  style={{ flex: 1, whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Create New Wallet */}
        {activeTab === 'create' && !showMnemonic && (
          <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--24)' }}>
            <button
              className="btn btn-orange fit-container"
              onClick={handleCreateWallet}
              disabled={loading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading ? <LoadingDots /> : t('Create Wallet')}
            </button>
          </div>
        )}

        {/* Show Generated Mnemonic */}
        {activeTab === 'create' && showMnemonic && (
          <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--24)' }}>
            <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
              <p className="gray-c p-centered p-medium">
                {t('Write down these 12 words in order and store them securely.')}
              </p>

              <div
                className="fit-container"
                style={{
                  backgroundColor: 'var(--c1-side)',
                  borderRadius: 'var(--border-r-18)',
                  border: '2px solid var(--orange-main)',
                  padding: 'var(--16)'
                }}
              >
                {showSeedWords ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--12)',
                    width: '100%'
                  }}>
                    {generatedMnemonic.split(' ').map((word, index) => (
                      <div
                        key={index}
                        className="fx-centered"
                        style={{
                          padding: 'var(--12)',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--border-r-6)'
                        }}
                      >
                        <span className="gray-c p-small" style={{ marginRight: '6px' }}>{index + 1}.</span>
                        <span className="p-medium">{word}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="fx-centered fx-col" style={{ minHeight: '200px', gap: 'var(--12)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <button
                      className="btn btn-gray btn-small"
                      onClick={() => setShowSeedWords(true)}
                    >
                      {t('Reveal Seed Phrase')}
                    </button>
                  </div>
                )}
              </div>

              {showSeedWords && (
                <div className="fx-centered fit-container" style={{ gap: 'var(--12)' }}>
                  <button
                    className="btn btn-small btn-gray fit-container"
                    onClick={handleCopyMnemonic}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {mnemonicCopied ? t('Copied!') : t('Copy Seed Phrase')}
                  </button>
                  {/* Only show Download Backup if user is logged in */}
                  {userKeys?.pub && (
                    <button
                      className="btn btn-small btn-gray fit-container"
                      onClick={handleDownloadBackup}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {t('Download Backup')}
                    </button>
                  )}
                </div>
              )}

              {mnemonicCopied && (
                <>
                  <div
                    className="fit-container box-pad-h-s box-pad-v-s"
                    style={{
                      backgroundColor: 'rgba(238, 119, 0, 0.1)',
                      borderRadius: 'var(--border-r-6)',
                      border: '1px solid var(--orange-main)'
                    }}
                  >
                    <p className="orange-c p-small p-centered">
                      {t('Make sure you have safely stored your seed phrase. You will need it to recover your wallet.')}
                    </p>
                  </div>
                  <button
                    className="btn btn-orange fit-container"
                    onClick={handleContinueToLightningAddress}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {t('Continue')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Lightning Address Registration Prompt */}
        {showLightningAddressPrompt && (
          <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--24)' }}>
            <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
              <h4>{t('Register Lightning Address')}</h4>
              <p className="gray-c p-centered p-medium">
                {t('Register a Lightning address to receive zaps. You can skip this and do it later from wallet settings.')}
              </p>

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

              {checkingUsername && (
                <p className="gray-c p-small">{t('Checking availability...')}</p>
              )}

              {usernameAvailable !== null && (
                <p className={`p-small ${usernameAvailable ? 'green-c' : 'red-c'}`}>
                  {usernameAvailable ? t('Username available') : t('Username not available')}
                </p>
              )}

              <div className="fx-centered fit-container" style={{ gap: 'var(--12)' }}>
                <button
                  className="btn btn-gray fit-container"
                  onClick={handleSkipLightningAddress}
                  disabled={loading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t('Skip for Now')}
                </button>
                <button
                  className="btn btn-orange fit-container"
                  onClick={handleRegisterLightningAddress}
                  disabled={loading || checkingUsername || !lightningUsername || usernameAvailable === false}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {loading ? <LoadingDots /> : t('Register Address')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore from File */}
        {activeTab === 'file' && (
          <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--24)' }}>
            <label
              className="fit-container fx-centered fx-col pointer"
              style={{
                border: '2px dashed var(--pale-gray)',
                borderRadius: 'var(--border-r-12)',
                padding: 'var(--32)',
                cursor: 'pointer'
              }}
            >
              <input
                type="file"
                accept=".json,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={loading}
              />
              <div className="fx-centered fx-col" style={{ gap: 'var(--12)' }}>
                <svg width="48" height="48" viewBox="0 0 75 69.81" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M62.14,7.77h-26.73l-2.38-2.96C30.57,1.75,26.91,0,22.99,0h-10.12C5.77,0,0,5.77,0,12.87v44.07c0,7.1,5.77,12.87,12.87,12.87h49.26c7.1,0,12.87-5.77,12.87-12.87V20.64c0-7.1-5.77-12.87-12.87-12.87h0ZM12.88,4.99h10.12c2.4,0,4.64,1.07,6.14,2.94l3.13,3.9c.47.59,1.19.94,1.95.94h27.93c4.34,0,7.87,3.53,7.87,7.87v2.8c-2.18-1.69-4.9-2.71-7.87-2.71H12.88c-2.97,0-5.69,1.02-7.87,2.71v-10.58c0-4.34,3.53-7.87,7.87-7.87h0ZM70.01,56.94c0,4.34-3.53,7.87-7.87,7.87H12.88c-4.34,0-7.87-3.53-7.87-7.87v-23.33c0-4.34,3.53-7.87,7.87-7.87h49.26c4.34,0,7.87,3.53,7.87,7.87v23.33h0Z" fill="currentColor"/>
                </svg>
                {backupFile ? (
                  <p className="p-medium">{backupFile.name}</p>
                ) : (
                  <p className="gray-c p-medium">{t('Click to select backup file')}</p>
                )}
              </div>
            </label>

            <button
              className="btn btn-orange fit-container"
              onClick={handleRestoreFromFile}
              disabled={loading || !backupFile}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading ? <LoadingDots /> : t('Restore from File')}
            </button>
          </div>
        )}

        {/* Restore from Seed Phrase */}
        {activeTab === 'seed' && (
          <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--24)' }}>
            <textarea
              className="if ifs-full"
              placeholder={t('Enter your seed phrase (12 words most common, 24 also supported)')}
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              rows={3}
              style={{
                fontFamily: 'DM Sans',
                resize: 'vertical',
                minHeight: '80px'
              }}
              disabled={loading}
            />

            <p className="gray-c p-small p-centered">
              {t('Word count')}: {seedPhrase.trim().split(/\s+/).filter(Boolean).length}
            </p>

            <button
              className="btn btn-orange fit-container"
              onClick={handleRestoreFromSeed}
              disabled={loading || !seedPhrase.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading ? <LoadingDots /> : t('Restore Wallet')}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
