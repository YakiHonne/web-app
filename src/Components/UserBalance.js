import React, { useEffect, useState } from "react";
import SatsToUSD from "@/Components/SatsToUSD";
import Link from "next/link";
import axios from "axios";
import { webln } from "@getalby/sdk";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { useDispatch, useSelector } from "react-redux";
import { setUserBalance } from "@/Store/Slides/UserData";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import NumberShrink from "@/Components/NumberShrink";
import { localStorage_ } from "@/Helpers/utils";

export default function UserBalance() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userBalance = useSelector((state) => state.userBalance);
  const sparkBalance = useSelector((state) => state.sparkBalance);
  const sparkConnected = useSelector((state) => state.sparkConnected);
  const [wallets, setWallets] = useState(getWallets());
  const [selectedWallet, setSelectedWallet] = useState(
    wallets.find((wallet) => wallet && wallet.active)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(
    localStorage_.getItem("isSatsHidden")
      ? localStorage_.getItem("isSatsHidden")
      : ""
  );
  useEffect(() => {
    if (["/wallet"].includes(window.location.pathname)) return;
    if (!userKeys) return;

    // Get current wallets
    let tempWallets = getWallets();

    // Fix: If Spark wallet is connected but not in wallets list, add it
    if (sparkConnected && !tempWallets.find(w => w.kind === 4) && userKeys.pub) {
      const sparkWallet = {
        id: Date.now(),
        kind: 4,
        entitle: 'Spark Wallet',
        active: true,
        data: 'spark-self-custodial'
      };
      tempWallets = tempWallets.map(w => ({ ...w, active: false }));
      tempWallets.push(sparkWallet);
      updateWallets(tempWallets);
    }

    if (userKeys && (userKeys?.ext || userKeys?.sec || userKeys?.bunker)) {
      setWallets(tempWallets);
      let selectedWallet_ = tempWallets.find((wallet) => wallet && wallet.active);
      setSelectedWallet(selectedWallet_);
      if (selectedWallet_) {
        if (selectedWallet_.kind === 1) {
          getBalancWebLN();
        }
        if (selectedWallet_.kind === 2) {
          getAlbyData(selectedWallet_);
        }
        if (selectedWallet_.kind === 3) {
          getNWCData(selectedWallet_);
        }
        // Kind 4 (Spark) is handled by SparkWalletManager
      } else {
        setWallets([]);
        setSelectedWallet(false);
        dispatch(setUserBalance("N/A"));
      }
    } else if (userKeys.pub && tempWallets.length > 0) {
      // User has pub key and wallets (e.g., Spark wallet)
      setWallets(tempWallets);
      let selectedWallet_ = tempWallets.find((wallet) => wallet && wallet.active);
      setSelectedWallet(selectedWallet_);
    } else {
      dispatch(setUserBalance("N/A"));
    }
  }, [userKeys, sparkConnected, sparkBalance]);

  useEffect(() => {
    if (!window.location.pathname.includes("users")) {
      let tempWallets = getWallets();
      setWallets(tempWallets);
      setSelectedWallet(tempWallets.find((wallet) => wallet && wallet.active));
    }
  }, []);

  const getBalancWebLN = async () => {
    try {
      setIsLoading(true);
      await window.webln.enable();
      let data = await window.webln.getBalance();

      localStorage_.setItem("wallet-userBalance", `${data.balance}`);

      dispatch(setUserBalance(data.balance));
      setIsLoading(false);
    } catch (err) {
      console.warn('[UserBalance] WebLN balance fetch failed (handled):', err);
      setIsLoading(false);
    }
  };
  const getAlbyData = async (activeWallet) => {
    try {
      setIsLoading(true);
      let checkTokens = await checkAlbyToken(wallets, activeWallet);
      let b = await getBalanceAlbyAPI(
        checkTokens.activeWallet.data.access_token
      );
      setWallets(checkTokens.wallets);
      dispatch(setUserBalance(b));
      setIsLoading(false);
    } catch (err) {
      console.warn('[UserBalance] Alby data fetch failed (handled):', err);
      setIsLoading(false);
    }
  };
  const getBalanceAlbyAPI = async (code) => {
    try {
      const data = await axios.get("https://api.getalby.com/balance", {
        headers: {
          Authorization: `Bearer ${code}`,
        },
      });
      return data.data.balance;
    } catch (err) {
      console.warn('[UserBalance] Alby balance API failed (handled):', err);
      return 0;
    }
  };
  const getNWCData = async (activeWallet) => {
    try {
      setIsLoading(true);
      const nwc = new webln.NWC({ nostrWalletConnectUrl: activeWallet.data });
      await nwc.enable();
      const userBalanceResponse = await nwc.getBalance();

      dispatch(setUserBalance(userBalanceResponse.balance));
      setIsLoading(false);
    } catch (err) {
      console.warn('[UserBalance] NWC data fetch failed (handled):', err);
      setIsLoading(false);
    }
  };
  const handleSatsDisplay = (e) => {
    e.stopPropagation();
    if (isHidden) {
      setIsHidden("");
      localStorage_.removeItem("isSatsHidden");
      return;
    }
    let ts = Date.now().toString();
    setIsHidden(ts);
    localStorage_.setItem("isSatsHidden", ts);
  };

  // Show balance widget if user has appropriate keys or has a wallet
  const hasValidKeys = userKeys && (userKeys?.ext || userKeys?.sec || userKeys?.bunker);
  const hasWalletsWithPubkey = userKeys?.pub && wallets.length > 0;

  if (!(hasValidKeys || hasWalletsWithPubkey))
    return;
  if (userKeys?.sec && userBalance == "N/A" && wallets.length === 0)
    return (
      <Link
        className="fit-container fx-centered fx-start-h box-pad-h-m userBalance-container mb-hide"
        style={{ borderLeft: "2px solid var(--orange-main)", margin: ".75rem" }}
        href={"/wallet"}
      >
        <div
          className="wallet-add"
          style={{ width: "32px", height: "32px" }}
        ></div>
        <p>{t("A8fEwNq")}</p>
      </Link>
    );
  // Determine which balance to display based on wallet type
  const displayBalance = selectedWallet?.kind === 4
    ? (sparkBalance !== null ? sparkBalance : 'N/A')
    : userBalance;

  // Don't show balance if Spark wallet is selected but not connected yet
  const shouldHideBalance = selectedWallet?.kind === 4 && !sparkConnected;

  return (
    <>
      {/* Desktop wallet display */}
      <div
        className="fit-container fx-scattered box-pad-h-s userBalance-container mb-hide pointer"
        style={{ borderLeft: "2px solid var(--orange-main)", margin: ".75rem" }}
        onClick={(e) => {
          e.stopPropagation();
          customHistory("/wallet");
        }}
      >
        {!shouldHideBalance && (
          <div
            className="fx-centered fx-start-h"
            style={{ rowGap: 0, flex: 1, minWidth: 0, overflow: 'hidden' }}
          >
            <div style={{ flexShrink: 0 }}>
              <p className="gray-c p-medium">Sats</p>
              {!isHidden && (
                <h4 style={{ minWidth: "max-content" }}>
                  <NumberShrink value={displayBalance} />
                </h4>
              )}
              {isHidden && <h4>***</h4>}
            </div>
            <p className="gray-c" style={{ flexShrink: 0, padding: '0 0.5rem' }}>&#8596;</p>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <SatsToUSD sats={displayBalance} isHidden={isHidden} />
            </div>
          </div>
        )}
        {!shouldHideBalance && (
          <div style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
            {!isHidden && (
              <div className="eye-closed-24" onClick={handleSatsDisplay}></div>
            )}
            {isHidden && (
              <div className="eye-opened-24" onClick={handleSatsDisplay}></div>
            )}
          </div>
        )}
      </div>

      {/* Mobile wallet icon */}
      <Link
        className="mb-show fx-centered box-pad-h-s pointer"
        style={{
          borderLeft: "2px solid var(--orange-main)",
          margin: ".75rem"
        }}
        href={"/wallet"}
      >
        <div className="wallet-24"></div>
      </Link>
    </>
  );
}

