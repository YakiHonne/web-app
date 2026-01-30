import React, { useEffect, useState } from "react";
import useCashu from "@/Hooks/useCachu";
import Select from "@/Components/Select";
import { useTranslation } from "react-i18next";
import CashuHistory from "./CashuHistory";
import WalletRestoration from "./WalletRestoration";
import CashuWalletCreation from "./CachuWalletManagement/CashuWalletCreation";
import WalletManagement from "./CachuWalletManagement/WalletManagement";
import SwapTokens from "./SwapTokens";
import ReceiveTokens from "./CachuWalletManagement/Receive/ReceiveTokens";
import SendTokens from "./CachuWalletManagement/Send/SendTokens";
import CashuSentTokensAsHash from "./CashuSentTokensAsHash";
import SyncTokens from "./SyncTokens";
import OptionsDropdown from "@/Components/OptionsDropdown";
import CashuNutZaps from "./CashuNutZaps";
import { useRouter } from "next/router";
import { SelectTabsNoIndex } from "@/Components/SelectTabsNoIndex";
import { customHistory } from "@/Helpers/History";
import { setUserBalance } from "@/Store/Slides/UserData";
import { useDispatch } from "react-redux";

export default function CashuWallet() {
  const { t } = useTranslation();
  const { query, route } = useRouter();
  const dispatch = useDispatch();
  const {
    cashuWallet,
    cashuTokens,
    activeMint,
    changeActiveMint,
    cashuNutZaps,
    cashuHistory,
    cashuTotalBalance,
    notInWalletMints,
  } = useCashu();
  const [ops, setOps] = useState("");
  const [launchRestoration, setLaunchRestoration] = useState(false);
  const [launchMintsAdding, setLaunchMintsAdding] = useState(false);
  const [launchSyncing, setLaunchSyncing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("history");
  const tabs = [
    { value: "history", display_name: t("ARgXvNi") },
    { value: "nutzap", display_name: "Nutzap" },
    { value: "sentTokens", display_name: t("ASS0LTq") },
  ];
  const pageTabs = [
    {
      display_name: t("AQtRwt6"),
      value: 0,
    },
    {
      display_name: t("ALrBEok"),
      value: 1,
    },
  ];
  useEffect(() => {
    if (route === "/cashu-wallet" && cashuTotalBalance) {
      localStorage.setItem("selectedWalletType", route);
      dispatch(setUserBalance(cashuTotalBalance));
    }
  }, [route, cashuTotalBalance]);

  useEffect(() => {
    let tabFromQuery =
      ["history", "sentTokens", "nutzap"].includes(query?.tab) && query.tab
        ? query.tab
        : "history";
    if (tabFromQuery) setSelectedTab(tabFromQuery);
  }, [query]);

  const handleSelectPageTab = (tab) => {
    if (tab === 0) customHistory("/lightning-wallet");
  };

  return (
    <>
      {launchRestoration && (
        <WalletRestoration
          activeMint={activeMint}
          exit={() => setLaunchRestoration(false)}
        />
      )}
      {launchMintsAdding && (
        <WalletManagement
          exit={() => setLaunchMintsAdding(false)}
          previousPrivKey={cashuWallet?.privkey}
          currentMintList={cashuWallet?.mints || []}
          notInWalletMints={notInWalletMints}
        />
      )}
      {launchSyncing && (
        <SyncTokens
          exit={() => setLaunchSyncing(false)}
          cashuTokens={cashuTokens}
          mint={activeMint}
        />
      )}
      {ops === "swap" && (
        <SwapTokens
          exit={() => setOps("")}
          cashuWallet={cashuWallet}
          cashuTokens={cashuTokens}
        />
      )}
      {ops === "send" && <SendTokens exit={() => setOps("")} />}
      {ops === "receive" && <ReceiveTokens exit={() => setOps("")} />}
      <div className="box-pad-h box-pad-v">
        {/* <h3>{t("ALrBEok")}</h3> */}
        <div className="fit-container fx-centered">
          <SelectTabsNoIndex
            tabs={pageTabs}
            selectedTab={1}
            setSelectedTab={handleSelectPageTab}
          />
        </div>
        <div className="fit-container box-pad-v">
          {cashuWallet?.privkey && (
            <div
              className="fx-centered fx-col fit-container sc-s box-pad-h box-pad-v bg-sp"
              style={{ overflow: "visible" }}
            >
              <div className="fit-container fx-scattered fx-wrap">
                <div
                  className="fx-centered fx-start-h"
                  style={{ flex: "1 1 300px" }}
                >
                  <div>
                    <p className="gray-c ">{t("A1yJkHJ")}</p>
                    <div className="fx-centered fx-stretch">
                      <h2 className="c1-c">{cashuTotalBalance}</h2>
                      <span className="gray-c p-big">sats</span>
                    </div>
                  </div>
                  {activeMint && cashuTokens[activeMint] && (
                    <>
                      <p className="box-pad-h-m">|</p>
                      <div>
                        <p className="gray-c ">{t("AXNpyc4")}</p>
                        <div className="fx-centered fx-stretch">
                          <h2>{cashuTokens[activeMint]?.total}</h2>
                          <span className="gray-c p-big">sats</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className="fx-centered fx-start-v fx-col"
                  style={{ flex: "1 1 200px" }}
                >
                  <p className="gray-c box-pad-h-m">{t("AUVDPh3")}</p>
                  <div className="fx-centered fit-container">
                    {cashuWallet?.mints?.length > 0 && (
                      <div
                        style={{
                          border:
                            notInWalletMints.length > 0
                              ? "1px solid #FCC100"
                              : "none",
                          borderRadius: "var(--border-r-18)",
                          position: "relative",
                        }}
                        className="fit-container"
                      >
                        {notInWalletMints.length > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-5px",
                              left: "-5px",
                              zIndex: 1000,
                            }}
                          >
                            <p className="p-bold p-medium">⚠️</p>
                          </div>
                        )}
                        <Select
                          noBorder={true}
                          fullWidth={true}
                          animatedHover={false}
                          options={
                            cashuWallet?.mints?.map((_) => ({
                              display_name: _,
                              value: _,
                            })) || []
                          }
                          header={
                            cashuWallet?.mints?.length > 0 && (
                              <div
                                className="pointer fit-container fx-scattered box-pad-h-s box-pad-v-s sc-s-18"
                                style={{
                                  borderBottomLeftRadius: 0,
                                  borderBottomRightRadius: 0,
                                }}
                                onClick={() => setLaunchMintsAdding(true)}
                              >
                                <p className="gray-c">{t("ACs4qJF")}</p>
                                <div className="fx-centered">
                                  {notInWalletMints.length > 0 && (
                                    <p className="p-bold p-medium">⚠️</p>
                                  )}
                                  <div className="setting-24"></div>
                                </div>
                              </div>
                            )
                          }
                          setSelectedValue={changeActiveMint}
                          value={activeMint}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        position: "relative",
                        border: "none",
                        borderRadius: "50%",
                        height: "max-content",
                        width: "max-content",
                      }}
                    >
                      <OptionsDropdown
                        options={[
                          <div
                            className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
                            onClick={() => setLaunchRestoration(true)}
                          >
                            <div className="restore"></div>
                            <p>{t("ADmoKen")}</p>
                          </div>,
                          <div
                            className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
                            onClick={() => setLaunchSyncing(true)}
                          >
                            <div className="switch-arrows-v2"></div>
                            <p>{t("A7hStNv")}</p>
                          </div>,
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="fx-centered fit-container">
                <button
                  style={{ height: "70px", gap: 0 }}
                  className={
                    activeMint
                      ? "btn btn-gray fx fx-centered fx-col"
                      : "btn btn-disabled fx fx-centered fx-col"
                  }
                  onClick={() => (activeMint ? setOps("receive") : null)}
                  disabled={activeMint ? false : true}
                >
                  <span className="p-big">&#8595;</span>
                  <span>{t("A8SflFr")}</span>
                </button>
                {cashuWallet?.mints?.length > 1 && (
                  <button
                    style={{ height: "70px", gap: 0 }}
                    className={
                      activeMint
                        ? "btn btn-gray fx fx-centered fx-col"
                        : "btn btn-disabled fx fx-centered fx-col"
                    }
                    onClick={() => (activeMint ? setOps("swap") : null)}
                    disabled={activeMint ? false : true}
                  >
                    <div className="box-pad-v-s">
                      <div className="switch-arrows-v2"></div>
                    </div>
                    <span>{t("AZE0w8d")}</span>
                  </button>
                )}
                <button
                  style={{ height: "70px", gap: 0 }}
                  className={
                    activeMint
                      ? "btn btn-orange  fx fx-centered fx-col"
                      : "btn btn-disabled fx fx-centered fx-col"
                  }
                  onClick={() => (activeMint ? setOps("send") : null)}
                  disabled={activeMint ? false : true}
                >
                  <span className="p-big">&#8593;</span>
                  <span>{t("A14LwWS")}</span>
                </button>
              </div>
            </div>
          )}
          {!cashuWallet?.privkey && <CashuWalletCreation />}
        </div>
        <div className="fit-container fx-centered " style={{ gap: 0 }}>
          {tabs.map((tab) => {
            return (
              <div
                className={`list-item-b fx-centered fx ${
                  selectedTab === tab.value ? "selected-list-item-b" : ""
                }`}
                onClick={() => setSelectedTab(tab.value)}
                key={tab.value}
              >
                {tab.display_name}
              </div>
            );
          })}
        </div>
        {selectedTab === "history" && (
          <CashuHistory cashuHistory={cashuHistory.history} />
        )}
        {selectedTab === "sentTokens" && (
          <CashuSentTokensAsHash cashuTokens={cashuTokens} />
        )}
        {selectedTab === "nutzap" && (
          <CashuNutZaps
            cashuNutZaps={cashuNutZaps}
            cashuTokens={cashuTokens}
            privkey={cashuWallet?.privkey}
            redeemedTokens={cashuHistory?.tokensRedeemed || []}
          />
        )}
        <div className="fx-centered"></div>
      </div>
    </>
  );
}
