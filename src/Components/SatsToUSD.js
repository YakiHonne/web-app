import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingDots from "@/Components/LoadingDots";

const SatsToUSD = ({ sats, isHidden }) => {
  const [usdRate, setUsdRate] = useState(null);
  const [usdValue, setUsdValue] = useState(null);

  useEffect(() => {
    const fetchBtcToUsdRate = async () => {
      try {
        const response = await axios.get( 
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        setUsdRate(response.data.bitcoin.usd);
      } catch (error) {
        console.error("Error fetching BTC to USD rate:", error);
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

  if (!usdValue) return;
  return (
    <div>
      {usdValue !== null ? (
        <div>
          <span className="gray-c p-medium">USD</span>
          <p style={{minWidth: "max-content"}}>
            ${!isHidden ? usdValue.toFixed(2) : "***"}~{" "}
          </p>
        </div>
      ) : (
        <LoadingDots />
      )}
    </div>
  );
};

export default SatsToUSD;
