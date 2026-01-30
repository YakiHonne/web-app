import { saveUsers } from "@/Helpers/DB";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import useMints from "./useMints";
import { parsNutZap } from "@/Helpers/Helpers";

export default function useCashu() {
  const userKeys = useSelector((state) => state.userKeys);
  const [activeMint, setActiveMint] = useState(false);
  const { getCustomMints } = useMints();
  const userCashuWallet = useSelector((state) => state.userCashuWallet);
  const userCashuTokens = useSelector((state) => state.userCashuTokens);
  const userCashuHistory = useSelector((state) => state.userCashuHistory);
  const userNutZaps = useSelector((state) => state.userNutZaps);
  const [cashuWallet, setCashuWallet] = useState(false);
  const [cashuWalletMints, setCashuWalletMints] = useState([]);
  const [cashuTokens, setCashuTokens] = useState(false);
  const [cashuHistory, setCashuHistory] = useState(false);
  const [cashuNutZaps, setCashuNutZaps] = useState(false);
  const [cashuTotalBalance, setCashuTotalBalance] = useState(0);
  const notInWalletMints = useMemo(() => {
    let inWalletMints = cashuWallet?.mints || [];
    let tokensMints = cashuTokens ? Object.keys(cashuTokens) : [];
    let mintsNotInList = tokensMints.filter(
      (mint) => !inWalletMints.includes(mint),
    );
    return mintsNotInList;
  }, [cashuTokens, cashuWallet]);

  useEffect(() => {
    let walletInfos = userCashuWallet.wallet?.content || [];
    let mints = [];
    let privkey;
    for (let data of walletInfos) {
      if (data[0] === "privkey") privkey = data[1];
      if (data[0] === "mint") mints.push(data[1]);
    }
    setCashuWallet({
      privkey,
      mints,
    });
    let activeMint = localStorage.getItem(`${userKeys.pub}-activeMint`);
    if (!activeMint && mints[0]) {
      localStorage.setItem(`${userKeys.pub}-activeMint`, mints[0]);
    }
    let isMintInWallet = mints.includes(activeMint);
    setActiveMint(isMintInWallet ? activeMint : mints[0]);
    getCustomMints(mints).then((mints) => {
      setCashuWalletMints(mints);
    });
  }, [userCashuWallet]);

  useEffect(() => {
    let mapTokens = {};
    let tokens = userCashuTokens?.tokens || [];
    let del = tokens
      .map((_) => _.token.content?.del || [])
      .filter((_) => _)
      .flat();
    let mints = [...new Set(tokens.map((token) => token.token.content.mint))];
    let totalBalance = 0;
    for (let mint of mints) {
      let tokens_ = tokens
        .filter(
          (token) =>
            token.token.content.mint === mint && !del.includes(token.token.id),
        )
        .map((token) => {
          return {
            proofs: token.token.content.proofs.map((_) => {
              return { ..._, amount: parseInt(_.amount) };
            }),
            amount: token.token.content.proofs.reduce(
              (total, proof) => total + parseInt(proof.amount),
              0,
            ),
            id: token.token.id,
            del: token.token.content?.del || [],
          };
        });
      let total = tokens_.reduce(
        (total, token) => total + parseInt(token.amount),
        0,
      );
      totalBalance += total;
      mapTokens[mint] = {
        mint,
        total,
        tokens: tokens_,
        allProofs: tokens_.map((proof) => proof.proofs).flat(),
      };
    }
    setCashuTotalBalance(totalBalance);
    setCashuTokens(mapTokens);
  }, [userCashuTokens]);

  useEffect(() => {
    let history = userCashuHistory?.history || [];
    let senders = [];
    let tokensRedeemed = [];
    history = history.map((h) => {
      let content = h.history.content;
      let sent = false;
      let amount = 0;
      let state = "created";
      let sender = "";
      let redeemed = "";
      for (let c of content) {
        if (c[0] === "direction" && c[1] === "out") sent = true;
        if (c[0] === "amount") amount = parseInt(c[1]) || 0;
        if (c[0] === "state") state = c[1];
      }
      let isRedeemed = h.history.tags.find(
        (tag) => tag[0] === "e" && tag[3] === "redeemed",
      );
      let isSender = h.history.tags.find((tag) => tag[0] === "p");
      if (isSender) {
        sender = isSender[1];
        senders.push(isSender[1]);
      }
      if (isRedeemed) {
        redeemed = isRedeemed[1];
        tokensRedeemed.push(isRedeemed[1]);
      }
      return {
        id: h.history.id,
        sent,
        amount,
        state,
        created_at: h.history.created_at,
        sender,
        redeemed,
      };
    });
    if (senders.length > 0) {
      saveUsers(senders);
    }
    setCashuHistory({ history, tokensRedeemed });
  }, [userCashuHistory]);

  useEffect(() => {
    if (userNutZaps?.zaps?.length === 0) return;

    let zaps = userNutZaps.zaps;
    let tokens = zaps.map((zap) => {
      return parsNutZap(zap);
    });

    setCashuNutZaps(tokens);
  }, [userNutZaps]);

  const changeActiveMint = (mint) => {
    setActiveMint(mint);
    localStorage.setItem(`${userKeys.pub}-activeMint`, mint);
  };

  return {
    cashuWallet,
    cashuTokens,
    cashuHistory,
    cashuTotalBalance,
    activeMint,
    changeActiveMint,
    notInWalletMints,
    cashuWalletMints,
    cashuNutZaps,
  };
}
