import Date_ from "@/Components/Date_";
import UserProfilePic from "@/Components/UserProfilePic";
import useUserProfile from "@/Hooks/useUsersProfile";
import React from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";

export default function CashuHistory({ cashuHistory }) {
  const { t } = useTranslation();
  if (!cashuHistory) return null;
  return (
    <div>
      <div className="fx-centered fx-col box-pad-v">
        {cashuHistory?.length > 0 && (
          <Virtuoso
            style={{ width: "100%", height: "100vh" }}
            skipAnimationFrameInResizeObserver={true}
            overscan={1000}
            useWindowScroll={true}
            totalCount={cashuHistory.length}
            increaseViewportBy={1000}
            itemContent={(index) => {
              let item = cashuHistory[index];
              return <CashuHistoryItem item={item} key={item.id} />;
            }}
          />
        )}
        {cashuHistory?.length === 0 && (
          <div className="fx-centered fx-col" style={{ height: "30vh" }}>
            <h4>{t("Ag3spMM")}</h4>
            <p className="gray-c p-centered">{t("AgaoyPx")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CashuHistoryItem = React.memo(({ item }) => {
  const { userProfile } = useUserProfile(item.sender);
  return (
    <div className="fit-container box-pad-h-m box-pad-v-m sc-s-18 bg-sp box-marg-s">
      {item.sender && (
        <TransactionFromUser item={item} userProfile={userProfile} />
      )}
      {!item.sender && <InternalTransaction item={item} />}
    </div>
  );
});

const InternalTransaction = React.memo(({ item }) => {
  const { t } = useTranslation();
  return (
    <div className="fx-centered fx-start-h">
      <div
        className="round-icon fx-centered"
        style={{
          backgroundColor: "var(--pale-gray)",
        }}
      >
        {item.sent ? (
          <p className="red-c">&#8593;</p>
        ) : (
          <p className="green-c">&#8595;</p>
        )}
      </div>
      <div className="fx-centered fx-col fx-start-h fx-start-v">
        <p className="gray-c p-medium">
          <Date_ toConvert={new Date(item.created_at * 1000)} time={true} />
        </p>
        <p>
          {item.sent
            ? t("ANGpcn3", {
                sats: item.amount,
              })
            : t("AYc8o1c", {
                sats: item.amount,
              })}
        </p>
      </div>
    </div>
  );
});

const TransactionFromUser = React.memo(({ item, userProfile }) => {
  const { t } = useTranslation();
  return (
    <div className="fx-centered fx-start-h">
      <div
        style={{
          position: "relative",
        }}
        className="fx-centered"
      >
        <UserProfilePic
          mainAccountUser={false}
          size={48}
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
        <p className="gray-c p-medium">
          <Date_ toConvert={new Date(item.created_at * 1000)} time={true} />
        </p>
        <p>
          {t("ATlhTRP", {
            sats: item.amount,
            name: userProfile.display_name || userProfile.name,
          })}
        </p>
      </div>
    </div>
  );
});
