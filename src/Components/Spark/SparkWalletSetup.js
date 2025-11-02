'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import sparkWalletManager from '@/Helpers/Spark/spark-wallet-manager';
import { setToast } from '@/Store/Slides/Publishers';
import LoadingDots from '@/Components/LoadingDots';
import sparkBackup from '@/Helpers/Spark/spark-backup.service';

export default function SparkWalletSetup({ onComplete, onCancel, isOnboarding = false }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const sparkLightningAddress = useSelector((state) => state.sparkLightningAddress);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [backupFile, setBackupFile] = useState(null);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [saveToNostr, setSaveToNostr] = useState(true);

  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      const { mnemonic } = await sparkWalletManager.createWallet(saveToNostr);
      setGeneratedMnemonic(mnemonic);
      setShowMnemonic(true);
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

  const handleRestoreFromNostr = async () => {
    try {
      setLoading(true);
      await sparkWalletManager.restoreWallet();
      dispatch(setToast({
        show: true,
        message: t('Wallet restored from Nostr'),
        type: 'success'
      }));
      if (onComplete) onComplete(sparkLightningAddress);
    } catch (error) {
      console.error('Failed to restore from Nostr:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('No backup found on Nostr'),
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
      await sparkWalletManager.restoreFromFile(backupFile);
      dispatch(setToast({
        show: true,
        message: t('Wallet restored from file'),
        type: 'success'
      }));
      if (onComplete) onComplete(sparkLightningAddress);
    } catch (error) {
      console.error('Failed to restore from file:', error);
      dispatch(setToast({
        show: true,
        message: error.message || t('Failed to restore from file'),
        type: 'error'
      }));
    } finally {
      setLoading(false);
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
      await sparkWalletManager.restoreFromSeed(seedPhrase, true);
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

  const tabs = [
    { id: 'create', label: t('Create New') },
    { id: 'nostr', label: t('Restore from Nostr') },
    { id: 'file', label: t('Restore from File') },
    { id: 'seed', label: t('Enter Seed Phrase') }
  ];

  return (
    <div className="fx-centered fit-container fx-col box-pad-h box-pad-v">
      <div className="fx-centered fx-col" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ marginBottom: 'var(--16)' }}>Spark Wallet Setup</h2>
        <p className="gray-c p-centered box-pad-h" style={{ marginBottom: 'var(--24)' }}>
          {t('Set up your self-custodial Lightning wallet')}
        </p>

        {/* Tabs */}
        <div className="fx-centered fit-container" style={{ gap: 'var(--16)', marginBottom: 'var(--32)', flexWrap: 'wrap' }}>
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
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create New Wallet */}
        {activeTab === 'create' && !showMnemonic && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
              <div className="fx-centered fx-col">
                <h4>{t('Create New Wallet')}</h4>
                <p className="gray-c p-centered p-medium box-pad-h" style={{ marginTop: 'var(--16)' }}>
                  {t('A new 12-word seed phrase will be generated. You must save it securely to recover your wallet.')}
                </p>
              </div>

              <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)', marginTop: 'var(--16)' }}>
                <label className="fx-centered pointer" style={{ gap: 'var(--16)' }}>
                  <input
                    type="checkbox"
                    checked={saveToNostr}
                    onChange={(e) => setSaveToNostr(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span className="p-medium">{t('Backup to Nostr (encrypted)')}</span>
                </label>
                <p className="gray-c p-small box-pad-h p-centered">
                  {t('Your seed will be encrypted with your Nostr keys and stored on relays for easy recovery.')}
                </p>
              </div>
            </div>

            <div className="fx-centered fit-container" style={{ gap: 'var(--16)' }}>
              {onCancel && (
                <button
                  className="btn btn-gray fx"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {t('Cancel')}
                </button>
              )}
              <button
                className="btn btn-orange fx"
                onClick={handleCreateWallet}
                disabled={loading}
              >
                {loading ? <LoadingDots /> : t('Create Wallet')}
              </button>
            </div>
          </div>
        )}

        {/* Show Generated Mnemonic */}
        {activeTab === 'create' && showMnemonic && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
              <h4>{t('Your Seed Phrase')}</h4>
              <p className="gray-c p-centered p-medium box-pad-h">
                {t('Write down these 12 words in order and store them securely. Anyone with access to these words can access your funds.')}
              </p>

              <div
                className="fit-container box-pad-h box-pad-v"
                style={{
                  backgroundColor: 'var(--c1-side)',
                  borderRadius: 'var(--border-r-18)',
                  border: '2px solid var(--orange-main)'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--16)',
                  width: '100%'
                }}>
                  {generatedMnemonic.split(' ').map((word, index) => (
                    <div
                      key={index}
                      className="fx-centered"
                      style={{
                        padding: 'var(--16)',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--border-r-6)'
                      }}
                    >
                      <span className="gray-c p-small" style={{ marginRight: '8px' }}>{index + 1}.</span>
                      <span className="p-bold">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fx-centered fit-container" style={{ gap: 'var(--16)', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-small btn-gray fx"
                  onClick={handleCopyMnemonic}
                >
                  <div className="copy-24"></div>
                  <span>{mnemonicCopied ? t('Copied!') : t('Copy')}</span>
                </button>
                <button
                  className="btn btn-small btn-gray fx"
                  onClick={handleDownloadBackup}
                >
                  <span>{t('Download Backup')}</span>
                </button>
              </div>

              {mnemonicCopied && (
                <div className="fx-centered fx-col" style={{ gap: 'var(--16)', marginTop: 'var(--16)' }}>
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
                    onClick={() => onComplete && onComplete(sparkLightningAddress)}
                  >
                    {t('I have saved my seed phrase')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Restore from Nostr */}
        {activeTab === 'nostr' && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
              <h4>{t('Restore from Nostr')}</h4>
              <p className="gray-c p-centered p-medium box-pad-h">
                {t('Automatically detect and restore your wallet backup from Nostr relays.')}
              </p>
            </div>

            <div className="fx-centered fit-container" style={{ gap: 'var(--16)' }}>
              {onCancel && (
                <button
                  className="btn btn-gray fx"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {t('Cancel')}
                </button>
              )}
              <button
                className="btn btn-orange fx"
                onClick={handleRestoreFromNostr}
                disabled={loading}
              >
                {loading ? <LoadingDots /> : t('Restore from Nostr')}
              </button>
            </div>
          </div>
        )}

        {/* Restore from File */}
        {activeTab === 'file' && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
              <h4>{t('Restore from File')}</h4>
              <p className="gray-c p-centered p-medium box-pad-h">
                {t('Upload your encrypted backup file to restore your wallet.')}
              </p>

              <label
                className="fit-container fx-centered fx-col pointer option box-pad-h box-pad-v"
                style={{
                  border: '2px dashed var(--pale-gray)',
                  borderRadius: 'var(--border-r-18)',
                  minHeight: '120px'
                }}
              >
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                <div className="fx-centered fx-col" style={{ gap: 'var(--16)' }}>
                  <div style={{ fontSize: '48px' }}>📁</div>
                  {backupFile ? (
                    <p className="p-bold">{backupFile.name}</p>
                  ) : (
                    <p className="gray-c">{t('Click to select backup file')}</p>
                  )}
                </div>
              </label>
            </div>

            <div className="fx-centered fit-container" style={{ gap: 'var(--16)' }}>
              {onCancel && (
                <button
                  className="btn btn-gray fx"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {t('Cancel')}
                </button>
              )}
              <button
                className="btn btn-orange fx"
                onClick={handleRestoreFromFile}
                disabled={loading || !backupFile}
              >
                {loading ? <LoadingDots /> : t('Restore from File')}
              </button>
            </div>
          </div>
        )}

        {/* Restore from Seed Phrase */}
        {activeTab === 'seed' && (
          <div className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h box-pad-v" style={{ gap: 'var(--24)' }}>
            <div className="fx-centered fx-col fit-container" style={{ gap: 'var(--16)' }}>
              <h4>{t('Enter Seed Phrase')}</h4>
              <p className="gray-c p-centered p-medium box-pad-h">
                {t('Enter your 12 or 24 word seed phrase to restore your wallet.')}
              </p>

              <textarea
                className="if ifs-full"
                placeholder={t('Enter your seed phrase (12 or 24 words)')}
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                rows={6}
                style={{
                  fontFamily: 'DM Sans',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
                disabled={loading}
              />

              <p className="gray-c p-small p-centered">
                {t('Word count')}: {seedPhrase.trim().split(/\s+/).filter(Boolean).length}
              </p>
            </div>

            <div className="fx-centered fit-container" style={{ gap: 'var(--16)' }}>
              {onCancel && (
                <button
                  className="btn btn-gray fx"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {t('Cancel')}
                </button>
              )}
              <button
                className="btn btn-orange fx"
                onClick={handleRestoreFromSeed}
                disabled={loading || !seedPhrase.trim()}
              >
                {loading ? <LoadingDots /> : t('Restore Wallet')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