const checkAlbyToken = async (wallets, activeWallet) => {
  let tokenExpiry = activeWallet.data.created_at + activeWallet.data.expires_in;
  let currentTime = Math.floor(Date.now() / 1000);
  if (tokenExpiry > currentTime)
    return {
      wallets,
      activeWallet,
    };
  try {
    let fd = new FormData();
    fd.append("refresh_token", activeWallet.data.refresh_token);
    fd.append("grant_type", "refresh_token");
    const access_token = await axios.post(
      "https://api.getalby.com/oauth/token",
      fd,
      {
        auth: {
          username: process.env.NEXT_PUBLIC_ALBY_CLIENT_ID,
          password: process.env.NEXT_PUBLIC_ALBY_SECRET_ID,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    let tempWallet = { ...activeWallet };
    tempWallet.data = {
      ...access_token.data,
      created_at: Math.floor(Date.now() / 1000),
    };
    let tempWallets = Array.from(wallets);
    let index = wallets.findIndex((item) => item.id === activeWallet.id);
    tempWallets[index] = tempWallet;
    updateWallets(tempWallets);
    return {
      wallets: tempWallets,
      activeWallet: tempWallet,
    };
  } catch (err) {
    console.warn('[UserBalance] Alby token refresh failed (handled):', err);
    return {
      wallets,
      activeWallet,
    };
  }
};
