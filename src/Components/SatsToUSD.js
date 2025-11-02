import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import LoadingDots from "@/Components/LoadingDots";
import useCloseContainer from "@/Hooks/useCloseContainer";
import { currencies, currenciesSymbols } from "@/Content/currencies";
import useCustomizationSettings from "@/Hooks/useCustomizationSettings";
import { updateCustomSettings } from "@/Helpers/ClientHelpers";

const SatsToUSD = ({ sats, isHidden, selector }) => {
  const [fiatRate, setFiatRate] = useState(null);
  const [fiatValue, setFiatValue] = useState(null);
  const userSettings = useCustomizationSettings();
  const currency = useMemo(() => {
    return userSettings.currency;
  }, [userSettings.currency]);

  useEffect(() => {
    const fetchBtcToUsdRate = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}`
        );
        setFiatRate(response.data.bitcoin[currency]);
      } catch (error) {
        console.error("Error fetching BTC to USD rate:", error);
      }
    };

    fetchBtcToUsdRate();
  }, [currency]);

  useEffect(() => {
    if (fiatRate !== null) {
      const btcValue = sats / 100000000;
      const fiatValue = btcValue * fiatRate;
      setFiatValue(fiatValue);
    }
  }, [fiatRate, sats]);

  const handleChangeCurrency = (currency) => {
    setFiatValue(null);
    updateCustomSettings({ ...userSettings, currency });
  };

  if (!fiatValue) return;
  if (selector) {
    return (
      <div>
        {fiatValue !== null ? (
          <FiatSelector
            isHidden={isHidden}
            fiatValue={fiatValue}
            currency={currency}
            setCurrency={handleChangeCurrency}
          />
        ) : (
          <LoadingDots />
        )}
      </div>
    );
  }
  return (
    <div>
      {fiatValue !== null ? (
        <div>
          <span className="gray-c p-medium">{currency.toUpperCase()}</span>
          <p style={{ minWidth: "max-content" }}>
            {currenciesSymbols[currency]}
            {!isHidden ? fiatValue.toFixed(2) : "***"}
          </p>
        </div>
      ) : (
        <LoadingDots />
      )}
    </div>
  );
};

const FiatSelector = ({ isHidden, fiatValue, currency, setCurrency }) => {
  const { containerRef, setOpen, open } = useCloseContainer();

  return (
    <div
      ref={containerRef}
      onClick={() => setOpen(!open)}
      style={{ position: "relative" }}
    >
      <div
        className="fx-centered box-pad-h-s box-pad-v-s option-no-scale"
        style={{ gap: "4px" }}
      >
        <p className="p-big" style={{ minWidth: "max-content" }}>
          {currenciesSymbols[currency]}
          {!isHidden ? fiatValue.toFixed(2) : "***"}
        </p>
        <span className="gray-c p-caps">{currency?.toUpperCase()}</span>
        <div className="arrow-12"></div>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: "50%",
            width: "150px",
            zIndex: 1000,
            rowGap: "0",
            maxHeight: "300px",
            transform: "translate(-50%, 0)",
            overflow: "scroll",
          }}
          className="sc-s-18 fx-centered fx-col fx-start-v fx-start-h pointer box-pad-v-s box-pad-h-s bg-sp"
        >
          {currencies.map((option, index) => {
            return (
              <div
                key={index}
                className={`option-no-scale fit-container fx-scattered fx-start-h pointer box-pad-h-m`}
                style={{
                  border: "none",
                  overflow: "visible",
                  padding: ".5rem",
                }}
                onClick={() => {
                  setCurrency(option[0]);
                  setOpen(false);
                }}
              >
                <p>{option[1] + " " + option[0]?.toUpperCase()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SatsToUSD;
