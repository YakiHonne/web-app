import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AddWallet from "@/Components/AddWallet";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { exportAllWallets } from "@/Helpers/Controlers";

export function WalletsManagement({ selectedTab, setSelectedTab, userKeys }) {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState(getWallets());
  const [showAddWallet, setShowAddWallet] = useState(false);

  useEffect(() => {
    if (userKeys) {
      handleAddWallet();
    } else setWallets([]);
  }, [userKeys]);

  let handleAddWallet = () => {
    let tempWallets = getWallets();
    setWallets(tempWallets);
    setShowAddWallet(false);
  };

  const refreshAfterDeletion = (w) => {
    setWallets(w);
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
    updateWallets(tempWallets);
    setWallets(tempWallets);
  };

  return (
    <>
      {showAddWallet && (
        <AddWallet
          exit={() => setShowAddWallet(false)}
          refresh={handleAddWallet}
        />
      )}
      <div
       
       className={`fit-container fx-scattered fx-col pointer ${selectedTab === "wallets" ? "sc-s box-pad-h-s box-pad-v-s" : ""}`}
       style={{
         borderBottom: "1px solid var(--very-dim-gray)",
         gap: 0,
         borderColor: "var(--very-dim-gray)",
         transition: "0.2s ease-in-out",
         overflow: "visible",
       }}
      >
        <div
          className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
          onClick={() =>
            selectedTab === "wallets"
              ? setSelectedTab("")
              : setSelectedTab("wallets")
          }
        >
          <div className="fx-centered fx-start-h fx-start-v">
            <div className="box-pad-v-s">
              <div className="wallet-24"></div>
            </div>
            <div>
              <p>{t("ACERu54")}</p>
              <p className="p-medium gray-c">{t("A0ZZIE7")}</p>
            </div>
          </div>
          <div className="arrow"></div>
        </div>
        {selectedTab === "wallets" && (
          <div className="fit-container fx-col fx-centered  box-pad-h-m box-pad-v-m ">
            <div className="fit-container fx-scattered">
              <div>
                <p>{t("A8fEwNq")}</p>
                <p className="p-medium gray-c">{t("AYKDD4g")}</p>
              </div>
              <div className="fx-centered">
                <button
                  className="btn-small btn btn-normal"
                  style={{ minWidth: "max-content" }}
                  onClick={exportAllWallets}
                >
                  {t("Aq791XG")}
                </button>
                <div
                  className="round-icon-small round-icon-tooltip"
                  data-tooltip={t("A8fEwNq")}
                  onClick={() => setShowAddWallet(true)}
                >
                  <div style={{ rotate: "-45deg" }} className="p-medium">
                    &#10005;
                  </div>
                </div>
              </div>
            </div>
            {wallets.map((wallet) => {
              return (
                <div
                  className="sc-s-18 bg-sp box-pad-h-s box-pad-v-s fx-scattered fit-container"
                  key={wallet.id}
                  style={{ overflow: "visible" }}
                >
                  <div className="fx-centered">
                    <div className="fx-centered">
                      {wallet.kind === 1 && (
                        <div className="webln-logo-24"></div>
                      )}
                      {wallet.kind === 2 && (
                        <div className="alby-logo-24"></div>
                      )}
                      {wallet.kind === 3 && <div className="nwc-logo-24"></div>}
                      <div className="fx-centered fx-col">
                        <div className="fx-centered">
                          <p>{wallet.entitle}</p>
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
                        </div>
                      </div>
                    </div>
                    <div className="fx-centered"></div>
                  </div>
                  <div className="fx-centered">
                    {!wallet.active && (
                      <div
                        className="round-icon-small round-icon-tooltip"
                        data-tooltip={t("Ar6TTrh")}
                        onClick={() => handleSelectWallet(wallet.id)}
                      >
                        <div className="switch-arrows"></div>
                      </div>
                    )}
                    {wallet.kind !== 1 && (
                      <EventOptions event={wallet} component={"wallet"} refreshAfterDeletion={refreshAfterDeletion}/>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default WalletsManagement;
