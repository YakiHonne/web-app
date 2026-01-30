import { Wallet } from "@cashu/cashu-ts";
import { t } from "i18next";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { InitEvent } from "./Controlers";
import { encrypt44 } from "./Encryptions";
import { store } from "@/Store/Store";
import { getKeys } from "./ClientHelpers";
import { getEncodedTokenV4 } from "@cashu/cashu-ts";

export const swapTokensMinToOtherMint = async ({
  amount,
  mintFrom,
  mintTo,
  cashuTokens,
  externalProofs = false,
  noNostrPublishing = false,
  cb,
}) => {
  try {
    const walletTo = new Wallet(mintTo);
    await walletTo.loadMint();
    const walletFrom = new Wallet(mintFrom);
    await walletFrom.loadMint();

    let preMintQuote = await walletTo.createMintQuoteBolt11(parseInt(amount));
    let preMeltQuote = await walletFrom.createMeltQuoteBolt11(
      preMintQuote.request,
    );
    const baseAmount = preMeltQuote.amount - preMeltQuote.fee_reserve;

    let mintQuote = await walletTo.createMintQuoteBolt11(parseInt(baseAmount));

    let meltQuote = await walletFrom.createMeltQuoteBolt11(mintQuote.request);
    const amountToSend = meltQuote.amount + meltQuote.fee_reserve;
    if (cb) cb(meltQuote.fee_reserve);

    if (externalProofs && amountToSend > (cashuTokens[mintFrom]?.total || 0)) {
      store.dispatch(
        setToast({
          type: 2,
          desc: t("AKSCl5b"),
        }),
      );
      return { status: false };
    }

    const proofs = externalProofs || cashuTokens[mintFrom]?.allProofs || [];
    let state = await walletFrom.checkProofsStates(proofs);
    let indexes = [];
    for (let i = 0; i < state.length; i++) {
      if (state[i].state === "UNSPENT") indexes.push(i);
    }
    let unspentProofs = proofs.filter((_, index) => indexes.includes(index));
    let spentTokens = proofs.filter((_, index) => !indexes.includes(index));
    if (spentTokens.length > 0) {
      return { status: false, spentTokens };
    }
    let proofs_ = getProofsToUse(amount, unspentProofs);
    const { keep, send } = await walletFrom.send(amountToSend, proofs_.proofs, {
      includeFees: true,
    });

    const meltResponse = await walletFrom.meltProofsBolt11(meltQuote, send);
    if (!meltResponse.change) {
      return { status: false };
    }

    const receivedProofs = await walletTo.mintProofsBolt11(
      meltQuote.amount,
      mintQuote.quote,
    );

    if (noNostrPublishing) {
      return {
        status: true,
        receivedProofs,
        baseAmount,
        toKeep: keep,
        toSend: send,
        proofsToSplitCs: proofs_.Cs,
      };
    }

    await publishProofs({
      proofsToSplitCs: proofs_.Cs,
      proofsToSpend: send,
      proofsToKeep: keep,
      receivedProofs,
      amountToSend,
      baseAmount,
      mintFrom,
      mintTo,
      cashuTokens,
    });
    return { status: true };
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: err.message,
      }),
    );
    return { status: false };
  }
};

export const swapTokensInvoiceFromMint = async ({
  mintFrom,
  invoice,
  cashuTokens,
  externalProofs = false,
  noNostrPublishing = false,
  cb,
}) => {
  try {
    const walletFrom = new Wallet(mintFrom);
    await walletFrom.loadMint();

    let meltQuote = await walletFrom.createMeltQuoteBolt11(invoice);
    const amountToSend = meltQuote.amount + meltQuote.fee_reserve;
    if (cb) cb(meltQuote.fee_reserve);

    if (externalProofs && amountToSend > (cashuTokens[mintFrom]?.total || 0)) {
      store.dispatch(
        setToast({
          type: 2,
          desc: t("AKSCl5b"),
        }),
      );
      return { status: false };
    }

    const proofs = externalProofs || cashuTokens[mintFrom]?.allProofs || [];
    let state = await walletFrom.checkProofsStates(proofs);
    let indexes = [];
    for (let i = 0; i < state.length; i++) {
      if (state[i].state === "UNSPENT") indexes.push(i);
    }
    let unspentProofs = proofs.filter((_, index) => indexes.includes(index));
    let spentTokens = proofs.filter((_, index) => !indexes.includes(index));
    if (spentTokens.length > 0) {
      return { status: false, spentTokens };
    }
    let proofs_ = getProofsToUse(amountToSend, unspentProofs);
    if (proofs_.proofs?.length === 0) {
      return { status: false };
    }
    const { keep, send } = await walletFrom.send(amountToSend, proofs_.proofs, {
      includeFees: true,
    });

    const meltResponse = await walletFrom.meltProofsBolt11(meltQuote, send);
    if (!meltResponse.change) {
      return { status: false };
    }

    if (noNostrPublishing) {
      return {
        status: true,
        receivedProofs: [],
        baseAmount: amountToSend,
        toKeep: keep,
        toSend: send,
        proofsToSplitCs: proofs_.Cs,
      };
    }

    await publishProofs({
      proofsToSplitCs: proofs_.Cs,
      proofsToSpend: send,
      proofsToKeep: keep,
      amountToSend,
      baseAmount: amountToSend,
      mintFrom,
      cashuTokens,
    });
    return { status: true };
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: err.message,
      }),
    );
    return { status: false };
  }
};

