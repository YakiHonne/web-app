import React, { useEffect, useMemo, useRef, useState } from "react";
import { webln } from "@getalby/sdk";
import ArrowUp from "@/Components/ArrowUp";
import axios from "axios";
import PagePlaceholder from "@/Components/PagePlaceholder";
import * as secp from "@noble/secp256k1";
import SatsToUSD from "@/Components/SatsToUSD";
import {
  decodeUrlOrAddress,
  encodeLud06,
  getBech32,
  getEmptyuserMetadata,
  getHex,
  getZapper,
  shortenKey,
} from "@/Helpers/Encryptions";
import { relaysOnPlatform } from "@/Content/Relays";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import QRCode from "react-qr-code";
import LoadingDots from "@/Components/LoadingDots";
import { getZapEventRequest } from "@/Helpers/NostrPublisher";
import AddWallet from "@/Components/AddWallet";
import UserSearchBar from "@/Components/UserSearchBar";
import NProfilePreviewer from "@/Components/NProfilePreviewer";
import { copyText } from "@/Helpers/Helpers";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { useDispatch, useSelector } from "react-redux";
import { setUserBalance } from "@/Store/Slides/UserData";
import { setToast } from "@/Store/Slides/Publishers";
import { saveUsers } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import { walletWarning } from "@/Helpers/Controlers";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import { SelectTabsNoIndex } from "@/Components/SelectTabsNoIndex";
import { customHistory } from "@/Helpers/History";
import { useRouter } from "next/router";

