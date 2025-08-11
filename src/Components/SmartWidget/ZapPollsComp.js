import React, { useEffect, useState, useRef } from "react";
import { nip19 } from "nostr-tools";
import { checkForLUDS, convertDate } from "@/Helpers/Encryptions";
import relaysOnPlatform from "@/Content/Relays";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import LoadingDots from "@/Components/LoadingDots";
import { decode } from "light-bolt11-decoder";
import axios from "axios";
import {
  decodeUrlOrAddress,
  encodeLud06,
  shortenKey,
} from "@/Helpers/Encryptions";
import axiosInstance from "@/Helpers/HTTP_Client";
import UserProfilePic from "@/Components/UserProfilePic";
import QRCode from "react-qr-code";
import { getZapEventRequest } from "@/Helpers/NostrPublisher";
import { webln } from "@getalby/sdk";
import { useDispatch, useSelector } from "react-redux";
import { setUpdatedActionFromYakiChest } from "@/Store/Slides/YakiChest";
import { getUser, updateYakiChestStats } from "@/Helpers/Controlers";
import { setToast } from "@/Store/Slides/Publishers";
import { saveUsers } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";

export default function ZapPollsComp({
  event,
  nevent,
  content_text_color,
  options_text_color,
  options_background_color,
  options_foreground_color,
  edit = false,
}) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [poll, setPoll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVotesLoading, setVotesLoading] = useState(false);
  const [votes, setVotes] = useState([]);
  const [minSatsValue, setMinSatsValue] = useState(null);
  const [maxSatsValue, setMaxSatsValue] = useState(null);
  const [closingTime, setClosingTime] = useState({ time: null, status: false });
  const [isStatsShowing, setIsStatsShowing] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [totalSats, setTotalSats] = useState(0);
  const [percentageType, setPercentageType] = useState("zaps");
  const [callback, setCallback] = useState(false);
  const [author, setAuthor] = useState(false);
  const [showCashier, setShowCashier] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (callback || !poll) return;
      try {
        let auth = getUser(poll.pubkey);
        if (auth) {
          let lud = checkForLUDS(auth?.lud06, auth?.lud16);
          setAuthor({ ...auth, lud });
          const data = await axios.get(decodeUrlOrAddress(lud));
          setCallback(data.data.callback);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (!callback) fetchData();
  }, [nostrAuthors, poll]);

  useEffect(() => {
    const getData = () => {
      setIsLoading(true);
      if (event) {
        let currentTime = Math.floor(Date.now() / 1000);
        let options = [];
        let minSats = null;
        let maxSats = null;
        let closedAt = null;
        for (let tag of event.tags) {
          if (tag[0] === "poll_option") options.push(tag[2] || "");
          if (tag[0] === "value_maximum") maxSats = parseInt(tag[1]) || 0;
          if (tag[0] === "value_minimum") minSats = parseInt(tag[1]) || 0;
          if (tag[0] === "closed_at") closedAt = parseInt(tag[1]) || null;
        }
        saveUsers([event.pubkey]);
        let parsed_content = getNoteTree(
          event.content,
          undefined,
          undefined,
          undefined,
          event.pubkey
        );
        if (closedAt !== null)
          setClosingTime({
            time: closedAt,
            status: currentTime > closedAt,
          });
        if (minSats !== null) setMinSatsValue(minSats);
        if (maxSats !== null) setMaxSatsValue(maxSats);
        setPoll({ options, content: event.content, parsed_content, ...event });
        setIsLoading(false);
        return;
      }

      let id;
      try {
        id = nip19.decode(nevent).data.id;
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
      if (!id) return;
      const sub = ndkInstance.subscribe([{ kinds: [6969], ids: [id] }], {
        closeOnEose: true,
        cacheUsage: "CACHE_FIRST",
      });

      sub.on("event", (event) => {
        try {
          let currentTime = Math.floor(Date.now() / 1000);
          let options = [];
          let minSats = null;
          let maxSats = null;
          let closedAt = null;
          for (let tag of event.tags) {
            if (tag[0] === "poll_option") options.push(tag[2] || "");
            if (tag[0] === "value_maximum") maxSats = parseInt(tag[1]) || 0;
            if (tag[0] === "value_minimum") minSats = parseInt(tag[1]) || 0;
            if (tag[0] === "closed_at") closedAt = parseInt(tag[1]) || null;
          }
          let parsed_content = getNoteTree(
            event.content,
            undefined,
            undefined,
            undefined,
            event.pubkey
          );
          if (closedAt !== null)
            setClosingTime({
              time: closedAt,
              status: currentTime > closedAt,
            });
          if (minSats !== null) setMinSatsValue(minSats);
          if (maxSats !== null) setMaxSatsValue(maxSats);
          saveUsers([event.pubkey]);
          setPoll({
            options,
            content: event.content,
            parsed_content,
            ...event,
          });
          setIsLoading(false);
        } catch (err) {
          console.log(err);
          setIsLoading(false);
        }
      });
      sub.on("close", () => {
        setIsLoading(false);
      });
      let timeout = setTimeout(() => {
        sub.stop();
        clearTimeout(timeout);
      }, 4000);
    };
    if (!nevent && !event) return;
    getData();
  }, [nevent, event]);

  const LoadStats = () => {
    try {
      setIsStatsShowing(true);
      setVotesLoading(true);
      if (!poll) return;
      let events = [];
      let eose = false;
      let sub = ndkInstance.subscribe([{ kinds: [9735], "#e": [poll.id] }], {
        closeOnEose: true,
        cacheUsage: "CACHE_FIRST",
      });

      sub.on("event", (zap) => {
        let zapEvent = zap.tags.find((tag) => tag[0] === "description");
        let zapLNBCAmount = zap.tags.find((tag) => tag[0] === "bolt11");
        zapLNBCAmount = zapLNBCAmount
          ? parseInt(
              decode(zapLNBCAmount[1]).sections.find(
                (section) => section.name === "amount"
              ).value
            ) / 1000
          : null;
        zapEvent = zapEvent ? JSON.parse(zapEvent[1]) : null;

        if (
          (zapEvent &&
            closingTime.time &&
            zapEvent.created_at <= closingTime.time) ||
          (zapEvent && !closingTime.time)
        ) {
          let option = zapEvent.tags.find((tag) => tag[0] === "poll_option");
          option = option ? option[1] : null;
          if (option) {
            let tempZapEvent = {
              ...zapEvent,
              amount: zapLNBCAmount,
              option,
            };

            if (zapLNBCAmount !== null) {
              if (
                (minSatsValue &&
                  maxSatsValue &&
                  tempZapEvent.amount >= minSatsValue &&
                  tempZapEvent.amount <= maxSatsValue) ||
                (minSatsValue &&
                  !maxSatsValue &&
                  tempZapEvent.amount >= minSatsValue) ||
                (maxSatsValue &&
                  !minSatsValue &&
                  tempZapEvent.amount <= maxSatsValue) ||
                (!maxSatsValue && !minSatsValue)
              ) {
                if (tempZapEvent.pubkey === userKeys.pub) setIsVoted(option);
                let checkExistantIndex = events.findIndex(
                  (ev) => ev.pubkey === tempZapEvent.pubkey
                );
                if (checkExistantIndex === -1) events.push(tempZapEvent);
                else {
                  if (events[checkExistantIndex].amount < tempZapEvent.amount)
                    events.splice(checkExistantIndex, 0, tempZapEvent);
                }
                if (eose) {
                  setVotes(events);
                  setTotalSats(
                    events.reduce((total, event) => (total += event.amount), 0)
                  );
                }
              }
            }
          }
        }
      });
      sub.on("eose", () => {
        eose = true;
        setVotes(events);
        setTotalSats(
          events.reduce((total, event) => (total += event.amount), 0)
        );
        // sub.close();
        setVotesLoading(false);
      });
    } catch (err) {
      console.log(err);
      setVotesLoading(false);
    }
  };

  const handleShowCashier = (option) => {
    if (
      !userKeys ||
      (userKeys && !(userKeys?.sec || userKeys?.ext || userKeys?.bunker))
    ) {
      setIsLogin(true);
      return;
    }
    if (!callback) {
      dispatch(
        setToast({
          type: 3,
          desc: t("AekHS26"),
        })
      );
      return;
    }
    if (closingTime.status) {
      dispatch(
        setToast({
          type: 3,
          desc: t("AvjhH4g"),
        })
      );
      return;
    }
    if (poll.pukey === userKeys.pub) {
      dispatch(
        setToast({
          type: 3,
          desc: t("AxcgWsO"),
        })
      );
      return;
    }
    if (!isStatsShowing) {
      LoadStats();
    }
    if (isVoted) {
      dispatch(
        setToast({
          type: 3,
          desc: t("AlfSF0h"),
        })
      );
      return;
    }

    setShowCashier(option);
  };

  if (!nevent && !event)
    return (
      <div className="fx-centered">
        <p className="orange-c p-italic p-medium">{t("AsbcDvy")}</p>
      </div>
    );
  if ((isLoading && !poll) || !poll)
    return (
      <div className="fx-centered">
        <p className="gray-c p-italic p-medium">{t("AKvHyxG")}</p>
        <LoadingDots />
      </div>
    );
  return (
    <>
      {showCashier && (
        <Cashier
          recipientLNURL={author.lud}
          recipientPubkey={poll.pubkey}
          callback={callback}
          recipientInfo={author}
          eTag={poll.id}
          forContent={showCashier}
          min={minSatsValue}
          max={maxSatsValue}
          exit={() => setShowCashier(false)}
          refresh={LoadStats}
          isVotesLoading={isVotesLoading}
          isVoted={isVoted}
        />
      )}
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      <div className="fit-container fx-centered fx-col">
        <div
          className="fit-container poll-content-box"
          style={{ "--p-color": content_text_color }}
        >
          {poll.parsed_content}
        </div>
        {!edit && (
          <div
            className="fit-container fx-scattered"
            style={{ position: "relative", zIndex: 10 }}
          >
            <div>
              <p className="gray-c ">
                {t("AZDLpFt", { count: poll.options.length })}
              </p>
            </div>
            <div
              className="round-icon-small round-icon-tooltip"
              data-tooltip={t(
                percentageType === "user" ? "AL9yjtS" : "AcAPQ8H"
              )}
              onClick={() =>
                percentageType === "user"
                  ? setPercentageType("zaps")
                  : setPercentageType("user")
              }
            >
              {percentageType === "user" && <div className="user"></div>}
              {percentageType === "zaps" && <div className="bolt"></div>}
            </div>
          </div>
        )}
        <div className="fx-col fx-centered fit-container">
          {poll.options.map((option, index) => {
            let stats = votes.filter((vote) => vote.option == index);
            let percentagePerUser = (stats.length * 100) / votes.length;
            let percentagePerZaps =
              (stats.reduce((total, event) => (total += event.amount), 0) *
                100) /
              totalSats;
            let percentage =
              percentageType === "user" ? percentagePerUser : percentagePerZaps;
            return (
              <div
                key={index}
                className={`box-pad-h-m box-pad-v-s sc-s fit-container ${
                  edit ? "" : "option"
                }`}
                style={{
                  border:
                    isVoted &&
                    isVoted == index &&
                    !isVotesLoading &&
                    isStatsShowing
                      ? `1px solid ${
                          options_foreground_color || "var(--orange-main)"
                        }`
                      : "none",
                  backgroundColor:
                    options_background_color || "var(--very-dim-gray)",
                  position: "relative",
                  cursor: !edit ? "pointer" : "not-allowed",
                }}
                onClick={() => handleShowCashier({ option, index: `${index}` })}
              >
                <div
                  className="sc-s"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: edit
                      ? "30%"
                      : isVoted || poll.pubkey === userKeys.pub
                      ? `${percentage}%`
                      : 0,
                    border: "none",
                    backgroundColor:
                      options_foreground_color || "var(--orange-main)",
                    transition: ".2s ease-in-out",
                    zIndex: 0,
                  }}
                ></div>
                <p
                  style={{
                    color: options_text_color,
                    zIndex: 2,
                    position: "relative",
                  }}
                  className="p-one-line"
                >
                  {option}
                </p>
              </div>
            );
          })}
        </div>
        {!edit && (
          <div className="fit-container fx-scattered">
            {!isStatsShowing && (
              <button className="btn btn-text btn-small" onClick={LoadStats}>
                {t("AeIWccN")}
              </button>
            )}
            {!isVotesLoading && (
              <>
                {isStatsShowing &&
                  (isVoted ||
                    closingTime.status ||
                    poll.pubkey === userKeys.pub) && (
                    <p className="orange-c p-medium box-pad-h-m">
                      {votes.length}{" "}
                      <span className="gray-c">{t("AWXfzUx")}</span>
                    </p>
                  )}
                {isStatsShowing &&
                  !isVoted &&
                  !closingTime.status &&
                  poll.pubkey !== userKeys.pub && (
                    <p className="gray-c p-medium box-pad-h-m p-italic">
                      {t("AQFZHEB")}
                    </p>
                  )}
              </>
            )}
            {isVotesLoading && (
              <div className="box-pad-h-m box-pad-v-s">
                <LoadingDots />
              </div>
            )}
            {closingTime.time && !closingTime.status && (
              <p className="gray-c p-medium">
                {t("ASGLzji", {
                  date: convertDate(new Date(closingTime.time * 1000)),
                })}
              </p>
            )}
            {closingTime.time && closingTime.status && (
              <p className="red-c p-medium p-italic">
                {t("AfPxJDW", {
                  date: convertDate(new Date(closingTime.time * 1000)),
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const Cashier = ({
  recipientLNURL,
  recipientPubkey,
  callback,
  recipientInfo,
  eTag,
  exit,
  forContent,
  lnbcAmount,
  min,
  max,
  refresh,
  isVotesLoading,
  isVoted,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const [amount, setAmount] = useState(min !== null ? min : 1);
  const [message, setMessage] = useState("");
  const [invoice, setInvoice] = useState("");
  const [wallets, setWallets] = useState(getWallets());
  const [selectedWallet, setSelectedWallet] = useState(
    wallets.find((wallet) => wallet.active)
  );
  const [confirmation, setConfirmation] = useState("initiated");
  const [showWalletsList, setShowWalletList] = useState(false);
  const [amountWarning, setAmountWarning] = useState(false);
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

  useEffect(() => {
    if (isVoted) {
      dispatch(
        setToast({
          type: 3,
          desc: t("AlfSF0h"),
        })
      );
      exit();
      return;
    }
    if (recipientPubkey === userKeys.pub) {
      dispatch(
        setToast({
          type: 3,
          desc: t("AxcgWsO"),
        })
      );
      exit();
      return;
    }
  }, [isVoted, isVotesLoading]);

  const predefined_amounts = [
    { amount: min, entitle: t("AEm0kT5") },
    { amount: max, entitle: t("APpaAQM") },
  ];

  const onConfirmation = async () => {
    try {
      if (amountWarning) return;
      if (!userKeys || !amount) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AbnA22A"),
          })
        );
        return;
      }
      let lnbcInvoice = lnbcAmount ? recipientLNURL : "";
      let sats = amount * 1000;
      let tags = [
        ["relays", ...relaysOnPlatform],
        ["amount", sats.toString()],
        ["lnurl", recipientLNURL],
        ["p", recipientPubkey],
        ["e", eTag],
        ["poll_option", forContent.index],
      ];
      const event = await getZapEventRequest(userKeys, message, tags);
      if (!event) {
        return;
      }
      let tempRecipientLNURL = recipientLNURL.includes("@")
        ? encodeLud06(decodeUrlOrAddress(recipientLNURL))
        : recipientLNURL;

      const res = await axios(
        `${callback}?amount=${sats}&nostr=${event}&lnurl=${tempRecipientLNURL}`
      );

      if (res.data.status === "ERROR") {
        dispatch(
          setToast({
            type: 2,
            desc: t("AZ43zpG"),
          })
        );
        return;
      }
      lnbcInvoice = res.data.pr;

      setInvoice(lnbcInvoice);
      setConfirmation("in_progress");

      await sendPayment(lnbcInvoice);

      let sub = ndkInstance.subscribe(
        [
          {
            kinds: [9735],
            "#p": [recipientPubkey],
            since: Math.floor(Date.now() / 1000 - 10),
          },
        ],
        { groupable: false, cacheUsage: "CACHE_FIRST" }
      );

      sub.on("event", (event) => {
        setConfirmation("confirmed");
        refresh();
        updateYakiChest();
      });
    } catch (err) {
      console.log(err);
    }
  };

  const sendPayment = async (addr) => {
    if (selectedWallet.kind === 1) sendWithWebLN(addr);
    if (selectedWallet.kind === 2) {
      let checkTokens = await checkAlbyToken(wallets, selectedWallet);
      setWallets(checkTokens.wallets);
      sendWithAlby(addr, checkTokens.activeWallet.data.access_token);
    }
    if (selectedWallet.kind === 3) sendWithNWC(addr);
  };

  const sendWithWebLN = async (addr_) => {
    try {
      await window.webln?.enable();
      let res = await window.webln.sendPayment(addr_);
      return;
    } catch (err) {
      if (err.includes("User rejected")) return;
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
    }
  };
  const sendWithNWC = async (addr_) => {
    try {
      const nwc = new webln.NWC({ nostrWalletConnectUrl: selectedWallet.data });
      await nwc.enable();
      const res = await nwc.sendPayment(addr_);
      nwc.close();
      return;
    } catch (err) {
      console.log(err);

      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        })
      );
    }
  };
  const sendWithAlby = async (addr_, code) => {
    try {
      const data = await axios.post(
        "https://api.getalby.com/payments/bolt11",
        { invoice: addr_ },
        {
          headers: {
            Authorization: `Bearer ${code}`,
          },
        }
      );
      return;
    } catch (err) {
      console.log(err);
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

  const updateYakiChest = async () => {
    try {
      let action_key = getActionKey();
      if (action_key) {
        let data = await axiosInstance.post("/api/v1/yaki-chest", {
          action_key,
        });

        let { user_stats, is_updated } = data.data;

        if (is_updated) {
          dispatch(setUpdatedActionFromYakiChest(is_updated));
          updateYakiChestStats(user_stats);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getActionKey = () => {
    if (amount > 0 && amount <= 20) return "zap-1";
    if (amount <= 60) return "zap-20";
    if (amount <= 100) return "zap-60";
    if (amount > 100) return "zap-100";
    return false;
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

  const handleCustomAmount = (e) => {
    let value = parseInt(e.target.value);
    setAmount(value);
    if (!value || value === 0) {
      setAmountWarning(true);
      return;
    }
    if (min && value < min) setAmountWarning(true);
    else if (max && value > max) setAmountWarning(true);
    else setAmountWarning(false);
  };

  const handlePresetAmount = (amount) => {
    if (amount !== null) {
      setAmount(amount);
      setAmountWarning(false);
    }
  };

  if (isVotesLoading)
    return (
      <div
        className="fixed-container fx-centered box-pad-h"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div className="fx-centered">
          <p className="gray-c p-medium">{t("AKvHyxG")}</p>
          <LoadingDots />
        </div>
      </div>
    );
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <section
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="sc-s box-pad-h box-pad-v"
        style={{
          width: "min(100%, 500px)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <div
          className="close"
          onClick={(e) => {
            e.stopPropagation();
            exit();
          }}
        >
          <div></div>
        </div>
        <div className="fx-centered box-marg-s">
          <div className="fx-centered fx-col">
            <UserProfilePic size={54} mainAccountUser={true} />
            <p className="gray-c p-medium">{userMetadata.name}</p>
          </div>
          <div style={{ position: "relative", width: "30%" }}>
            {confirmation === "confirmed" && (
              <div
                className="checkmark slide-left"
                style={{ scale: "3" }}
              ></div>
            )}
            {confirmation !== "confirmed" && (
              <div className="arrows-animated">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
          <div className="fx-centered fx-col">
            <UserProfilePic
              size={54}
              img={recipientInfo.img || recipientInfo.picture}
              mainAccountUser={false}
            />
            <p className="gray-c p-medium">{recipientInfo.name}</p>
          </div>
        </div>

        {/* <hr style={{ margin: "1rem auto" }} /> */}
        {confirmation === "initiated" && (
          <div className="fx-centered fx-col fit-container fx-start-v">
            {forContent && (
              <div className="fit-container sc-s-18 box-pad-h-m box-pad-v-m">
                <p>
                  <span className="gray-c">{t("A8E5m7a")} </span>
                  {forContent.option}
                </p>
              </div>
            )}
            <div
              style={{ position: "relative" }}
              className="fit-container"
              ref={walletListRef}
            >
              {selectedWallet && (
                <div
                  className="if fx-scattered option pointer fit-container"
                  onClick={() => setShowWalletList(!showWalletsList)}
                >
                  <div>
                    <p className="gray-c p-medium">{t("A7r9XS1")}</p>
                    <p>{selectedWallet.entitle}</p>
                  </div>
                  <div className="arrow"></div>
                </div>
              )}
              {showWalletsList && (
                <div
                  className="fx-centered fx-col sc-s-18  box-pad-v-s fx-start-v fx-start-h fit-container"
                  style={{
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

            <div className="fit-container" style={{ position: "relative" }}>
              <input
                type="number"
                className="if ifs-full"
                placeholder={t("AcDgXKI")}
                value={amount}
                onChange={handleCustomAmount}
                style={{ borderColor: amountWarning ? "var(--red-main)" : "" }}
              />
              <div
                className="fx-centered"
                style={{ position: "absolute", right: "16px", top: "16px" }}
              >
                <p className="gray-c">sats</p>
              </div>
              {amountWarning && (
                <div className="box-pad-h-s box-pad-v-s fx-centered">
                  <p className="p-medium red-c">
                    {(min !== null || max !== null) && t("ABioe4x")}
                    {!(min !== null && max !== null) && t("AUytlmo")}
                  </p>
                </div>
              )}
            </div>
            <div className="fit-container fx-scattered">
              {predefined_amounts.map((item, index) => {
                return (
                  <div
                    className={`fx fx-col fx-centered box-pad-h-m box-pad-v-m sc-s-18  ${
                      item.amount === null ? "if-disabled" : "pointer option"
                    }`}
                    key={index}
                    style={{
                      borderColor: amount === item.amount ? "var(--black)" : "",
                      color: "var(--black)",
                    }}
                    onClick={() => handlePresetAmount(item.amount)}
                  >
                    <p className="p-medium gray-c">{item.entitle}</p>
                    <h4>{item.amount !== null ? item.amount : "N/A"}</h4>
                  </div>
                );
              })}
            </div>
            <button
              className={`btn ${
                amountWarning ? "btn-disabled" : "btn-normal"
              } btn-full`}
              onClick={onConfirmation}
            >
              {lnbcAmount ? t("AloNXcI", { amount }) : t("AMMzniY")}
            </button>
          </div>
        )}
        {confirmation === "in_progress" && (
          <div className="fx-centered fx-col fit-container">
            <QRCode
              style={{ width: "100%", aspectRatio: "1/1" }}
              size={400}
              value={invoice}
            />
            <div
              className="fx-scattered if pointer dashed-onH fit-container box-marg-s"
              style={{ borderStyle: "dashed" }}
              onClick={() => copyKey(invoice)}
            >
              <p>{shortenKey(invoice)}</p>
              <div className="copy-24"></div>
            </div>
            <div className="fit-container fx-centered">
              <p className="gray-c p-medium">{t("A1ufjMM")}</p>
              <LoadingDots />
            </div>
          </div>
        )}
        {confirmation === "confirmed" && (
          <div
            className="fx-centered fx-col fit-container"
            style={{ height: "16vh" }}
          >
            <div className="box-pad-v-s"></div>
            <h4>{t("ACDUO1d")}</h4>
            <p className="gray-c box-pad-v-s">
              {t("ALEgwqA")} <span className="orange-c">{amount} sats</span>
            </p>
            <button className="btn btn-normal" onClick={exit}>
              {t("Acglhzb")}
            </button>
          </div>
        )}
      </section>
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
          username: process.env.REACT_APP_ALBY_CLIENT_ID,
          password: process.env.REACT_APP_ALBY_SECRET_ID,
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