export const swapTokensSameMint = async ({
  amount,
  mint,
  token,
  cashuTokens,
}) => {
  try {
    const wallet = new Wallet(mint);
    await wallet.loadMint();
    const receivedProofs = await wallet.receive(token);
    await publishProofs({
      proofsToSpend: [],
      proofsToKeep: [],
      receivedProofs,
      amountToSend: amount,
      baseAmount: amount,
      mintTo: mint,
      cashuTokens,
    });
    return { status: true };
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: err.message,
      }),
    );
    return { status: false };
  }
};
export const redeemToken = async ({
  amount,
  mint,
  proofs,
  cashuTokens,
  privkey,
  sender,
  nutZapId,
}) => {
  try {
    let token = getEncodedTokenV4({ mint, proofs });
    const wallet = new Wallet(mint);
    await wallet.loadMint();

    const receivedProofs = await wallet.receive(token, { privkey });
    let receivedProofsHistoryTags = [
      ["e", nutZapId, "", "redeemed"],
      ["p", sender],
    ];
    await publishProofs({
      proofsToSpend: [],
      proofsToKeep: [],
      receivedProofs,
      receivedProofsHistoryTags,
      amountToSend: amount,
      baseAmount: amount,
      mintTo: mint,
      cashuTokens,
    });
    return { status: true };
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: err.message,
      }),
    );
    return { status: false };
  }
};

export const publishProofs = async ({
  proofsToSplitCs = [],
  proofsToSpend,
  proofsToKeep,
  receivedProofs,
  amountToSend,
  cashuTokens,
  mintFrom,
  mintTo,
  baseAmount,
  receivedProofsHistoryTags = [],
}) => {
  let proofsCs = [
    ...new Set([...proofsToSpend.map((proof) => proof.C), ...proofsToSplitCs]),
  ];
  let allProofsCs =
    (cashuTokens &&
      cashuTokens[mintFrom]?.allProofs?.map((proof) => proof.C)) ||
    [];
  let proofsExchange = proofsToKeep.filter((_) => !allProofsCs.includes(_.C));
  let usedProofs =
    (cashuTokens &&
      cashuTokens[mintFrom]?.tokens?.filter((_) =>
        _.proofs.some((proof) => proofsCs.includes(proof.C)),
      )) ||
    [];
  let usedProofsIds = usedProofs.map((_) => _.id);
  let proofsToDelete = usedProofsIds.map((_) => ["e", _]);
  let proofsToDestroyAsHistory = usedProofsIds.map((_) => [
    "e",
    _,
    "",
    "destroyed",
  ]);
  let remainedProofs = [
    ...usedProofs
      .map((_) => {
        let arr = _.proofs.filter((proof) => !proofsCs.includes(proof.C));
        return arr;
      })
      .flat(),
    ...proofsExchange,
  ].filter((proof, index, arr) => {
    if (arr.findIndex((_) => _.C === proof.C) === index) return proof;
  });

  if (proofsToSpend.length > 0) {
    let createdTokenFromMint = await publishNewTokens(
      remainedProofs,
      mintFrom,
      usedProofsIds,
    );
    await deleteSpentTokens(proofsToDelete);
    await publishHistory({
      createdToken: createdTokenFromMint.id,
      destroyedTokens: proofsToDestroyAsHistory,
      direction: "out",
      amount: amountToSend,
    });
  }
  if (!receivedProofs) return;
  let createdTokenToMint = await publishNewTokens(receivedProofs, mintTo, []);
  await publishHistory({
    createdToken: createdTokenToMint.id,
    destroyedTokens: [],
    direction: "in",
    amount: baseAmount,
    tags: receivedProofsHistoryTags,
  });
};

const publishNewTokens = async (proofs, mint, toDelete = []) => {
  let userKeys = getKeys();
  let content = {
    mint,
    unit: "sat",
    proofs,
    del: toDelete,
  };
  let encryptedContent = await encrypt44(
    userKeys,
    userKeys.pub,
    JSON.stringify(content),
  );
  if (!encryptedContent) return;
  const eventInitEx = await InitEvent(7375, encryptedContent, []);
  if (!eventInitEx) return;
  store.dispatch(setToPublish({ eventInitEx }));
  return eventInitEx;
};

const deleteSpentTokens = async (ids) => {
  const eventInitEx = await InitEvent(5, "Remove spent proofs", [
    ...ids,
    ["kind", "7375"],
  ]);
  if (!eventInitEx) return;
  store.dispatch(setToPublish({ eventInitEx }));
};

