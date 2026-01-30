import Date_ from "@/Components/Date_";
import LoadingDots from "@/Components/LoadingDots";
import UserProfilePic from "@/Components/UserProfilePic";
import { redeemToken } from "@/Helpers/CashuHelpers";
import useUserProfile from "@/Hooks/useUsersProfile";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";

export default function CashuNutZaps({
  cashuNutZaps,
  cashuTokens,
  privkey,
  redeemedTokens,
}) {
  const { t } = useTranslation();
  console.log(cashuNutZaps);
  return (
    <div>
      <div className="fx-centered fx-col box-pad-v">
        {cashuNutZaps?.length > 0 && (
          <Virtuoso
            style={{ width: "100%", height: "100vh" }}
            skipAnimationFrameInResizeObserver={true}
            overscan={1000}
            useWindowScroll={true}
            totalCount={cashuNutZaps.length}
            increaseViewportBy={1000}
            itemContent={(index) => {
              let item = cashuNutZaps[index];
              let isRedeemed = redeemedTokens.includes(item.id);
              return (
                <CashuNutZapItem
                  item={item}
                  key={item.id}
                  cashuTokens={cashuTokens}
                  privkey={privkey}
                  isRedeemed={isRedeemed}
                />
              );
            }}
          />
        )}
        {(!cashuNutZaps || cashuNutZaps?.length === 0) && (
          <div className="fx-centered fx-col" style={{ height: "30vh" }}>
            <h4>{t("AH4qU3w")}</h4>
            <p className="gray-c p-centered">{t("AHJrjUo")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CashuNutZapItem = React.memo(
  ({ item, cashuTokens, privkey, isRedeemed }) => {
    const { t } = useTranslation();
    const { userProfile } = useUserProfile(item.pubkey);
    const [isLoading, setIsLoading] = useState(false);

    const redeem = async () => {
      if (isLoading) return;
      setIsLoading(true);
      await redeemToken({
        amount: item.amount,
        mint: item.mint,
        proofs: item.proofs,
        privkey,
        cashuTokens,
        nutZapId: item.id,
        sender: item.pubkey,
      });
      setIsLoading(false);
    };
    return (
      <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m sc-s-18 bg-sp box-marg-s">
        <div className="fx-centered fx-start-h">
          <div
            style={{
              position: "relative",
            }}
            className="fx-centered"
          >
            <UserProfilePic
              mainAccountUser={false}
              size={64}
              user_id={userProfile.pubkey}
              img={userProfile?.picture}
            />
            <div
              className="round-icon-small"
              style={{
                position: "absolute",
                scale: ".65",
                backgroundColor: "var(--pale-gray)",
                right: "-5px",
                bottom: "-10px",
              }}
            >
              <p className="green-c">&#8595;</p>
            </div>
          </div>
          <div className="fx-centered fx-col fx-start-h fx-start-v">
            <div className="fx-centered">
              <p className="gray-c p-medium">
                <Date_
                  toConvert={new Date(item.created_at * 1000)}
                  time={true}
                />
              </p>
              {item.mint && (
                <div className="sticker sticker-normal sticker-green-side">
                  {item.mint}
                </div>
              )}
            </div>
            <p>
              {t("A3aCq3H", {
                sats: item.amount,
                name: userProfile.display_name || userProfile.name,
              })}
            </p>
            {item.message && (
              <p>
                <span className="gray-c">Memo: </span> {item.message || "N/A"}
              </p>
            )}
          </div>
        </div>
        <div className="fx-centered">
          {!isRedeemed && (
            <button
              className="btn btn-normal"
              onClick={redeem}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingDots />
              ) : (
                t("A0FXaKJ", { amount: item.amount })
              )}
            </button>
          )}
          {isRedeemed && (
            <div className="fx-centered">
              <div className="checkmark"></div>
              <p className="green-c p-medium">{t("A3Dn0HW")}</p>
            </div>
          )}
        </div>
      </div>
    );
  },
);
