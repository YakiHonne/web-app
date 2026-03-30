import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";

export default function LightningWalletsSelect({
  selectedWallet,
  wallets,
  setSelectedWallet,
  setWallets,
  label = true,
}) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!open) return;

    const handleOffClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 5,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updatePosition();
    document.addEventListener("mousedown", handleOffClick);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handleOffClick);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 5,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen((v) => !v);
  };

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
    <div className="fit-container fx-centered" style={{ gap: 0 }}>
      <div
        style={{
          position: "relative",
          transition: "width .2s ease-in-out",
        }}
        className="fit-container"
        ref={containerRef}
      >
        {selectedWallet && (
          <div
            className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col option pointer fit-container"
            onClick={toggleOpen}
          >
            <div className="fit-container fx-scattered">
              <div>
                {label && <p className="p-bold">{label || t("A7r9XS1")}</p>}
              </div>
              <Icon name="arrow" />
            </div>
            <div className="fx-centered fx-start-h fit-container">
              {selectedWallet.kind === 1 && (
                <div className="round-icon-small">
                  <Icon name="webln-logo" size={24} isColored/>
                </div>
              )}
              {selectedWallet.kind === 2 && (
                <div className="round-icon-small">
                  <Icon name="alby-logo" size={24} isColored/>
                </div>
              )}
              {selectedWallet.kind === 3 && (
                <div className="round-icon-small">
                  <Icon name="nwc-logo" size={24} isColored/>
                </div>
              )}
              <div>
                <p className="p-one-line">{selectedWallet.entitle}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fx-centered fx-col sc-s-18 bg-sp box-pad-h-s box-pad-v-s fx-start-v fx-start-h"
            style={{
              backgroundColor: "var(--c1-side)",
              position: "fixed",
              left: position.left,
              top: position.top,
              minWidth: position.width,
              width: "max-content",
              maxWidth: "90vw",
              rowGap: 0,
              overflow: "auto",
              maxHeight: "300px",
              zIndex: 999999,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
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
          </div>,
          document.body,
        )}
    </div>
  );
}

