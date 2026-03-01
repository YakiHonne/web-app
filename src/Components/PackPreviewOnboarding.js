import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import UsersGroupProfilePicture from "@/Components/UsersGroupProfilePicture";
import { saveUsers } from "@/Helpers/DB";
import { Virtuoso } from "react-virtuoso";
import useUsersProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "@/Components/UserProfilePic";

export default function PackPreviewOnboarding({
  pack,
  handleSingleSelection,
  handleMultiSelection,
  selectedPubkeys,
}) {
  const { t } = useTranslation();
  const { userProfile } = useUsersProfile(pack.pubkey);
  const [showDetails, setShowDetails] = useState(false);
  const isAllFollowing = useMemo(() => {
    const supersetSet = new Set(selectedPubkeys);
    const isAllIncluded = pack.pTags.every((item) => supersetSet.has(item));
    return isAllIncluded;
  }, [selectedPubkeys]);

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
    saveUsers([...pack.pTags, pack.pubkey]);
  };

  return (
    <>
      <div
        className="fit-container fx-centered fx-col fx-start-v fx-start-h bg-sp pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleShowDetails();
        }}
        style={{ overflow: "visible" }}
      >
        <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m ">
          <div className="fx-centered fx-start-v fx-start-h fit-container">
            <div
              style={{
                backgroundImage: `url(${pack.image})`,
                backgroundColor: "var(--pale-gray)",
                minWidth: "40px",
                minHeight: "40px",
                borderRadius: "50%",
              }}
              className="bg-img cover-bg"
            ></div>
            <div className="fx-centered fx-col fx-start-v fit-container">
              <div className="fit-container fx-scattered fx-start-v">
                <div>
                  <p className="p-maj p-big">{pack.title}</p>
                  <p className={`gray-c  ${showDetails ? "" : "p-one-line"}`}>
                    {pack.description || (
                      <span className="p-italic">{t("AtZrjns")}</span>
                    )}
                  </p>
                </div>
                <button
                  className={`btn btn-normal btn-small ${isAllFollowing ? "btn-gst" : "btn-normal"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMultiSelection({
                      pubkeys: pack.pTags,
                      action: isAllFollowing ? "remove" : "add",
                    });
                  }}
                  style={{ minWidth: "max-content" }}
                >
                  {isAllFollowing ? t("AyohNeT") : t("AzkUxnd")}
                </button>
              </div>
              {!showDetails && (
                <div className="fx-centered">
                  <UsersGroupProfilePicture
                    pubkeys={pack.pTags}
                    number={5}
                    imgSize={24}
                  />
                  {pack.pCount > 5 && (
                    <p className="c1-c">
                      {t("AZzyBMI", { count: pack.pCount - 5 })}
                    </p>
                  )}
                </div>
              )}
              {showDetails && (
                <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
                  <p className="c1-c">{t("AvsIRth")}</p>
                  <div className="fx-centered">
                    <div>
                      <UserProfilePic
                        pubkey={userProfile.pubkey}
                        img={userProfile.picture}
                        size={20}
                      />
                    </div>
                    <div>
                      <p>{userProfile.display_name || userProfile.name}</p>
                    </div>
                  </div>
                </div>
              )}
              {showDetails && (
                <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
                  <p className="c1-c">
                    {t("AjTO4lm")} ({pack.pCount})
                  </p>
                  <Virtuoso
                    style={{ width: "100%", height: "300px" }}
                    skipAnimationFrameInResizeObserver={true}
                    overscan={200}
                    totalCount={pack.pTags.length}
                    increaseViewportBy={200}
                    itemContent={(index) => {
                      let pubkey = pack.pTags[index];
                      let isAdded = selectedPubkeys.includes(pubkey);
                      return (
                        <UserToFollow
                          pubkey={pubkey}
                          onClick={handleSingleSelection}
                          isAdded={isAdded}
                        />
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const UserToFollow = React.memo(({ pubkey, onClick, isAdded }) => {
  const { t } = useTranslation();
  const { userProfile } = useUsersProfile(pubkey);
  const handleOnClick = (e) => {
    e.stopPropagation();
    if (isAdded) onClick({ pubkey, action: "remove" });
    else onClick({ pubkey, action: "add" });
  };
  return (
    <div className="fit-container fx-scattered box-marg-s">
      <div className="fx-centered">
        <div>
          <UserProfilePic pubkey={pubkey} img={userProfile.picture} size={20} />
        </div>
        <div>
          <p>{userProfile.display_name || userProfile.name}</p>
        </div>
      </div>
      <button
        onClick={handleOnClick}
        className={`btn btn-small ${isAdded ? "btn-gst" : "btn-normal"}`}
      >
        {isAdded ? t("ASi0a0d") : t("AzkUxnd")}
      </button>
    </div>
  );
});
