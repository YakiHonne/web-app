import NProfilePreviewer from "@/Components/NProfilePreviewer";
import UserSearchBar from "@/Components/UserSearchBar";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Mintslist from "../../MintsList";
import useCashu from "@/Hooks/useCachu";
import { getSubData } from "@/Helpers/Controlers";
import LoadingDots from "@/Components/LoadingDots";
import { sendP2PKLockedToken } from "@/Helpers/CashuHelpers";

export default function NutZap({ exit }) {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [receiverWallet, setReceiverWallet] = useState(null);
  const [mintFrom, setMintFrom] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const { cashuTokens, cashuWalletMints } = useCashu();

  const isSendingEnabled = useMemo(() => {
    if (
      !cashuTokens ||
      !mintFrom ||
      !receiverWallet ||
      receiverWallet?.mints?.length === 0 ||
      amount <= 0 ||
      amount > cashuTokens[mintFrom.url]?.total
    )
      return false;
    return true;
  }, [cashuTokens, mintFrom, amount, receiverWallet]);

  useEffect(() => {
    if (cashuWalletMints.length > 0) {
      setMintFrom(cashuWalletMints[0]);
    }
  }, [cashuWalletMints]);

  const handleSearchUser = async (userPubkey) => {
    setIsUserLoading(true);
    let userW = await getSubData([{ authors: [userPubkey], kinds: [10019] }]);
    setSelectedUser(userPubkey);
    if (userW.data.length > 0) {
      let event = userW.data[0];
      let relays = [];
      let mints = [];
      let pubkey;
      for (let tag of event.tags) {
        if (tag[0] === "pubkey") pubkey = tag[1];
        if (tag[0] === "relay") relays.push(tag[1]);
        if (tag[0] === "mint") mints.push(tag[1]);
      }
      if (pubkey && mints.length > 0) {
        setReceiverWallet({
          pubkey,
          mints,
          relays,
        });
      }
    }
    setIsUserLoading(false);
  };

  const handleSend = async () => {
    if (isLoading || !isSendingEnabled) return;
    setIsLoading(true);
    let status = await sendP2PKLockedToken({
      mint: mintFrom.url,
      receiverMints: receiverWallet.mints,
      proofs: cashuTokens[mintFrom.url]?.allProofs,
      amount,
      memo: message,
      receiverWalletPubkey: `02${receiverWallet.pubkey}`,
      receiverPubkey: selectedUser,
      cashuTokens,
    });
    setIsLoading(false);
    if (status) {
      exit();
    }
  };

  return (
    <div
      className="fit-container fx-centered fx-col fx-sart-h fx-start-v"
      style={{ gap: "24px" }}
    >
      <div className="fit-container fx-centered fx-start-h" onClick={exit}>
        <div className="round-icon-small">
          <div className="arrow" style={{ rotate: "90deg" }}></div>
        </div>
        <p>NutZap</p>
      </div>

      <div className="fit-container fx-centered fx-start-h fx-col">
        {cashuWalletMints.length > 0 && mintFrom && (
          <Mintslist
            list={cashuWalletMints}
            label={t("AirVYTX")}
            selectedMint={mintFrom}
            setSelectedMint={setMintFrom}
            cashuTokens={cashuTokens}
            balancePosition="right"
          />
        )}
        {!selectedUser && !isUserLoading && (
          <>
            <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
              <p className="p-bold box-pad-h-m ">{t("A1KAaIM")}</p>
              <UserSearchBar onClick={handleSearchUser} full={true} />
            </div>
            <div
              className="fit-container fx-centered fx-col box-pad-h "
              style={{ height: "20vh" }}
            >
              <div
                className="user"
                style={{ minHeight: "32px", minWidth: "32px" }}
              ></div>
              <h4>{t("AwsMysv")}</h4>
              <p className="p-centered gray-c">{t("AAVtClb")}</p>
            </div>
          </>
        )}
        {selectedUser && !isUserLoading && (
          <div className="fx-centered fx-col fx-start-v fit-container">
            <p className="p-bold box-pad-h-m ">{t("A1KAaIM")}</p>
            <NProfilePreviewer
              pubkey={selectedUser}
              close={true}
              onClose={() => {
                setReceiverWallet(null);
                setSelectedUser(null);
              }}
            />
          </div>
        )}
        {receiverWallet && (
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("Ark6BLW")}
            />
          </>
        )}
        {!receiverWallet && selectedUser && (
          <div
            className="fit-container fx-centered fx-col box-pad-h "
            style={{ height: "20vh" }}
          >
            <h4>{t("AshKlYe")}</h4>
            <p className="p-centered gray-c">{t("A1Lthsi")}</p>
          </div>
        )}
        {isUserLoading && (
          <div
            className="fit-container fx-centered fx-col box-pad-h "
            style={{ height: "20vh" }}
          >
            <LoadingDots />
          </div>
        )}
        {receiverWallet && (
          <button
            className={`btn btn-full ${
              isSendingEnabled ? "btn-normal" : "btn-disabled"
            }`}
            disabled={!isSendingEnabled || isLoading}
            onClick={handleSend}
          >
            {isLoading ? <LoadingDots /> : t("A14LwWS")}
          </button>
        )}
      </div>
    </div>
  );
}
