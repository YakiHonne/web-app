import Date_ from "@/Components/Date_";
import LoadingDots from "@/Components/LoadingDots";
import { checkProofsStatus, swapTokensSameMint } from "@/Helpers/CashuHelpers";
import useSentTokensAsHash from "@/Hooks/useSentTokensAsHash";
import React, { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import Invoice from "./CachuWalletManagement/Invoice";
import OptionsDropdown from "@/Components/OptionsDropdown";
import DeleteWarning from "@/Components/DeleteWarning";

export default function CashuSentTokensAsHash({ cashuTokens }) {
  const { t } = useTranslation();
  const { tokensAsHash, updateStatus, removeToken } = useSentTokensAsHash();

  return (
    <div className="box-pad-v-m fit-container fx-centered fx-col box-pad-v">
      <div className="fx-centered fx-start-h fit-container fx-start-v fx-col">
        {tokensAsHash.map((token) => {
          return (
            <Token
              token={token}
              key={token.token}
              updateStatus={updateStatus}
              removeToken={removeToken}
              cashuTokens={cashuTokens}
            />
          );
        })}
      </div>
      {(!tokensAsHash || tokensAsHash?.length === 0) && (
        <div className="fx-centered fx-col" style={{ height: "30vh" }}>
          <h4>{t("AyWygca")}</h4>
          <p className="gray-c p-centered">{t("AOOxDRo")}</p>
        </div>
      )}
    </div>
  );
}

const Token = ({ token, updateStatus, removeToken, cashuTokens }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(token.status || "");
  const [showQR, setShowQR] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token.status !== "spent") {
      checkProofsStatus(token.mint, token.proofs).then((res) => {
        if (res.allSpent) {
          updateStatus(token.token);
          setStatus("spent");
        } else setStatus("pending");
      });
    }
  }, []);

  const claimBack = async () => {
    if (isLoading) return;
    setIsLoading(true);
    let check = await swapTokensSameMint({
      amount: token.amount,
      mint: token.mint,
      token: token.token,
      cashuTokens,
    });
    if (check.status) {
      updateStatus(token.token);
      setStatus("spent");
    }
    setIsLoading(false);
  };

  return (
    <>
      {showQR && (
        <Invoice
          invoice={token.token}
          exit={() => setShowQR(false)}
          title={t("AbSKmFw")}
          description={t("AMhGvtc")}
          message={t("Ar0bwCO")}
        />
      )}
      {showDelete && (
        <DeleteWarning
          exit={() => setShowDelete(false)}
          handleDelete={() => {
            removeToken(token.token);
            setShowDelete(false);
          }}
          title={t("AmqqFZ2")}
          description={t("AXcU13a")}
        />
      )}
      <div
        className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fit-container fx-scattered"
        style={{ overflow: "visible" }}
      >
        <div className="fx-centered">
          <h2>{token.amount}</h2>
          <div>
            <p className="gray-c">{token.unit}</p>
            <div className="fx-centered">
              <p>
                <Date_ toConvert={new Date(token.created_at)} />
              </p>
              <div className="sticker sticker-normal sticker-green-side">
                {token.mint}
              </div>
            </div>
          </div>
        </div>
        <div className="fx-centered">
          {status === "" && <LoadingDots />}
          {status === "pending" && (
            <button
              className="btn btn-normal btn-small"
              onClick={claimBack}
              disabled={isLoading}
            >
              {isLoading ? <LoadingDots /> : t("APEee0p")}
            </button>
          )}
          {status === "spent" && (
            <div className="fx-centered">
              <div className="checkmark"></div>
              <p className="green-c p-medium">{t("A3Dn0HW")}</p>
            </div>
          )}
          <OptionsDropdown
            options={[
              <div
                className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
                onClick={() => setShowQR(true)}
              >
                <p>{t("AGiADwc")}</p>
              </div>,
              <div
                className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
                onClick={() => setShowDelete(true)}
              >
                <p className="red-c">{t("Almq94P")}</p>
              </div>,
            ]}
          />
        </div>
      </div>
    </>
  );
};
