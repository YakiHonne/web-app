import useCloseContainer from "@/Hooks/useCloseContainer";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function LightningWalletsSelect({
  selectedWallet,
  wallets,
  setSelectedWallet,
  setWallets,
  label = true,
}) {
  const { t } = useTranslation();
  const { containerRef, open, setOpen } = useCloseContainer();

  const handleSelectWallet = (walletID) => {
    let index = wallets.findIndex((wallet) => wallet.id == walletID);

    let tempWallets = Array.from(wallets);
    tempWallets = tempWallets.map((wallet) => {
      let w = { ...wallet };
      w.active = false;
      return w;
    });
    tempWallets[index].active = true;
    setSelectedWallet(wallets[index]);
    setWallets(tempWallets);
    setOpen(false);
  };
  return (
    <div className="fit-container  fx-centered" style={{ gap: 0 }}>
      <div
        style={{
          position: "relative",
          // width: open ? "350px" : "200px",
          transition: "width .2s ease-in-out",
        }}
        className="fit-container"
        ref={containerRef}
      >
        {selectedWallet && (
          <div
            className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col option pointer fit-container"
            onClick={() => setOpen(!open)}
          >
            <div className="fit-container fx-scattered">
              <div>
                {label && <p className="p-bold">{label || t("A7r9XS1")}</p>}
              </div>
              <div className="arrow"></div>
            </div>
            <div className="fx-centered fx-start-h fit-container">
              {selectedWallet.kind === 1 && (
                <div className="round-icon-small">
                  <div className="webln-logo-24"></div>
                </div>
              )}
              {selectedWallet.kind === 2 && (
                <div className="round-icon-small">
                  <div className="alby-logo-24"></div>
                </div>
              )}
              {selectedWallet.kind === 3 && (
                <div className="round-icon-small">
                  <div className="nwc-logo-24"></div>
                </div>
              )}
              <div>
                <p className="p-one-line">{selectedWallet.entitle}</p>
              </div>
            </div>
          </div>
        )}
        {open && (
          <div
            className="fx-centered fx-col sc-s-18 bg-sp  box-pad-h-s box-pad-v-s fx-start-v fx-start-h fit-container"
            style={{
              // width: "400px",
              backgroundColor: "var(--c1-side)",
              position: "absolute",
              right: "0",
              top: "calc(100% + 5px)",
              rowGap: 0,
              overflow: "scroll",
              maxHeight: "300px",
              zIndex: 100,
            }}
          >
            <p className="p-medium gray-c box-pad-h-m box-pad-v-s">
              {t("AnXYtQy")}
            </p>
            {wallets.map((wallet) => {
              return (
                <div
                  key={wallet.id}
                  className={`option-no-scale fit-container fx-scattered pointer box-pad-h-m box-pad-v-s ${wallet.active ? "sc-s-18" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectWallet(wallet.id);
                  }}
                  style={{
                    border: "none",
                    minWidth: "max-content",
                    overflow: "visible",
                  }}
                >
                  <div className="fx-centered">
                    {wallet.active && (
                      <div
                        style={{
                          minWidth: "8px",
                          aspectRatio: "1/1",
                          backgroundColor: "var(--green-main)",
                          borderRadius: "var(--border-r-50)",
                        }}
                      ></div>
                    )}
                    <p className={wallet.active ? "green-c" : ""}>
                      {wallet.entitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
