'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import sparkWalletManager from '@/Helpers/Spark/spark-wallet-manager';

export default function SparkBalanceDisplay({ onClick, showUSD = true, compact = false }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sparkConnected = useSelector((state) => state.sparkConnected);
  const sparkBalance = useSelector((state) => state.sparkBalance);
  const sparkConnecting = useSelector((state) => state.sparkConnecting);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [usdRate, setUsdRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    if (sparkConnected && showUSD) {
      fetchBTCPrice();
    }
  }, [sparkConnected, showUSD]);

  const fetchBTCPrice = async () => {
    try {
      setLoadingRate(true);
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      setUsdRate(data.bitcoin.usd);
    } catch (error) {
      console.error('Failed to fetch BTC price:', error);
    } finally {
      setLoadingRate(false);
    }
  };

  const formatSats = (sats) => {
    if (!sats && sats !== 0) return '0';
    return new Intl.NumberFormat('en-US').format(sats);
  };

  const calculateUSD = () => {
    if (!sparkBalance || !usdRate) return null;
    const btc = sparkBalance / 100000000;
    const usd = btc * usdRate;
    return usd.toFixed(2);
  };

  const toggleBalanceVisibility = (e) => {
    e.stopPropagation();
    setBalanceVisible(!balanceVisible);
  };

  if (!sparkConnected && !sparkConnecting) {
    return null;
  }

  if (sparkConnecting) {
    return (
      <div
        className="fx-centered sc-s bg-sp box-pad-h-s box-pad-v-s pointer option"
        onClick={onClick}
        style={{ gap: 'var(--16)', minWidth: compact ? 'auto' : '200px' }}
      >
        <div className="fx-centered" style={{ gap: '8px' }}>
          <div style={{ fontSize: '20px' }}>⚡</div>
          <p className="gray-c p-medium">{t('Connecting...')}</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className="fx-centered sc-s bg-sp box-pad-h-s box-pad-v-s pointer option"
        onClick={onClick}
        style={{ gap: '8px' }}
      >
        <div style={{ fontSize: '20px' }}>⚡</div>
        <div className="fx-centered fx-col fx-start-h">
          {balanceVisible ? (
            <>
              <p className="p-bold orange-c">{formatSats(sparkBalance)}</p>
              <p className="gray-c p-small">sats</p>
            </>
          ) : (
            <p className="p-bold">••••••</p>
          )}
        </div>
        <button
          className="btn btn-small"
          onClick={toggleBalanceVisibility}
          style={{
            minWidth: 'auto',
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          {balanceVisible ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
    );
  }

  return (
    <div
      className="fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v pointer option"
      onClick={onClick}
      style={{ gap: 'var(--16)', minWidth: '220px' }}
    >
      <div className="fx-scattered fit-container">
        <div className="fx-centered" style={{ gap: '8px' }}>
          <div style={{ fontSize: '24px' }}>⚡</div>
          <p className="gray-c p-medium">{t('Spark Wallet')}</p>
        </div>
        <button
          className="btn btn-small"
          onClick={toggleBalanceVisibility}
          style={{
            minWidth: 'auto',
            padding: '4px 8px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          {balanceVisible ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      <div className="fx-centered fx-col fit-container">
        {balanceVisible ? (
          <>
            <div className="fx-centered" style={{ gap: '8px' }}>
              <h3 className="orange-c">{formatSats(sparkBalance)}</h3>
              <p className="gray-c">sats</p>
            </div>
            {showUSD && usdRate && calculateUSD() && (
              <p className="gray-c p-small">
                ≈ ${calculateUSD()} USD
              </p>
            )}
          </>
        ) : (
          <div className="fx-centered fx-col">
            <h3>••••••••</h3>
            <p className="gray-c p-small">{t('Balance hidden')}</p>
          </div>
        )}
      </div>

      <div className="fit-container fx-centered" style={{ gap: '8px' }}>
        <div
          className="fx-centered"
          style={{
            padding: '4px 12px',
            backgroundColor: 'rgba(238, 119, 0, 0.1)',
            borderRadius: 'var(--border-r-6)'
          }}
        >
          <p className="orange-c p-small p-bold">{t('Click to manage')}</p>
        </div>
      </div>
    </div>
  );
}