const publishHistory = async ({
  createdToken,
  destroyedTokens = [],
  direction,
  amount,
  tags = [],
}) => {
  let userKeys = getKeys();
  let content = [
    ["direction", direction],
    ["amount", `${amount}`],
    ["e", createdToken, "", "created"],
    ...destroyedTokens,
  ];
  let encryptedContent = await encrypt44(
    userKeys,
    userKeys.pub,
    JSON.stringify(content),
  );
  if (!encryptedContent) return;
  const eventInitEx = await InitEvent(7376, encryptedContent, tags);
  if (!eventInitEx) return;
  store.dispatch(setToPublish({ eventInitEx }));
};

export const checkProofsStatus = async (mint, proofs) => {
  try {
    const wallet = new Wallet(mint);
    await wallet.loadMint();
    let state = await wallet.checkProofsStates(proofs);
    let indexes = [];
    for (let i = 0; i < state.length; i++) {
      if (state[i].state === "UNSPENT") indexes.push(i);
    }
    let unspentProofs = proofs.filter((_, index) => indexes.includes(index));
    let spentTokens = proofs.filter((_, index) => !indexes.includes(index));
    return { unspentProofs, spentTokens, allSpent: unspentProofs.length === 0 };
  } catch (err) {
    return false;
  }
};

export const generateToken = async ({ mint, proofs, amount, memo = "" }) => {
  try {
    const wallet = new Wallet(mint);
    await wallet.loadMint();

    const { keep, send } = await wallet.send(amount, proofs);
    const token = getEncodedTokenV4({ mint: mint, proofs: send, memo });
    return { token, send, keep };
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: err.message,
      }),
    );
    return false;
  }
};

export const sendP2PKLockedToken = async ({
  mint,
  receiverMints,
  proofs,
  amount,
  memo,
  receiverPubkey,
  receiverWalletPubkey,
  cashuTokens,
}) => {
  try {
    let isSameMint = receiverMints.includes(mint);
    if (isSameMint) {
      let proofs_ = getProofsToUse(amount, proofs);
      const wallet = new Wallet(mint);
      await wallet.loadMint();
      const { keep, send } = await wallet.ops
        .send(amount, proofs_.proofs)
        .asP2PK({ pubkey: receiverWalletPubkey })
        .run();
      await publishProofs({
        proofsToSplitCs: proofs_.Cs,
        proofsToKeep: keep,
        proofsToSpend: send,
        amountToSend: amount,
        baseAmount: amount,
        cashuTokens,
        mintFrom: mint,
      });
      let status = await publishNutzapEvent({
        memo,
        mint,
        proofs: send,
        receiverPubkey,
      });
      return status;
    }
    let mintTo = receiverMints[0];
    let res = await swapTokensMinToOtherMint({
      amount,
      mintFrom: mint,
      mintTo,
      cashuTokens,
      noNostrPublishing: true,
    });
    if (!res) return false;
    let { receivedProofs, baseAmount, toKeep, toSend, proofsToSplitCs } = res;
    await publishProofs({
      proofsToSplitCs,
      proofsToKeep: toKeep,
      proofsToSpend: toSend,
      amountToSend: amount,
      baseAmount: baseAmount,
      cashuTokens,
      mintFrom: mint,
    });
    const wallet = new Wallet(mintTo);
    await wallet.loadMint();
    const { send } = await wallet.ops
      .send(baseAmount, receivedProofs)
      .asP2PK({ pubkey: receiverWalletPubkey })
      .run();

    let status = await publishNutzapEvent({
      memo,
      mint: mintTo,
      proofs: send,
      receiverPubkey,
    });
    return status;
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: err.message,
      }),
    );
    return false;
  }
};

const publishNutzapEvent = async ({ memo, mint, proofs, receiverPubkey }) => {
  let content = memo;
  let tags = [
    ...proofs.map((proof) => ["proof", JSON.stringify(proof)]),
    ["u", mint],
    ["p", receiverPubkey],
  ];
  const eventInitEx = await InitEvent(9321, content, tags);
  if (!eventInitEx) return;
  store.dispatch(setToPublish({ eventInitEx }));
  return true;
};

const getProofsToUse = (amount, proofs) => {
  const sortedProofs = [...proofs].sort((a, b) => b.amount - a.amount);
  let total = 0;
  const selectedProofs = [];
  const isExactAmount = sortedProofs.find((proof) => proof.amount === amount);
  if (isExactAmount) {
    return {
      proofs: [isExactAmount],
      Cs: [isExactAmount.C],
    };
  }
  for (const proof of sortedProofs) {
    if (total >= amount) break;
    total += proof.amount;
    selectedProofs.push(proof);
  }

  if (total < amount) {
    return {
      proofs: [],
      Cs: [],
    };
  }

  return {
    proofs: selectedProofs,
    Cs: selectedProofs.map((proof) => proof.C),
  };
};
