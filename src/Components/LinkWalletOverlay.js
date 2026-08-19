import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Overlay from "@/Components/Overlay";
import Icon from "@/Components/Icon";
import AddWallet from "@/Components/AddWallet";
import { getWallets } from "@/Helpers/ClientHelpers";

const WALLET_ICON = {
  2: "alby-logo",
  3: "nwc-logo",
};

export default function LinkWalletOverlay({ currentLud16, onUse, exit }) {
  const { t } = useTranslation();
  const storeWallets = useSelector((state) => state.wallets);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const wallets = useMemo(() => {
    const stored = getWallets();
    const list =
      Array.isArray(stored) && stored.length > 0
        ? stored
        : Array.isArray(storeWallets)
          ? storeWallets
          : [];
    return (list || []).filter(
      (wallet) => wallet?.kind !== 1 && !!wallet?.entitle,
    );
  }, [storeWallets, refreshCount]);

  const refresh = useCallback(() => {
    setRefreshCount((count) => count + 1);
    setShowAddWallet(false);
  }, []);

  useEffect(() => {
    const onFocus = () => setRefreshCount((count) => count + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (showAddWallet)
    return (
      <AddWallet
        exit={() => setShowAddWallet(false)}
        refresh={refresh}
        returnPath="/settings/profile?linkWallet=1"
      />
    );

  return (
    <Overlay width={480} exit={exit}>
      <div
        className="fx-centered fx-col box-pad-h box-pad-v fit-container fx-start-v"
        style={{ gap: "1rem" }}
      >
        <div className="fit-container fx-scattered">
          <h4>{t("AmQVpu4")}</h4>
          <div className="close" onClick={exit}>
            <div></div>
          </div>
        </div>

        <p className="p-medium gray-c fit-container">
          {wallets.length > 0 ? t("AO1XzWk") : t("AAPZe91")}
        </p>

        {wallets.length > 0 && (
          <div
            className="fit-container fx-centered fx-col"
            style={{ gap: ".5rem" }}
          >
            {wallets.map((wallet) => {
              const inUse = currentLud16 === wallet.entitle;
              return (
                <div
                  key={wallet.id}
                  className="fit-container sc-s-18 box-pad-h-m box-pad-v-m fx-scattered option pointer"
                  onClick={() => {
                    if (inUse) return;
                    onUse(wallet.entitle);
                    exit();
                  }}
                >
                  <div className="fx-centered fx-start-h">
                    <div className="round-icon-small">
                      <Icon
                        name={WALLET_ICON[wallet.kind] || "nwc-logo"}
                        size={24}
                        isColored
                      />
                    </div>
                    <p className="p-one-line">{wallet.entitle}</p>
                  </div>
                  {inUse ? (
                    <div className="sticker sticker-small sticker-green">
                      {t("At3PB1n")}
                    </div>
                  ) : (
                    <button className="btn btn-small btn-normal">
                      {t("Aj6SsU1")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          className="btn btn-gray btn-full fx-centered"
          onClick={() => setShowAddWallet(true)}
        >
          <Icon name="plus-sign" size={16} />
          {t("A8fEwNq")}
        </button>
      </div>
    </Overlay>
  );
}
