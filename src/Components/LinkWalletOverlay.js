import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Overlay from "@/Components/Overlay";
import Icon from "@/Components/Icon";
import { getWallets } from "@/Helpers/ClientHelpers";

const WALLET_ICON = {
  2: "alby-logo",
  3: "nwc-logo",
};

export default function LinkWalletOverlay({ currentLud16, onUse, exit }) {
  const { t } = useTranslation();
  const storeWallets = useSelector((state) => state.wallets);

  const wallets = useMemo(() => {
    const list =
      Array.isArray(storeWallets) && storeWallets.length > 0
        ? storeWallets
        : getWallets();
    return (list || []).filter(
      (wallet) => wallet?.kind !== 1 && !!wallet?.entitle,
    );
  }, [storeWallets]);

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
          {t("AO1XzWk")}
        </p>

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
                  <button className="btn btn-small btn-normal">{t("Aj6SsU1")}</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Overlay>
  );
}
