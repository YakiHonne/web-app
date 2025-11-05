import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingDots from "@/Components/LoadingDots";

const SatsToUSD = ({ sats, isHidden }) => {
  const [usdRate, setUsdRate] = useState(null);
  const [usdValue, setUsdValue] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBtcToUsdRate = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
          {
            timeout: 5000, // 5 second timeout
          }
        );
        setUsdRate(response.data.bitcoin.usd);
        setError(false);
      } catch (error) {
        // Silently fail - USD conversion is a nice-to-have feature
        // Don't spam console with errors for network issues
        if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK') {
          console.warn("Could not fetch BTC to USD rate:", error.message);
        }
        setError(true);
      }
    };

    fetchBtcToUsdRate();
  }, []);

  useEffect(() => {
    if (usdRate !== null) {
      const btcValue = sats / 100000000;
      const usdValue = btcValue * usdRate;
      setUsdValue(usdValue);
    }
  }, [usdRate, sats]);

  // Don't render anything if there's an error or no value
  if (error || !usdValue) return null;

  return (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      {usdValue !== null ? (
        <div>
          <span className="gray-c p-medium">USD</span>
          <p style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            ${!isHidden ? usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "***"}~{" "}
          </p>
        </div>
      ) : (
        <LoadingDots />
      )}
    </div>
  );
};

export default SatsToUSD;
