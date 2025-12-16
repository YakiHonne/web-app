import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  decodeUrlOrAddress,
  encodeLud06,
  shortenKey,
} from "@/Helpers/Encryptions";
import QRCode from "react-qr-code";
import { relaysOnPlatform } from "@/Content/Relays";
import { getZapEventRequest } from "@/Helpers/NostrPublisher";
import LoadingDots from "@/Components/LoadingDots";
import { webln } from "@getalby/sdk";
import { decode } from "light-bolt11-decoder";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import useUserProfile from "@/Hooks/useUsersProfile";
import { nip19 } from "nostr-tools";
import Lottie from "lottie-react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import Link from "next/link";
import { saveUsers } from "@/Helpers/DB";
import successJSON from "@/JSONs/success.json";
import sparkService from "@/Helpers/Spark/spark.service";

export default function PaymentGateway({
  recipientAddr,
  paymentAmount,
  recipientPubkey,
  nostrEventIDEncode,
  setReceivedEvent = () => null,
  setConfirmPayment = () => null,
  exit,
}) {
  const { t } = useTranslation();
  const [callback, setCallback] = useState(false);
  const [lnbcAmount, setLnbcAmount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useUserProfile(recipientPubkey);
  const wallets = getWallets();

  useEffect(() => {
    const fetchData = async () => {
      if (callback) return;
      try {
        if (!recipientAddr && wallets.length === 0) {
          setConfirmPayment({ status: false, preImage: "" });
          setIsLoading(false);
          return;
        }
        if (recipientAddr.startsWith("lnbc") && recipientAddr.length > 24) {
          try {
            let decoded = decode(recipientAddr);
            let lnbc = decoded.sections.find(
              (section) => section.name === "amount"
            );
            setLnbcAmount(parseInt(lnbc.value) / 1000);
            setIsLoading(false);
            return;
          } catch (err) {
            console.log(err);
            setConfirmPayment({ status: false, preImage: "" });
            setIsLoading(false);
            return;
          }
        }

        let url = decodeUrlOrAddress(recipientAddr);
        if (!url) return;
        const data = await axios.get(url);

        setCallback(data.data.callback);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setConfirmPayment({ status: false, preImage: "" });
        setIsLoading(false);
      }
    };
    if (!callback) fetchData();
  }, [recipientAddr]);

  if (isLoading)
    return (
      <div className="fixed-container fx-centered" style={{ zIndex: 2000000 }}>
        <LoadingDots />
      </div>
    );
  if (wallets.length === 0)
    return (
      <div
        className="fixed-container fx-centered box-pad-h"
        style={{ zIndex: 2000000 }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="sc-s bg-sp box-pad-h box-pad-v fx-centered fx-col slide-up"
          style={{
            width: "min(100%, 400px)",
            position: "relative",
            overflow: "visible",
            padding: "3rem 1rem",
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <PagePlaceholder page={"nostr-add-wallet"} />
          <Link href={"/wallet"} target="_blank">
            <button className="btn btn-normal">{t("A8fEwNq")}</button>
          </Link>
        </div>
      </div>
    );
  if (
    !recipientAddr ||
    (!callback && !recipientAddr.startsWith("lnbc")) ||
    (!lnbcAmount && recipientAddr.startsWith("lnbc"))
  )
    return (
      <div
        className="fixed-container fx-centered box-pad-h"
        style={{ zIndex: 2000000 }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="sc-s bg-sp box-pad-h box-pad-v fx-centered fx-col slide-up"
          style={{
            width: "min(100%, 400px)",
            position: "relative",
            overflow: "visible",
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div
            className="crossmark-tt"
            style={{ minWidth: "50px", minHeight: "50px" }}
          ></div>
          <h4>{t("AI8bhpw")}</h4>
          <p className="box-pad-h gray-c p-centered">{t("ACOXf0z")}</p>
        </div>
      </div>
    );
  return (
    <Cashier
      recipientAddr={recipientAddr}
      recipientPubkey={recipientPubkey}
      callback={callback}
      recipientInfo={userProfile}
      nostrEventIDEncode={nostrEventIDEncode}
      paymentAmount={lnbcAmount || paymentAmount}
      isLNBC={lnbcAmount}
      exit={exit}
      setReceivedEvent={setReceivedEvent}
      setConfirmPayment={setConfirmPayment}
    />
  );
}

const Cashier = ({
  recipientAddr,
  recipientPubkey,
  callback,
  nostrEventIDEncode,
  paymentAmount,
  isLNBC = false,
  exit,
  setReceivedEvent,
  setConfirmPayment,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const [amount, setAmount] = useState(paymentAmount || 21);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [wallets, setWallets] = useState(getWallets());
  const [selectedWallet, setSelectedWallet] = useState(
    wallets.find((wallet) => wallet.active)
  );
  const [confirmation, setConfirmation] = useState("initiated");
  const [onlyInvoice, setOnlyInvoice] = useState(false);
  const [showWalletsList, setShowWalletList] = useState(false);
  const walletListRef = useRef(null);

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

  const onConfirmation = async (generateOnlyInvoice) => {
    try {
      if (!userKeys || !amount) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AbnA22A"),
          })
        );
        return;
      }
      setIsLoading(true);
      let lnbcInvoice = isLNBC ? recipientAddr : "";
      let eventCreatedAt = Math.floor(Date.now() / 1000);
      let eventToPublish = null;
      if (!isLNBC) {
        let sats = amount * 1000;
        let tags = [
          ["relays", ...relaysOnPlatform],
          ["amount", sats.toString()],
          ["lnurl", recipientAddr],
          ["p", recipientPubkey],
        ];
        let extraTags = nostrEventIDEncode
          ? getNostrEventInfo(nostrEventIDEncode)
          : [];
        tags = [...tags, ...extraTags];
        const event = recipientPubkey
          ? await getZapEventRequest(userKeys, message, tags, eventCreatedAt)
          : false;

        eventToPublish = event;
        let tempRecipientLNURL = recipientAddr.includes("@")
          ? encodeLud06(decodeUrlOrAddress(recipientAddr))
          : recipientAddr;
        try {
          const res = await axios(
            `${callback}${callback.includes("?") ? "&" : "?"}amount=${sats}${
              event ? `&nostr=${event}` : ""
            }&lnurl=${tempRecipientLNURL}`
          );
          if (res.data.status === "ERROR") {
            setIsLoading(false);
            setConfirmation("failed");
            dispatch(
              setToast({
                type: 2,
                desc: t("AZ43zpG"),
              })
            );
            return;
          }
          lnbcInvoice = res.data.pr;
        } catch (err) {
          setConfirmation("failed");
          setIsLoading(false);
          dispatch(
            setToast({
              type: 2,
              desc: t("AgCBh6S"),
            })
          );
          return;
        }
      }
      setInvoice(lnbcInvoice);
      setConfirmation("in_progress");

      if (generateOnlyInvoice) {
        setIsLoading(false);
        setOnlyInvoice(true);
        return;
      }

      let res = await sendPayment(lnbcInvoice);
      setConfirmPayment(res);
      if (eventToPublish) {
        setReceivedEvent({
          kinds: [9735],
          "#p": [recipientPubkey],
          since: eventCreatedAt - 1,
        });
      }
      if (res.status) {
        setConfirmation("confirmed");
      } else {
        setConfirmation("failed");
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setConfirmation("failed");
      setIsLoading(false);
    }
  };

  const getNostrEventInfo = (id) => {
    let tags = [];
    try {
      if (id.startsWith("note1")) {
        let decode = nip19.decode(id);
        return [["e", decode.data]];
      }
      if (id.startsWith("nevent1")) {
        let decode = nip19.decode(id);
        return [["e", decode.data.id]];
      }
      if (id.startsWith("naddr")) {
        let decode = nip19.decode(id);
        return [
          [
            "a",
            `${decode.data.kind}:${decode.data.pubkey}:${decode.data.identifier}`,
          ],
        ];
      }

      return [];
    } catch (err) {
      return tags;
    }
  };

  const sendPayment = async (addr) => {
    if (selectedWallet.kind === 1) {
      let res = await sendWithWebLN(addr);
      return res;
    }
    if (selectedWallet.kind === 2) {
      let checkTokens = await checkAlbyToken(wallets, selectedWallet);
      setWallets(checkTokens.wallets);
      let res = await sendWithAlby(
        addr,
        checkTokens.activeWallet.data.access_token
      );
      return res;
    }
    if (selectedWallet.kind === 3) {
      let res = await sendWithNWC(addr);
      return res;
    }
    if (selectedWallet.kind === 4) {
      let res = await sendWithSpark(addr);
      return res;
    }
  };

  const sendWithWebLN = async (addr_) => {
    try {
      await window.webln?.enable();
      let res = await window.webln.sendPayment(addr_);
      return {
        status: res.preimage ? true : false,
        preImage: res.preimage,
      };
    } catch (err) {
      setIsLoading(false);
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
      return {
        status: false,
        preImage: "",
      };
    }
  };

  const sendWithNWC = async (addr_) => {
    try {
      const nwc = new webln.NWC({ nostrWalletConnectUrl: selectedWallet.data });
      await nwc.enable();
      const res = await nwc.sendPayment(addr_);
      nwc.close();
      return {
        status: res.preimage ? true : false,
        preImage: res.preimage,
      };
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
      return {
        status: false,
        preImage: "",
      };
    }
  };

  const sendWithAlby = async (addr_, code) => {
    try {
      const res = await axios.post(
        "https://api.getalby.com/payments/bolt11",
        { invoice: addr_ },
        {
          headers: {
            Authorization: `Bearer ${code}`,
          },
        }
      );
      return {
        status: res.data.preimage ? true : false,
        preImage: res.data.preimage,
      };
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      return {
        status: false,
        preImage: "",
      };
    }
  };

  const sendWithSpark = async (addr_) => {
    try {
      // Parse the invoice/address to determine if we need to pass an amount
      let amountToPass = undefined;

      // Check if this is a Lightning address (not a bolt11 invoice)
      if (!addr_.toLowerCase().startsWith('lnbc') &&
          !addr_.toLowerCase().startsWith('lntb') &&
          !addr_.toLowerCase().startsWith('lnbcrt')) {
        // Lightning address or LNURL - needs amount
        const parsedAmount = parseInt(paymentAmount);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
          amountToPass = parsedAmount;
        }
      }
      // For bolt11 invoices, don't pass amount (it's encoded in the invoice)
      // unless it's a zero-amount invoice

      const response = await sparkService.sendPayment(addr_, amountToPass);

      console.log('[PaymentGateway] Spark payment response:', response);

      // Extract preimage from Breez SDK response
      // The response is a payment object: { id, paymentType, status, amount, fees, timestamp, method, details }
      const preimage = response?.details?.preimage || response?.preimage || '';
      const paymentStatus = response?.status || '';

      console.log('[PaymentGateway] Preimage:', preimage, 'Status:', paymentStatus);

      // Check if payment succeeded based on status or preimage
      // Note: Breez SDK returns 'complete' (not 'completed')
      const succeeded = (paymentStatus === 'complete' || paymentStatus === 'succeeded') || !!preimage;

      return {
        status: succeeded,
        preImage: preimage,
      };
    } catch (err) {
      setIsLoading(false);
      console.error('[PaymentGateway] Spark payment error:', err);

      // Handle specific error types
      if (err.message === 'INSUFFICIENT_FUNDS') {
        dispatch(
          setToast({
            type: 2,
            desc: t('Insufficient funds'),
          })
        );
      } else if (err.message === 'USER_REJECTED') {
        // User canceled, don't show error
        return {
          status: false,
          preImage: "",
        };
      } else {
        dispatch(
          setToast({
            type: 2,
            desc: t('Acr4Slu'),
          })
        );
      }

      return {
        status: false,
        preImage: "",
      };
    }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AS0m8W5")} 👏`,
      })
    );
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
    setShowWalletList(false);
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
      style={{ zIndex: 2000000 }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="sc-s bg-sp box-pad-h box-pad-v slide-up"
        style={{
          width: "min(100%, 400px)",
          position: "relative",
          overflow: "visible",
        }}
      >
        {confirmation === "initiated" && (
          <div className="fx-centered fx-col fit-container fx-start-v">
            <div className="fit-container fx-centered fx-col">
              {recipientPubkey && (
                <div
                  className="fx-centered sc-s bg-sp"
                  style={{ padding: ".35rem .45rem", gap: "20px" }}
                >
                  <div
                    className="bg-img cover-bg pointer"
                    style={{
                      minHeight: "30px",
                      minWidth: "30px",
                      backgroundImage: `url(${userMetadata?.picture})`,
                      borderRadius: "50%",
                    }}
                  ></div>
                  {/* <div className="arrow" style={{rotate: "-90deg"}}></div> */}
                  <div style={{ position: "relative" }}>
                    <div className="arrows-animated">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <ReceiverInfo
                    pubkey={recipientPubkey}
                    recipientAddr={recipientAddr}
                    isLNBC={isLNBC}
                  />
                </div>
              )}
              <div className="fit-container fx-centered" style={{ gap: 0 }}>
                <div
                  style={{
                    position: "relative",
                    width: showWalletsList ? "350px" : "200px",
                    transition: "width .2s ease-in-out",
                  }}
                  ref={walletListRef}
                >
                  {selectedWallet && (
                    <div
                      className="box-pad-h-s sc-s bg-sp fx-scattered option pointer fit-container"
                      onClick={() => setShowWalletList(!showWalletsList)}
                      style={{ padding: ".25rem .5rem" }}
                    >
                      <div className="fx-centered">
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
                          <p className="gray-c p-medium">{t("A7r9XS1")}</p>
                          <p className="p-one-line">{selectedWallet.entitle}</p>
                        </div>
                      </div>
                      <div className="box-pad-h-s"></div>
                      <div className="arrow"></div>
                    </div>
                  )}
                  {showWalletsList && (
                    <div
                      className="fx-centered fx-col sc-s-18  box-pad-v-s fx-start-v fx-start-h fit-container"
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
                            className="option-no-scale fit-container fx-scattered sc-s-18 pointer box-pad-h-m box-pad-v-s"
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
              {!isLNBC && !paymentAmount && (
                <>
                  <div className="fx-centered fx-col box-pad-v-m box-pad-h-s">
                    <div className="fx-centered fx-col">
                      <p className="gray-c p-big">{t("A82pzWN")}</p>
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
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("Ark6BLW")}
                    />
                  </div>
                </>
              )}
              {(isLNBC || (paymentAmount !== 0 && paymentAmount !== undefined)) && (
                <div className="fx-centered fx-col box-pad-v-m">
                  <div className="fx-centered fx-col">
                    <p className="gray-c p-big">{t("A82pzWN")}</p>

                    <h1 style={{ fontSize: "80px" }}>{amount}</h1>
                    <p className="gray-c p-big">Sats</p>
                  </div>
                </div>
              )}
            </div>
            <div className="fit-container fx-centered" style={{ gap: "16px" }}>
              <div
                className="fx-centered fx-col option pointer fx"
                style={{
                  height: "95px",
                  borderRadius: "24px",
                  border: "1px solid var(--red-main)",
                }}
                onClick={isLoading ? null : exit}
              >
                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <>
                    <p className="red-c p-big" style={{ height: "20px" }}>
                      &#10005;
                    </p>
                    <p className="red-c">{t("AB4BSCe")}</p>
                  </>
                )}
              </div>
              <div
                className="fx-centered fx-col option pointer fx"
                style={{
                  height: "95px",
                  borderRadius: "24px",
                  border: "1px solid var(--pale-gray)",
                }}
                onClick={() => {
                  !isLoading && onConfirmation(true);
                }}
              >
                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <>
                    <div className="qrcode-24"></div>
                    <p>{t("AvEHTiP")}</p>
                  </>
                )}
              </div>
              <div
                className="fx-centered fx-col option pointer fx"
                style={{
                  height: "95px",
                  borderRadius: "24px",
                  backgroundColor: "var(--c1)",
                }}
                onClick={() => (isLoading ? null : onConfirmation())}
              >
                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <>
                    <p className="p-big" style={{ height: "20px" }}>
                      &#8593;
                    </p>
                    <p>{t("A14LwWS")}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {confirmation === "in_progress" && onlyInvoice && (
          <div className="fx-centered fx-col fit-container">
            <h4>Invoice</h4>
            <p className="gray-c box-pad-v-s box-pad-h p-centered">
              Scan the QR Code or copy the invoice address
            </p>
            <div
              style={{ backgroundColor: "white" }}
              className="sc-s-18 box-pad-h-m box-pad-v-m fx-centered fit-container"
            >
              <QRCode
                // style={{ width: "100%", aspectRatio: "1/1" }}
                size={320}
                value={invoice}
              />
            </div>
            <div
              className="fx-scattered if pointer dashed-onH fit-container"
              style={{ borderStyle: "dashed" }}
              onClick={() => copyKey(invoice)}
            >
              <p>{shortenKey(invoice)}</p>
              <div className="copy-24"></div>
            </div>
            <div className="fit-container fx-centered">
              <button
                className="btn btn-normal btn-full"
                onClick={() => {
                  exit();
                }}
              >
                {t("AI67awJ")}
              </button>
            </div>
          </div>
        )}
        {confirmation === "in_progress" && !onlyInvoice && (
          <div className="fx-centered fx-col fit-container" style={{ height: "25vh" }}>
            <p className="gray-c p-medium">{t("A1ufjMM")}</p>
            <LoadingDots />
          </div>
        )}
        {confirmation === "confirmed" && (
          <div
            className="fx-centered fx-col fit-container"
            style={{ height: "25vh" }}
          >
            <div style={{ maxHeight: "70px", maxWidth: "70px" }}>
              <Lottie animationData={successJSON} loop={false} />
            </div>
            <h4 className="slide-down">{t("ACDUO1d")}</h4>
            <p className="gray-c box-pad-v-s slide-up">
              {t("ALEgwqA")} <span className="orange-c">{amount} sats</span>
            </p>
            <button className="btn btn-normal slide-up" onClick={exit}>
              {t("Acglhzb")}
            </button>
          </div>
        )}
        {confirmation === "failed" && (
          <div
            className="fx-centered fx-col fit-container"
            style={{ height: "16vh" }}
          >
            <div
              className="crossmark-tt"
              style={{ minHeight: "50px", minWidth: "50px" }}
            ></div>
            <h4 className="slide-down box-pad-v-m">{t("AI8bhpw")}</h4>
            <button className="btn btn-normal slide-up" onClick={exit}>
              {t("Acglhzb")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReceiverInfo = ({ pubkey, isLNBC, recipientAddr }) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { isNip05Verified, userProfile } = useUserProfile(pubkey);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!(userProfile.display_name && userProfile.picture)) saveUsers([pubkey]);
  }, []);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (ref.current && !ref.current.contains(e.target)) setShowInfo(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [ref]);
  return (
    <div style={{ position: "relative", zIndex: "100" }} ref={ref}>
      <div
        className="bg-img cover-bg pointer"
        style={{
          minHeight: "30px",
          minWidth: "30px",
          backgroundImage: `url(${userProfile?.picture})`,
          borderRadius: "50%",
        }}
        onClick={() => setShowInfo(!showInfo)}
      ></div>

      {showInfo && (
        <div
          className="sc-s bg-sp box-pad-h box-pad-v-s slide-left"
          style={{
            position: "absolute",
            top: "0",
            left: "calc(100% + 8px)",
            width: "max-content",
            maxWidth: "300px",
            height: "100%",
            zIndex: 101,
          }}
        >
          <div className="fx-centered fx-start-h">
            <p className="p-maj">{userProfile?.display_name}</p>
            {isNip05Verified && <div className="checkmark-c1"></div>}
          </div>
          {!isLNBC && (
            <p className="p-one-line gray-c">
              {userProfile.lud16
                ? userProfile.lud16.length < 40
                  ? userProfile.lud16
                  : shortenKey(userProfile.lud16, 10)
                : shortenKey(recipientAddr, 10)}
            </p>
          )}
          {isLNBC && (
            <p className="p-one-line gray-c p-italic">{t("ANOiCGe")}</p>
          )}
        </div>
      )}
    </div>
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
    console.log(err);
    return {
      wallets,
      activeWallet,
    };
  }
};