export default function LightningWallet() {
  const dispatch = useDispatch();
  const { route } = useRouter();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);

  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [displayMessage, setDisplayMessage] = useState(false);
  const [ops, setOps] = useState("");
  const [wallets, setWallets] = useState(getWallets());
  const [walletBalance, setWalletBalance] = useState("N/A");
  const [selectedWallet, setSelectedWallet] = useState(
    wallets.find((wallet) => wallet.active),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showWalletsList, setShowWalletList] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const walletListRef = useRef(null);
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
  const checkIsLinked = (addr) => {
    if (userMetadata) {
      if (!(userMetadata.lud16 && userMetadata.lud06)) return false;
      if (userMetadata.lud16 && userMetadata.lud16 === addr) return true;
      if (userMetadata.lud06) {
        let decoded = decodeUrlOrAddress(userMetadata.lud06);
        if (decoded && decoded === addr) return true;
      }
      return false;
    }
  };
  const profileHasWallet = useMemo(() => {
    let hasWallet = userMetadata.lud06 || userMetadata.lud16;
    let isWalletLinked = wallets.find((wallet) => checkIsLinked(wallet.entitle))
      ? true
      : false;
    return {
      hasWallet,
      isWalletLinked,
    };
  }, [userMetadata, wallets]);

  useEffect(() => {
    let timeout = null;
    let sub = null;
    try {
      if (!userKeys) {
        setWallets([]);
        setSelectedWallet(false);
        return;
      }
      setIsLoading(true);
      timeout = setTimeout(() => {
        let tempWallets = getWallets();

        setWallets(tempWallets);
        setSelectedWallet(tempWallets.find((wallet) => wallet.active));

        let authors = [];
        sub = ndkInstance.subscribe(
          [
            {
              kinds: [9735],
              "#p": [userKeys.pub],
            },
          ],
          { closeOnEose: true, cacheUsage: "CACHE_FIRST", groupable: false },
        );

        sub.on("event", async (event) => {
          let zapper = getZapper(event);
          authors.push(zapper.pubkey);
          setTransactions((prev) => {
            let zap = prev.find((zap) => zap.id === zapper.id);
            if (!zap) return [...prev, zapper];
            return prev;
          });
        });
        sub.on("eose", () => {
          saveUsers(authors);
        });
      }, 1000);
    } catch (err) {
      console.log(err);
    }
    return () => {
      if (sub) sub.stop();
      if (timeout) clearTimeout(timeout);
    };
  }, [userKeys]);

  useEffect(() => {
    if (!userKeys) return;
    if (userKeys && (userKeys?.ext || userKeys?.sec || userKeys?.bunker)) {
      let tempWallets = getWallets();

      let selectedWallet_ = tempWallets.find((wallet) => wallet.active);
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
      } else {
        setWallets([]);
        setSelectedWallet(false);
        setWalletBalance("N/A");
      }
    } else {
      setWalletBalance("N/A");
    }
  }, [userKeys, selectedWallet, timestamp]);

  useEffect(() => {
    if (route === "/lightning-wallet" && walletBalance) {
      localStorage.setItem("selectedWalletType", route);
      dispatch(setUserBalance(walletBalance));
    }
  }, [route, walletBalance]);

  useEffect(() => {
    let handleOffClick = (e) => {
      if (walletListRef.current && !walletListRef.current.contains(e.target)) {
        setShowWalletList(false);
      }
    };

    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [walletListRef]);

  const getBalancWebLN = async () => {
    try {
      setIsLoading(true);
      await window.webln.enable();
      let data = await window.webln.getBalance();
      setIsLoading(false);
      setWalletBalance(data.balance);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  const getAlbyData = async (activeWallet) => {
    try {
      setIsLoading(true);
      let checkTokens = await checkAlbyToken(wallets, activeWallet);
      let b = await getBalanceAlbyAPI(
        checkTokens.activeWallet.data.access_token,
      );
      let t = await getTransactionsAlbyAPI(
        checkTokens.activeWallet.data.access_token,
      );
      setWallets(checkTokens.wallets);
      setWalletBalance(b);
      setWalletTransactions(t);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
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
      console.log(err);
      return 0;
    }
  };
  const getTransactionsAlbyAPI = async (code) => {
    try {
      const data = await axios.get("https://api.getalby.com/invoices", {
        headers: {
          Authorization: `Bearer ${code}`,
        },
      });
      let sendersMetadata = data.data
        .filter((event) => {
          if (event.metadata?.zap_request) return event;
        })
        .map((event) => {
          return event.metadata.zap_request.pubkey;
        });
      sendersMetadata = [...new Set(sendersMetadata)];
      saveUsers(sendersMetadata);

      return data.data;
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

  const getNWCData = async (activeWallet) => {
    try {
      setIsLoading(true);
      const nwc = new webln.NWC({ nostrWalletConnectUrl: activeWallet.data });
      await nwc.enable();
      const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 90;

      const userBalance_ = await nwc.getBalance();
      setWalletBalance(userBalance_.balance);
      const transactions_ = await nwc.listTransactions({
        from: Math.floor(new Date().getTime() / 1000 - ONE_WEEK_IN_SECONDS),
        until: Math.ceil(new Date().getTime() / 1000),
        limit: 50,
      });
      let sendersMetadata = transactions_.transactions
        .filter((event) => {
          if (event.metadata?.zap_request) return event;
        })
        .map((event) => {
          return event.metadata.zap_request.pubkey;
        });
      sendersMetadata = [...new Set(sendersMetadata)];
      saveUsers(sendersMetadata);
      setWalletTransactions(transactions_.transactions);
      setIsLoading(false);
      nwc.close();
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
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
    updateWallets(tempWallets);
    setOps("");
    setShowWalletList(false);
  };

  const refreshAfterDeletion = (w) => {
    setWallets(w);
    if (w.length === 0) setSelectedWallet(false);
    if (w.length > 0) setSelectedWallet(w[0]);
  };

  let handleAddWallet = () => {
    let tempWallets = getWallets();
    let selectedWallet_ = tempWallets.find((wallet) => wallet.active);
    setWallets(tempWallets);
    setSelectedWallet(selectedWallet_);
    setShowAddWallet(false);
  };

  const handleSelectPageTab = (tab) => {
    if (tab === 1) customHistory("/cashu-wallet");
  };
  return (
    <>
      {showAddWallet && (
        <AddWallet
          exit={() => setShowAddWallet(false)}
          refresh={handleAddWallet}
        />
      )}
      {ops === "send" && (
        <SendPayment
          exit={() => setOps("")}
          wallets={wallets}
          selectedWallet={selectedWallet}
          setWallets={setWallets}
          refreshTransactions={() => setTimestamp(Date.now())}
        />
      )}
      {ops === "receive" && (
        <ReceivePayment
          exit={() => setOps("")}
          wallets={wallets}
          selectedWallet={selectedWallet}
          setWallets={setWallets}
        />
      )}
      <div>
        <ArrowUp />
        <div className="fx-centered fit-container  fx-start-v">
          <div className="main-middle">
            {!(userKeys.ext || userKeys.sec || userKeys.bunker) && (
              <PagePlaceholder page={"nostr-wallet"} />
            )}
            {(userKeys.ext || userKeys.sec || userKeys.bunker) &&
              wallets.length === 0 && (
                <div className="fx-centered fx-col fx-start-h">
                  <div className="fit-container fx-centered box-pad-v">
                    <SelectTabsNoIndex
                      tabs={pageTabs}
                      selectedTab={0}
                      setSelectedTab={handleSelectPageTab}
                    />
                  </div>

                  <PagePlaceholder
                    page={"nostr-add-wallet"}
                    onClick={handleAddWallet}
                  />
                </div>
              )}

            {(userKeys.ext || userKeys.sec || userKeys.bunker) &&
              wallets.length > 0 && (
                <div className="box-pad-v box-pad-h">
                  <div className="fit-container fx-centered">
                    <SelectTabsNoIndex
                      tabs={pageTabs}
                      selectedTab={0}
                      setSelectedTab={handleSelectPageTab}
                    />
                  </div>
                  {/* <h3>{t("AQtRwt6")}</h3> */}
                  <div className="fit-container box-pad-v">
                    <div
                      className="fit-container fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v"
                      style={{ overflow: "visible" }}
                    >
                      <div className="fit-container fx-scattered fx-wrap">
                        <div
                          className="fx-centered fx-col fx-start-h fx-start-v"
                          style={{
                            position: "relative",
                            gap: "10px",
                            flex: "1 1 300px",
                          }}
                        >
                          {!isLoading && (
                            <div className="fx-centered fx-col fx-start-h fx-start-v">
                              <div className="fx-centered">
                                <div className="fx-centered ">
                                  <div className="fx-centered fx-col fx-start-h fx-start-v">
                                    <p className="gray-c">{t("A1yJkHJ")}</p>
                                    <h2>{walletBalance}</h2>
                                  </div>
                                  <span className="gray-c p-big">sats</span>
                                </div>
                                <p className="box-pad-h-m">|</p>
                                <div className="fx-centered fx-col fx-start-h fx-start-v">
                                  <p className="gray-c">{t("AjECxdb")}</p>
                                  <SatsToUSD
                                    sats={walletBalance}
                                    selector={true}
                                  />
                                </div>
                              </div>
                              {selectedWallet.kind !== 1 &&
                                selectedWallet.entitle.includes("@") && (
                                  <div
                                    className="btn btn-gray btn-small fx-centered"
                                    onClick={() =>
                                      selectedWallet.entitle.includes("@")
                                        ? copyText(
                                            selectedWallet.entitle,
                                            t("ALR84Tq"),
                                          )
                                        : walletWarning()
                                    }
                                  >
                                    {selectedWallet.entitle}
                                    <div className="copy"></div>
                                  </div>
                                )}
                            </div>
                          )}

                          {isLoading && (
                            <div
                              className="fx-centered fx-col box-pad-v box-pad-h"
                              style={{ height: "150px" }}
                            >
                              <LoadingDots />
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            position: "relative",
                            zIndex: 100,
                            flex: "1 1 150px",
                          }}
                        >
                          <div className="fx-centered fit-container fx-start-h">
                            <div
                              style={{ position: "relative" }}
                              ref={walletListRef}
                              className="fit-container fx-centered fx-start-v fx-col"
                            >
                              <p className="gray-c box-pad-h-m">
                                {t("AX8w9cg")}
                              </p>
                              {selectedWallet && (
                                <div
                                  className="fit-container fx-scattered if if-no-border option pointer"
                                  style={{
                                    height: "var(--40)",
                                    padding: "1rem",
                                  }}
                                  onClick={() =>
                                    setShowWalletList(!showWalletsList)
                                  }
                                >
                                  <p>{selectedWallet.entitle}</p>
                                  <div className="arrow-12"></div>
                                </div>
                              )}
                              {showWalletsList && (
                                <div
                                  className="fx-centered fx-col sc-s-18 bg-sp box-pad-v-s box-pad-h-s fx-start-v drop-down"
                                  style={{
                                    width: "400px",
                                    backgroundColor: "var(--c1-side)",
                                    position: "absolute",
                                    top: "calc(100% + 5px)",
                                    rowGap: 0,
                                    overflow: "visible",
                                  }}
                                >
                                  <div className="fit-container fx-scattered">
                                    <p className="p-medium gray-c box-pad-h-m box-pad-v-s">
                                      {t("AnXYtQy")}
                                    </p>
                                    <div
                                      className="round-icon-tooltip fx-centered btn btn-small btn-gray"
                                      // data-tooltip={t("A8fEwNq")}
                                      onClick={() => setShowAddWallet(true)}
                                    >
                                      <div className="plus-sign"></div>
                                      <p>{t("A8fEwNq")}</p>
                                    </div>
                                  </div>
                                  {wallets.map((wallet) => {
                                    let isLinked = checkIsLinked(
                                      wallet.entitle,
                                    );
                                    return (
                                      <div
                                        key={wallet.id}
                                        className="option-no-scale fit-container fx-scattered pointer box-pad-h-m box-pad-v-s"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectWallet(wallet.id);
                                        }}
                                        style={{
                                          border: "none",
                                          overflow: "visible",
                                        }}
                                      >
                                        <div className="fx-centered">
                                          {wallet.active && (
                                            <div
                                              style={{
                                                minWidth: "8px",
                                                aspectRatio: "1/1",
                                                backgroundColor:
                                                  "var(--green-main)",
                                                borderRadius:
                                                  "var(--border-r-50)",
                                              }}
                                            ></div>
                                          )}
                                          <p
                                            className={`p-one-line ${wallet.active ? "green-c" : ""}`}
                                          >
                                            {wallet.entitle}
                                          </p>
                                          {isLinked && (
                                            <div
                                              className="round-icon-tooltip"
                                              data-tooltip={t("ANExIY1")}
                                            >
                                              <div className="sticker sticker-small sticker-green-pale">
                                                {t("AqlBPla")}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        {wallet.kind !== 1 && (
                                          <EventOptions
                                            event={wallet}
                                            component={"wallet"}
                                            refreshAfterDeletion={
                                              refreshAfterDeletion
                                            }
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isLoading &&
                        !(
                          profileHasWallet.hasWallet &&
                          profileHasWallet.isWalletLinked
                        ) && (
                          <div className="box-pad-h-m box-pad-v-m fit-container sc-s-18 bg-sp fx-centered fx-centered fx-col gray-c p-centered">
                            ⚠️{" "}
                            {!profileHasWallet.hasWallet && <>{t("AAPZe91")}</>}
                            {profileHasWallet.hasWallet &&
                              !profileHasWallet.isWalletLinked && (
                                <>{t("AHKiPjO")}</>
                              )}{" "}
                            {t("AHTCsEO")}
                          </div>
                        )}
                      <div className="fx-centered fit-container">
                        <button
                          style={{ height: "70px", gap: 0 }}
                          className={
                            selectedWallet
                              ? "btn btn-gray fx fx-centered fx-col"
                              : "btn btn-disabled fx fx-centered fx-col"
                          }
                          onClick={() =>
                            selectedWallet ? setOps("receive") : null
                          }
                          disabled={selectedWallet ? false : true}
                        >
                          <span className="p-big">&#8595;</span>
                          <span>{t("A8SflFr")}</span>
                        </button>
                        <button
                          style={{ height: "70px", gap: 0 }}
                          className={
                            selectedWallet
                              ? "btn btn-orange  fx fx-centered fx-col"
                              : "btn btn-disabled fx fx-centered fx-col"
                          }
                          onClick={() =>
                            selectedWallet ? setOps("send") : null
                          }
                          disabled={selectedWallet ? false : true}
                        >
                          <span className="p-big">&#8593;</span>
                          <span>{t("A14LwWS")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {isLoading && (
                    <div
                      className="fit-container fx-centered"
                      style={{ height: "40vh" }}
                    >
                      <p className="gray-c">{t("AZhgADD")}</p> <LoadingDots />
                    </div>
                  )}
                  {!isLoading && (
                    <>
                      {transactions.length > 0 &&
                        selectedWallet?.kind === 1 && (
                          <div className="fit-container  fx-centered fx-col fx-start-v">
                            <p className="gray-c">{t("AzLQdQO")}</p>
                            {transactions.map((transaction, index) => {
                              let author =
                                nostrAuthors.find(
                                  (author) =>
                                    author.pubkey === transaction.pubkey,
                                ) || getEmptyuserMetadata(transaction.pubkey);
                              return (
                                <div
                                  key={transaction.id}
                                  className="fit-container fx-scattered fx-col box-pad-v-m box-pad-h-m sc-s-18 bg-sp"
                                  style={{
                                    // border: "none",
                                    overflow: "visible",
                                  }}
                                >
                                  <div className="fit-container fx-scattered">
                                    <div className="fx-centered fx-start-h">
                                      <div style={{ position: "relative" }}>
                                        <UserProfilePic
                                          mainAccountUser={false}
                                          user_id={author.pubkey}
                                          size={48}
                                          img={author.picture}
                                        />
                                        <div
                                          className="round-icon-small round-icon-tooltip"
                                          data-tooltip={t("A4G4OJ7")}
                                          style={{
                                            position: "absolute",
                                            scale: ".65",
                                            backgroundColor: "var(--pale-gray)",
                                            right: "-8px",
                                            bottom: "-10px",
                                          }}
                                        >
                                          <p className="green-c">&#8595;</p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="gray-c p-medium">
                                          <Date_
                                            toConvert={
                                              new Date(
                                                transaction.created_at * 1000,
                                              )
                                            }
                                            time={true}
                                          />
                                        </p>
                                        <p>
                                          {t("AdrOPfO", {
                                            name:
                                              author.display_name ||
                                              author.name ||
                                              author.pubkey.substring(0, 10),
                                          })}
                                          <span className="orange-c">
                                            {" "}
                                            {transaction.amount}{" "}
                                            <span className="gray-c">Sats</span>
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    {transaction.message && (
                                      <div
                                        className="round-icon-small round-icon-tooltip"
                                        data-tooltip={t("AYMJ2uj")}
                                        onClick={() =>
                                          displayMessage === transaction.id
                                            ? setDisplayMessage(false)
                                            : setDisplayMessage(transaction.id)
                                        }
                                      >
                                        <div className="comment-not"></div>
                                      </div>
                                    )}
                                  </div>
                                  {transaction.message &&
                                    displayMessage === transaction.id && (
                                      <div
                                        className="fit-container sc-s box-pad-h-s box-pad-v-s p-medium"
                                        style={{
                                          backgroundColor: "var(--c1-side)",
                                          borderRadius: "var(--border-r-6)",
                                        }}
                                      >
                                        <p className="gray-c p-medium">
                                          {t("AVZHXQq")}
                                        </p>
                                        <p className="p-medium">
                                          {transaction.message}
                                        </p>
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      {transactions.length === 0 &&
                        selectedWallet?.kind === 1 && (
                          <div
                            className="fit-container fx-centered fx-col"
                            style={{ height: "30vh" }}
                          >
                            <h4>{t("Ag3spMM")}</h4>
                            <p className="gray-c">{t("ABF4HcR")}</p>
                          </div>
                        )}
                      {walletTransactions.length > 0 &&
                        selectedWallet?.kind === 2 && (
                          <div className="fit-container box-pad-v fx-centered fx-col fx-start-v">
                            <p className="gray-c">{t("Aflt0YJ")}</p>
                            {walletTransactions.map((transaction) => {
                              let isZap = transaction.metadata?.zap_request;
                              let author = isZap
                                ? nostrAuthors.find(
                                    (author) =>
                                      author.pubkey ===
                                      transaction.metadata.zap_request.pubkey,
                                  )
                                : false;
                              return (
                                <div
                                  key={transaction.identifier}
                                  className="fit-container fx-scattered fx-col sc-s-18 bg-sp box-pad-h-m box-pad-v-m"
                                  style={{
                                    border: "none",
                                    overflow: "visible",
                                  }}
                                >
                                  <div className="fit-container fx-scattered">
                                    <div className="fx-centered fx-start-h">
                                      {(!isZap ||
                                        (isZap &&
                                          transaction.type === "outgoing")) && (
                                        <>
                                          {transaction.type === "outgoing" && (
                                            <div
                                              className="round-icon round-icon-tooltip"
                                              data-tooltip={t("AkPQ73T")}
                                            >
                                              <p className="red-c">&#8593;</p>
                                            </div>
                                          )}
                                          {transaction.type !== "outgoing" && (
                                            <div
                                              className="round-icon round-icon-tooltip"
                                              data-tooltip={t("A4G4OJ7")}
                                            >
                                              <p className="green-c">&#8595;</p>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      {isZap &&
                                        transaction.type !== "outgoing" && (
                                          <>
                                            <div
                                              style={{
                                                position: "relative",
                                              }}
                                            >
                                              <UserProfilePic
                                                mainAccountUser={false}
                                                size={48}
                                                user_id={isZap.pubkey}
                                                img={
                                                  author ? author.picture : ""
                                                }
                                              />
                                              <div
                                                className="round-icon-small round-icon-tooltip"
                                                data-tooltip={t("A4G4OJ7")}
                                                style={{
                                                  position: "absolute",
                                                  scale: ".65",
                                                  backgroundColor:
                                                    "var(--pale-gray)",
                                                  right: "-5px",
                                                  bottom: "-10px",
                                                }}
                                              >
                                                <p className="green-c">
                                                  &#8595;
                                                </p>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      <div>
                                        <p className="gray-c p-medium">
                                          <Date_
                                            toConvert={
                                              new Date(
                                                transaction.creation_date *
                                                  1000,
                                              )
                                            }
                                            time={true}
                                          />
                                        </p>
                                        <p>
                                          {(!isZap ||
                                            (isZap &&
                                              transaction.type ===
                                                "outgoing")) && (
                                            <>
                                              {transaction.type === "outgoing"
                                                ? t("ATyFagO")
                                                : t("AyVA6Q3")}
                                            </>
                                          )}
                                          {(isZap ||
                                            (isZap &&
                                              transaction.type !==
                                                "outgoing")) && (
                                            <>
                                              {t("AdrOPfO", {
                                                name: author
                                                  ? author.display_name ||
                                                    author.name
                                                  : getBech32(
                                                      "npub",
                                                      isZap.pubkey,
                                                    ).substring(0, 10),
                                              })}
                                            </>
                                          )}
                                          <span className="orange-c">
                                            {" "}
                                            {transaction.amount}{" "}
                                            <span className="gray-c">Sats</span>
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    {(transaction.memo ||
                                      transaction.comment) && (
                                      <div
                                        className="round-icon-small round-icon-tooltip"
                                        data-tooltip={t("AYMJ2uj")}
                                        onClick={() =>
                                          displayMessage ===
                                          transaction.identifier
                                            ? setDisplayMessage(false)
                                            : setDisplayMessage(
                                                transaction.identifier,
                                              )
                                        }
                                      >
                                        <div className="comment-not"></div>
                                      </div>
                                    )}
                                  </div>
                                  {(transaction.memo || transaction.comment) &&
                                    displayMessage ===
                                      transaction.identifier && (
                                      <div
                                        className="fit-container sc-s box-pad-h-s box-pad-v-s p-medium"
                                        style={{
                                          backgroundColor: "var(--c1-side)",
                                          borderRadius: "var(--border-r-6)",
                                        }}
                                      >
                                        <p className="gray-c p-medium">
                                          {t("AVZHXQq")}
                                        </p>
                                        <p className="p-medium">
                                          {transaction.memo ||
                                            transaction.comment}
                                        </p>
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      {walletTransactions.length === 0 &&
                        selectedWallet?.kind === 2 && (
                          <div
                            className="fit-container fx-centered fx-col"
                            style={{ height: "30vh" }}
                          >
                            <h4>{t("Ag3spMM")}</h4>
                            <p className="gray-c p-centered">{t("AgaoyPx")}</p>
                          </div>
                        )}
                      {walletTransactions.length > 0 &&
                        selectedWallet?.kind === 3 && (
                          <div className="fit-container box-pad-v fx-centered fx-col fx-start-v">
                            <p className="gray-c">{t("Aflt0YJ")}</p>
                            {walletTransactions.map((transaction, index) => {
                              let isZap = transaction.metadata?.zap_request;
                              let author = isZap
                                ? nostrAuthors.find(
                                    (author) =>
                                      author.pubkey ===
                                      transaction.metadata.zap_request.pubkey,
                                  )
                                : false;
                              return (
                                <div
                                  key={`${transaction.invoice}-${index}`}
                                  className="fit-container fx-scattered fx-col sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
                                  style={{
                                    // border: "none",
                                    overflow: "visible",
                                  }}
                                >
                                  <div className="fit-container fx-scattered">
                                    <div className="fx-centered fx-start-h">
                                      {(!isZap ||
                                        (isZap &&
                                          transaction.type === "outgoing")) && (
                                        <>
                                          {transaction.type === "outgoing" && (
                                            <div
                                              className="round-icon round-icon-tooltip"
                                              data-tooltip={t("AkPQ73T")}
                                            >
                                              <p className="red-c">&#8593;</p>
                                            </div>
                                          )}
                                          {transaction.type !== "outgoing" && (
                                            <div
                                              className="round-icon round-icon-tooltip"
                                              data-tooltip={t("A4G4OJ7")}
                                            >
                                              <p className="green-c">&#8595;</p>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      {isZap &&
                                        transaction.type !== "outgoing" && (
                                          <>
                                            <div
                                              style={{
                                                position: "relative",
                                              }}
                                            >
                                              <UserProfilePic
                                                mainAccountUser={false}
                                                size={48}
                                                user_id={isZap.pubkey}
                                                img={
                                                  author ? author.picture : ""
                                                }
                                              />
                                              <div
                                                className="round-icon-small round-icon-tooltip"
                                                data-tooltip={t("A4G4OJ7")}
                                                style={{
                                                  position: "absolute",
                                                  scale: ".65",
                                                  backgroundColor:
                                                    "var(--pale-gray)",
                                                  right: "-5px",
                                                  bottom: "-10px",
                                                }}
                                              >
                                                <p className="green-c">
                                                  &#8595;
                                                </p>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      <div>
                                        <p className="gray-c p-medium">
                                          <Date_
                                            toConvert={
                                              new Date(
                                                transaction.created_at * 1000,
                                              )
                                            }
                                            time={true}
                                          />
                                        </p>
                                        <p>
                                          {(!isZap ||
                                            (isZap &&
                                              transaction.type ===
                                                "outgoing")) && (
                                            <>
                                              {transaction.type === "outgoing"
                                                ? t("ATyFagO")
                                                : t("AyVA6Q3")}
                                            </>
                                          )}
                                          {(isZap ||
                                            (isZap &&
                                              transaction.type !==
                                                "outgoing")) && (
                                            <>
                                              {t("AdrOPfO", {
                                                name: author
                                                  ? author.display_name ||
                                                    author.name
                                                  : getBech32(
                                                      "npub",
                                                      isZap.pubkey,
                                                    ).substring(0, 10),
                                              })}
                                            </>
                                          )}

                                          <span className="orange-c">
                                            {" "}
                                            {transaction.amount}{" "}
                                            <span className="gray-c">Sats</span>
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    {transaction.description && (
                                      <div
                                        className="round-icon-small round-icon-tooltip"
                                        data-tooltip={t("AYMJ2uj")}
                                        onClick={() =>
                                          displayMessage === transaction.invoice
                                            ? setDisplayMessage(false)
                                            : setDisplayMessage(
                                                transaction.invoice,
                                              )
                                        }
                                      >
                                        <div className="comment-not"></div>
                                      </div>
                                    )}
                                  </div>
                                  {transaction.description &&
                                    displayMessage === transaction.invoice && (
                                      <div
                                        className="fit-container sc-s box-pad-h-s box-pad-v-s p-medium"
                                        style={{
                                          backgroundColor: "var(--c1-side)",
                                          borderRadius: "var(--border-r-6)",
                                        }}
                                      >
                                        <p className="gray-c p-medium">
                                          {t("AVZHXQq")}
                                        </p>
                                        <p className="p-medium">
                                          {transaction.description}
                                        </p>
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      {walletTransactions.length === 0 &&
                        selectedWallet?.kind === 3 && (
                          <div
                            className="fit-container fx-centered fx-col"
                            style={{ height: "30vh" }}
                          >
                            <h4>{t("Ag3spMM")}</h4>
                            <p className="gray-c p-centered">{t("AgaoyPx")}</p>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

const SendPayment = ({
  exit,
  wallets,
  selectedWallet,
  setWallets,
  refreshTransactions,
}) => {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);

  const { t } = useTranslation();
  const [isZap, setIsZap] = useState(false);
  const [invoiceData, setInvoicedata] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [addr, setAddr] = useState("");
  const [comment, setComment] = useState("");
  const [amount, setAmount] = useState(0);
  const [pubkey, setPubkey] = useState("");

  useEffect(() => {
    if (addr.startsWith("lnbc")) {
      setInvoicedata(false);
    } else setInvoicedata(true);
  }, [addr]);

  const sendWithWebLN = async (addr_) => {
    try {
      setIsLoading(true);
      await window.webln.enable();
      let res = await window.webln.sendPayment(addr_);
      dispatch(
        setToast({
          type: 1,
          desc: t("AaQzRGG", {
            amount: res.route.total_amt,
            fees: res.route.total_fees,
          }),
        }),
      );
      reInitParams();
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
    }
  };
  const sendWithNWC = async (addr_) => {
    try {
      setIsLoading(true);
      const nwc = new webln.NWC({ nostrWalletConnectUrl: selectedWallet.data });
      await nwc.enable();
      const res = await nwc.sendPayment(addr_);

      dispatch(
        setToast({
          type: 1,
          desc: t("A5n8Ifp"),
        }),
      );
      reInitParams();
      setIsLoading(false);
      nwc.close();
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
    }
  };
  const sendWithAlby = async (addr_, code) => {
    try {
      setIsLoading(true);
      const data = await axios.post(
        "https://api.getalby.com/payments/bolt11",
        { invoice: addr_ },
        {
          headers: {
            Authorization: `Bearer ${code}`,
          },
        },
      );
      setIsLoading(false);
      reInitParams();
      refreshTransactions();
      dispatch(
        setToast({
          type: 1,
          desc: t("AaQzRGG", {
            amount: data.data.amount,
            fees: data.data.fee,
          }),
        }),
      );
      return data.data;
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
      return 0;
    }
  };

  const handleSendPayment = async () => {
    if (isLoading) return;
    if (invoiceData) {
      try {
        let hex = pubkey;
        if (amount === 0) {
          dispatch(
            setToast({
              type: 3,
              desc: t("AR2vydH"),
            }),
          );
          return;
        }
        if (isZap && !pubkey) {
          dispatch(
            setToast({
              type: 3,
              desc: t("AJbsVsG"),
            }),
          );
          return;
        }
        if (pubkey.startsWith("npub")) {
          hex = getHex(pubkey);
          if (!hex) {
            dispatch(
              setToast({
                type: 3,
                desc: t("AiHLMRi"),
              }),
            );
            return;
          }
        }
        if (
          pubkey &&
          !pubkey.startsWith("npub") &&
          !secp.utils.isValidPrivateKey(pubkey)
        ) {
          dispatch(
            setToast({
              type: 3,
              desc: t("AiHLMRi"),
            }),
          );
          return;
        }
        const data = await axios.get(decodeUrlOrAddress(addr));
        const callback = data.data.callback;
        let addr_ = encodeLud06(decodeUrlOrAddress(addr));
        let sats = amount * 1000;
        let event = getEvent(sats, addr_, hex);
        const res = isZap
          ? await axios(
              `${callback}?amount=${sats}&nostr=${event}&lnurl=${addr_}`,
            )
          : await axios(`${callback}?amount=${sats}&lnurl=${addr_}`);

        if (selectedWallet.kind === 1) {
          sendWithWebLN(res.data.pr);
        }
        if (selectedWallet.kind === 2) {
          let checkTokens = await checkAlbyToken(wallets, selectedWallet);
          setWallets(checkTokens.wallets);
          sendWithAlby(addr_, checkTokens.activeWallet.data.access_token);
        }
        if (selectedWallet.kind === 3) {
          sendWithNWC(res.data.pr);
        }
      } catch (err) {
        console.log(err);
        dispatch(
          setToast({
            type: 2,
            desc: t("AYuUnqd"),
          }),
        );
      }
    }
    if (!invoiceData) {
      if (selectedWallet.kind === 1) sendWithWebLN(addr);
      if (selectedWallet.kind === 2) {
        let checkTokens = await checkAlbyToken(wallets, selectedWallet);
        setWallets(checkTokens.wallets);
        sendWithAlby(addr, checkTokens.activeWallet.data.access_token);
      }
      if (selectedWallet.kind === 3) sendWithNWC(addr);
    }
  };
  const reInitParams = () => {
    setIsZap(false);
    setInvoicedata(true);
    setAddr("");
    setComment("");
    setAmount(0);
    setPubkey("");
  };
  const getEvent = async (sats, addr_, hex) => {
    let tags = [
      ["relays", ...relaysOnPlatform],
      ["amount", sats.toString()],
      ["lnurl", addr_],
      ["p", hex],
    ];

    const event = isZap
      ? await getZapEventRequest(userKeys, comment, tags)
      : {};
    return event;
  };

  const handleUserMetadata = (data) => {
    if (data.lud16) {
      setAddr(data.lud16);
    }
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v slide-up"
        style={{ marginTop: "1rem", width: "min(100%, 500px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>

        <h4>{t("A14LwWS")}</h4>

        <div
          className="fx-scattered fit-container if pointer"
          onClick={() => {
            setInvoicedata(!invoiceData);
            setAddr("");
          }}
        >
          <p>{t("AI19tdC")}</p>
          <div
            className={`toggle ${invoiceData ? "toggle-dim-gray" : ""} ${
              !invoiceData ? "toggle-c1" : "toggle-dim-gray"
            }`}
          ></div>
        </div>

        <input
          type="text"
          className="if ifs-full"
          placeholder={!invoiceData ? t("AvEHTiP") : t("A40BuYB")}
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
        />

        {invoiceData && (
          <>
            {!pubkey && (
              <UserSearchBar
                onClick={setPubkey}
                full={true}
                placeholder={t("ABRi9O2")}
              />
            )}
            {pubkey && (
              <NProfilePreviewer
                pubkey={pubkey}
                margin={false}
                close={true}
                showSha
                onClose={() => setPubkey("")}
                setMetataData={handleUserMetadata}
              />
            )}
          </>
        )}
        {invoiceData && (
          <>
            <div className="fx-centered fx-col">
              <p className="gray-c p-big">{t("AcDgXKI")}</p>
              <input
                type="number"
                className="if p-bold if-no-border ifs-full p-centered"
                placeholder={t("AcDgXKI")}
                style={{
                  fontSize: `max(${
                    amount.toString().length > 5
                      ? `${80 - (amount.toString().length - 6) * 10}px`
                      : "80px"
                  },50px)`,
                  height: "80px",
                }}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                autoFocus
              />
              <p className="gray-c p-big">Sats</p>
            </div>
            <input
              type="text"
              className="if ifs-full if-no-border p-centered"
              style={{
                borderTop: "1px solid var(--pale-gray)",
                borderBottom: "1px solid var(--pale-gray)",
                borderRadius: "0",
                height: "50px",
              }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("Ark6BLW")}
            />
          </>
        )}
        <button
          className="btn btn-orange btn-full"
          onClick={handleSendPayment}
          disabled={isLoading}
        >
          {isLoading ? <LoadingDots /> : t("A14LwWS")}
        </button>
      </div>
    </div>
  );
};

const ReceivePayment = ({ exit, wallets, selectedWallet, setWallets }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceRequest, setInvoiceRequest] = useState(false);

  const generateWithWebLN = async () => {
    try {
      setIsLoading(true);
      await window.webln.enable();
      let invoice = await window.webln.makeInvoice({
        defaultMemo: comment,
        amount,
      });
      setIsLoading(false);
      setInvoiceRequest(invoice.paymentRequest);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
    }
  };
  const generateWithNWC = async () => {
    try {
      setIsLoading(true);
      const nwc = new webln.NWC({ nostrWalletConnectUrl: selectedWallet.data });
      await nwc.enable();
      const invoice = await nwc.makeInvoice({
        defaultMemo: comment,
        amount,
      });
      setIsLoading(false);
      setInvoiceRequest(invoice.paymentRequest);
      nwc.close();
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
    }
  };

  const generateWithAlby = async (code) => {
    try {
      setIsLoading(true);
      const data = await axios.post(
        "https://api.getalby.com/invoices",
        { amount, comment, description: comment, memo: comment },
        {
          headers: {
            Authorization: `Bearer ${code}`,
          },
        },
      );
      setIsLoading(false);
      setInvoiceRequest(data.data.payment_request);
      return data.data;
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      return 0;
    }
  };

  const generateInvoice = async () => {
    if (isLoading) return;
    if (selectedWallet.kind === 1) {
      generateWithWebLN();
    }
    if (selectedWallet.kind === 2) {
      let checkTokens = await checkAlbyToken(wallets, selectedWallet);
      setWallets(checkTokens.wallets);
      generateWithAlby(checkTokens.activeWallet.data.access_token);
    }
    if (selectedWallet.kind === 3) {
      generateWithNWC();
    }
  };

  const copyText = (key) => {
    navigator.clipboard.writeText(key);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AS0m8W5")} 👏`,
      }),
    );
  };

  return (
    <>
      {invoiceRequest && (
        <div className="fixed-container fx-centered box-pad-h">
          <div
            className="fx-centered fx-col sc-s-18"
            style={{ width: "min(100%, 500px)" }}
          >
            <QRCode
              style={{ width: "100%", aspectRatio: "1/1" }}
              size={500}
              value={invoiceRequest}
            />
            <div className="fx-centered fit-container">
              <div
                className="fx-scattered if pointer dashed-onH fit-container"
                style={{ borderStyle: "dashed" }}
                onClick={() => copyText(invoiceRequest)}
              >
                <p>{shortenKey(invoiceRequest)}</p>
                <div className="copy-24"></div>
              </div>
              <button
                className="btn btn-normal"
                onClick={() => setInvoiceRequest("")}
              >
                {t("AoUUBDI")}
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="fixed-container fx-centered box-pad-h"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          className="fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v slide-up"
          style={{ marginTop: "1rem", width: "min(100%, 500px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>

          <h4>{t("AuOH50L")}</h4>

          <div className="fx-centered fx-col">
            <p className="gray-c p-big">{t("AcDgXKI")}</p>
            <input
              type="number"
              className="if p-bold if-no-border ifs-full p-centered"
              placeholder={t("AcDgXKI")}
              style={{
                fontSize: `max(${
                  amount.toString().length > 5
                    ? `${80 - (amount.toString().length - 6) * 10}px`
                    : "80px"
                },50px)`,
                height: "80px",
              }}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              autoFocus
            />
            <p className="gray-c p-big">Sats</p>
          </div>
          <input
            type="text"
            className="if ifs-full if-no-border p-centered"
            style={{
              borderTop: "1px solid var(--pale-gray)",
              borderBottom: "1px solid var(--pale-gray)",
              borderRadius: "0",
              height: "50px",
            }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("Ark6BLW")}
          />
          <button
            className="btn btn-orange btn-full"
            onClick={generateInvoice}
            disabled={isLoading}
          >
            {isLoading ? <LoadingDots /> : t("AuOH50L")}
          </button>
        </div>
      </div>
    </>
  );
};

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
          username: import.meta.env.VITE_ALBY_CLIENT_ID,
          password: import.meta.env.VITE_ALBY_SECRET_ID,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
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
    console.log(err);
    return {
      wallets,
      activeWallet,
    };
  }
};
