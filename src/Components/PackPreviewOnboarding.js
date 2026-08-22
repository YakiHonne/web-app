import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import UsersGroupProfilePicture from "@/Components/UsersGroupProfilePicture";
import { saveUsers } from "@/Helpers/DB";
import useUsersProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "@/Components/UserProfilePic";

export default function PackPreviewOnboarding({
  pack,
  handleSingleSelection,
  handleMultiSelection,
  selectedPubkeys,
}) {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(false);
  const isAllFollowing = useMemo(() => {
    const s = new Set(selectedPubkeys);
    return pack.pTags.every((item) => s.has(item));
  }, [selectedPubkeys]);

  const handleOpen = () => {
    setShowOverlay(true);
    saveUsers([...pack.pTags, pack.pubkey]);
  };

  useEffect(() => {
    if (!showOverlay) return;
    const onKey = (e) => { if (e.key === "Escape") setShowOverlay(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showOverlay]);

  return (
    <>
      <div
        className="pack-card pointer"
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
      >
        <div
          className="pack-card-img"
          style={{ backgroundImage: `url(${pack.image})`, backgroundColor: "var(--pale-gray)" }}
        ></div>
        <div className="pack-card-body">
          <p className="pack-card-title p-one-line">{pack.title}</p>
          <div className="pack-card-meta">
            <UsersGroupProfilePicture pubkeys={pack.pTags} number={3} imgSize={22} />
            {pack.pCount > 3 && (
              <p className="gray-c p-medium">{t("AZzyBMI", { count: pack.pCount - 3 })}</p>
            )}
          </div>
        </div>
        <div
          className={`pack-card-btn ${isAllFollowing ? "pack-card-btn--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleMultiSelection({ pubkeys: pack.pTags, action: isAllFollowing ? "remove" : "add" });
          }}
        >
          {isAllFollowing ? t("AyohNeT") : t("AzkUxnd")}
        </div>
      </div>

      {showOverlay && createPortal(
        <PackOverlay
          pack={pack}
          isAllFollowing={isAllFollowing}
          handleMultiSelection={handleMultiSelection}
          handleSingleSelection={handleSingleSelection}
          selectedPubkeys={selectedPubkeys}
          onClose={() => setShowOverlay(false)}
        />,
        document.body
      )}
    </>
  );
}

function PackOverlay({ pack, isAllFollowing, handleMultiSelection, handleSingleSelection, selectedPubkeys, onClose }) {
  const { t } = useTranslation();
  const [descExpanded, setDescExpanded] = useState(false);
  const [showList, setShowList] = useState(false);

  const descLong = pack.description && pack.description.length > 200;

  return (
    <div className="pack-overlay-backdrop" onClick={onClose}>
      <div
        className="pack-overlay-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="pack-overlay-close" onClick={onClose}>
          <span></span><span></span>
        </button>

        {pack.image && (
          <div
            className="pack-overlay-img"
            style={{ backgroundImage: `url(${pack.image})` }}
          ></div>
        )}

        <div className="pack-overlay-content">
          <h3 className="pack-overlay-title">{pack.title}</h3>

          {pack.description && (
            <div className="pack-overlay-desc-wrap">
              <p className={`pack-overlay-desc gray-c ${!descExpanded && descLong ? "pack-overlay-desc--clamped" : ""}`}>
                {pack.description}
              </p>
              {descLong && (
                <button
                  className="pack-overlay-see-more"
                  onClick={() => setDescExpanded((v) => !v)}
                >
                  {descExpanded ? t("ASeeLess") : t("AnWFKlu")}
                </button>
              )}
            </div>
          )}

          <div className="pack-overlay-meta">
            <UsersGroupProfilePicture pubkeys={pack.pTags} number={5} imgSize={26} />
            <p className="gray-c p-medium">{pack.pCount} {t("AJ1Zfct")}</p>
          </div>

          <div
            className={`pack-overlay-follow-btn ${isAllFollowing ? "pack-overlay-follow-btn--active" : ""}`}
            onClick={() => handleMultiSelection({ pubkeys: pack.pTags, action: isAllFollowing ? "remove" : "add" })}
          >
            {isAllFollowing ? t("AyohNeT") : t("AzkUxnd")}
          </div>

          <button
            className="pack-overlay-see-list-btn"
            onClick={() => setShowList((v) => !v)}
          >
            {showList ? t("AHidePackList") : t("ASeeWhoInPack")}
          </button>
        </div>

        {showList && (
          <div className="pack-overlay-list">
            {pack.pTags.map((pubkey) => {
              const isAdded = selectedPubkeys.includes(pubkey);
              return (
                <OverlayUserRow
                  key={pubkey}
                  pubkey={pubkey}
                  isAdded={isAdded}
                  onClick={handleSingleSelection}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const OverlayUserRow = React.memo(({ pubkey, isAdded, onClick }) => {
  const { userProfile } = useUsersProfile(pubkey);
  return (
    <div
      className="pack-user-row"
      onClick={() => onClick({ pubkey, action: isAdded ? "remove" : "add" })}
    >
      <UserProfilePic pubkey={pubkey} img={userProfile.picture} size={36} />
      <div className="pack-user-info">
        <p className="pack-user-name">{userProfile.display_name || userProfile.name || "…"}</p>
      </div>
      <div className={`pack-user-check ${isAdded ? "pack-user-check--on" : ""}`}></div>
    </div>
  );
});
