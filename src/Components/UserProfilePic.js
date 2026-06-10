import { nip19 } from "nostr-tools";
import React, { useEffect, useRef, useState, useCallback } from "react";
import InitiConvo from "@/Components/InitConvo";
import { checkForLUDS, getuserMetadata } from "@/Helpers/Encryptions";
import ZapTip from "@/Components/ZapTip";
import { useSelector } from "react-redux";
import { getUser } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { getMutualFollows, getUserStats } from "@/Helpers/WSInstance";
import { customHistory } from "@/Helpers/History";
import { getCustomSettings } from "@/Helpers/ClientHelpers";
import NumberShrink from "@/Components/NumberShrink";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { useTranslation } from "react-i18next";
import Follow from "@/Components/Follow";
import useUserProfile from "@/Hooks/useUsersProfile";
import AvatarPlaceholder from "./AvatarPlaceholder";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 420;

const ISLAND_STYLES = `
  @keyframes island-expand {
    0%   { opacity: 0; transform: scale(0.48); filter: blur(10px); }
    65%  { opacity: 1; filter: blur(0);        transform: scale(1.04); }
    100% { opacity: 1; filter: blur(0);        transform: scale(1); }
  }
  @keyframes island-body-in {
    0%   { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* Card shell — transparent so photo fills top, glass panel at bottom */
  .isl-card {
    position: fixed;
    width: ${CARD_WIDTH}px;
    border-radius: 28px;
    overflow: hidden;
    z-index: 99999;
    background: transparent;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.10),
      0 4px 8px rgba(0,0,0,0.18),
      0 20px 56px rgba(0,0,0,0.44),
      0 40px 80px rgba(0,0,0,0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    opacity: 0;
    transform: scale(0.48);
    pointer-events: none;
  }
  .isl-card.isl-visible {
    animation: island-expand 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    pointer-events: auto;
  }

  /* Photo is position:absolute and fills the entire card */
  .isl-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(145deg, var(--c1) 0%, #180028 100%);
  }
  .isl-bg img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }
  /* Gradient: clear → very dark, covering the lower 70% of the card */
  .isl-bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0)    15%,
      rgba(0,0,0,0.18) 38%,
      rgba(0,0,0,0.58) 57%,
      rgba(0,0,0,0.82) 72%,
      rgba(0,0,0,0.90) 100%
    );
  }

  /* Content sits on top of the absolute photo */
  .isl-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    height: ${CARD_HEIGHT}px;
  }
  .isl-spacer { flex: 1; min-height: 120px; }

  /* Name + bio overlay on gradient */
  .isl-info {
    padding: 0 16px 10px;
    animation: island-body-in 0.3s 0.08s ease both;
  }
  .isl-name-row {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 4px;
  }
  .isl-name {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    letter-spacing: -0.4px;
  }
  .isl-bio {
    font-size: 16px;
    line-height: 1.48;
    color: rgba(255,255,255,0.82);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Frosted glass panel — stats + actions */
  .isl-glass {
    position: relative;
    isolation: isolate;
    background: linear-gradient(to bottom, rgba(12, 12, 16, 0.0) 0%, rgba(12, 12, 16, 0.88) 100%);
    animation: island-body-in 0.3s 0.12s ease both;
  }
  /* Pseudo-element carries the blur, masked so it fades from transparent at top to solid at bottom */
  .isl-glass::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    -webkit-backdrop-filter: blur(10px) saturate(1.6);
    backdrop-filter: blur(10px) saturate(1.6);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 45%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 45%);
    pointer-events: none;
  }

  /* Stats: 3 columns, thin white dividers, no background */
  .isl-stats {
    display: grid;
    grid-template-columns: 1fr 1px 1fr 1px 1fr;
    align-items: center;
    padding: 11px 0 9px;
  }
  .isl-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 0 6px;
  }
  .isl-stat-val {
    font-size: 16px;
    color: #fff;
    letter-spacing: -0.3px;
    line-height: 1.2;
    white-space: nowrap;
  }
  .isl-stat-lbl {
    font-size: 12px;
    color: rgba(255,255,255,0.62);
    white-space: nowrap;
  }
  .isl-stat-sep {
    width: 1px;
    height: 26px;
    background: rgba(255,255,255,0.2);
    flex-shrink: 0;
  }

  /* Action buttons */
  .isl-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px 14px;
  }
  .isl-follow-wrap { flex: 1; display: flex; }
  .isl-follow-wrap > * { flex: 1; }

  /* Small icon-only circle button */
  .isl-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
    background: rgba(255,255,255,0.16);
    border: 1.5px solid rgba(255,255,255,0.26);
    cursor: pointer;
    transition: background 0.14s, transform 0.12s;
  }
  .isl-icon-btn:hover  { background: rgba(255,255,255,0.30); transform: scale(0.95); }
  .isl-icon-btn:active { transform: scale(0.91); }
`;

function ProfileIslandCard({
  user_id,
  img,
  metadata,
  isNip05Verified,
  followers,
  mutualFollows,
  isLoading,
  userKeys,
  onInitConvo,
  onClose,
  anchorRef,
}) {
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ top: null, bottom: null, left: null, transformOrigin: "top center" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    let top = null, bottom = null;
    let transformOrigin = "top center";

    if (spaceBelow >= CARD_HEIGHT + margin || spaceBelow >= spaceAbove) {
      top = rect.bottom + margin;
    } else {
      bottom = vh - rect.top + margin;
      transformOrigin = "bottom center";
    }

    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    if (left + CARD_WIDTH > vw - margin) left = vw - CARD_WIDTH - margin;
    if (left < margin) left = margin;

    setPos({ top, bottom, left, transformOrigin });
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [anchorRef]);

  const name = metadata?.display_name || metadata?.name || "Unknown";
  const bio = metadata?.about || "";
  const picture = img || metadata?.picture || "";

  const firstMutuals = mutualFollows.slice(0, 3);
  const extraMutuals = mutualFollows.length > 3 ? mutualFollows.length - 3 : 0;

  return (
    <>
      <style>{ISLAND_STYLES}</style>
      <div
        ref={cardRef}
        className={`isl-card${visible ? " isl-visible" : ""}`}
        style={{
          top: pos.top != null ? pos.top : "auto",
          bottom: pos.bottom != null ? pos.bottom : "auto",
          left: pos.left != null ? pos.left : "auto",
          transformOrigin: pos.transformOrigin,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseLeave={onClose}
      >
        <div className="isl-bg">
          {picture && (
            <img
              src={picture}
              alt={name}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div className="isl-bg-gradient" />
        </div>

        <div className="isl-inner">
          <div className="isl-spacer" />

          <div className="isl-info">
            <div className="isl-name-row">
              <span className="isl-name">{name}</span>
              {isNip05Verified && <Icon name="checkmark-c1" size={20} isColored />}
            </div>
            {bio && <p className="isl-bio">{bio}</p>}
          </div>

          <div className="isl-glass">
            <div className="isl-stats">
              <div className="isl-stat">
                <span className="isl-stat-val"><NumberShrink value={followers} /></span>
                <span className="isl-stat-lbl">{t("A6huCnT")}</span>
              </div>

              <div className="isl-stat-sep" />

              <div className="isl-stat">
                {!isLoading && firstMutuals.length > 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {firstMutuals.map((u, i) => (
                        <div
                          key={i}
                          style={{
                            width: 20, height: 20,
                            borderRadius: "50%",
                            border: "1.5px solid rgba(255,255,255,0.5)",
                            marginLeft: i === 0 ? 0 : -6,
                            background: u?.picture
                              ? `url(${u.picture}) center/cover`
                              : "rgba(255,255,255,0.2)",
                          }}
                        />
                      ))}
                      {extraMutuals > 0 && (
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginLeft: 3 }}>
                          +{extraMutuals}
                        </span>
                      )}
                    </div>
                    <span className="isl-stat-lbl">{t("ARV3co8")}</span>
                  </>
                ) : (
                  <>
                    <span className="isl-stat-val" style={{ opacity: isLoading ? 0.4 : 1 }}>—</span>
                    <span className="isl-stat-lbl">{t("ARV3co8")}</span>
                  </>
                )}
              </div>

              <div className="isl-stat-sep" />

              <div className="isl-stat">
                {metadata?.lud16 || metadata?.lud06 ? (
                  <>
                    <Icon v={2} name={iconsNames.check} />
                    <span className="isl-stat-lbl">Lightning</span>
                  </>
                ) : (
                  <>
                    <Icon v={2} name={iconsNames.close_md} />
                    <span className="isl-stat-lbl">Lightning</span>
                  </>
                )}
              </div>
            </div>

            <div className="isl-actions">
              <div className="isl-follow-wrap">
                <Follow
                  toFollowKey={user_id}
                  toFollowName={""}
                  bulkList={[]}
                  icon={false}
                  full={true}
                />
              </div>
              {userKeys && !userKeys.bunker && (
                <button className="isl-icon-btn" onClick={onInitConvo}>
                  <Icon name="chat_dots" size={20} v={2} />
                </button>
              )}
              <ZapTip
                recipientLNURL={checkForLUDS(metadata?.lud06, metadata?.lud16)}
                recipientPubkey={metadata?.pubkey}
                senderPubkey={userKeys?.pub}
                recipientInfo={{ name: metadata?.name, picture: metadata?.picture }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UserProfilePic({
  user_id,
  size,
  img,
  mainAccountUser = false,
  allowClick = true,
  allowPropagation = false,
  metadata = false,
  withName = false,
  isSwitching = false,
}) {
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [displayedPicture, setDisplayedPicture] = useState(userMetadata?.picture || null);
  const switchTimerRef = useRef(null);
  const [showMetadata, setShowMetada] = useState(false);
  const [fetchedImg, setFetchedImg] = useState(false);
  const [mutualFollows, setMutualFollows] = useState([]);
  const [subStart, setSubStart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initConv, setInitConv] = useState(false);
  const [followers, setFollowers] = useState(0);
  const { isNip05Verified } = useUserProfile(user_id, metadata ? true : false);
  const anchorRef = useRef(null);
  const leaveTimerRef = useRef(null);

  useEffect(() => {
    if (user_id && nostrAuthors.length > 0 && !img) {
      const auth = getUser(user_id);
      if (auth) setFetchedImg(auth.picture);
    }
  }, [nostrAuthors]);

  useEffect(() => {
    if (!mainAccountUser) return;
    if (isSwitching) {
      clearTimeout(switchTimerRef.current);
      switchTimerRef.current = setTimeout(() => {
        setDisplayedPicture(userMetadata?.picture || null);
      }, 450);
    } else {
      setDisplayedPicture(userMetadata?.picture || null);
    }
    return () => clearTimeout(switchTimerRef.current);
  }, [isSwitching, userMetadata?.picture, mainAccountUser]);

  const handleClick = async (e) => {
    try {
      if (!allowPropagation) { e.stopPropagation(); e.preventDefault(); }
      if (allowClick) {
        const pubkey = nip19.nprofileEncode({
          pubkey: mainAccountUser ? userMetadata.pubkey : user_id,
        });
        customHistory(`/profile/${pubkey}`);
      }
    } catch { }
  };

  const handleInitConvo = () => {
    if (userKeys && (userKeys.sec || userKeys.ext || userKeys.bunker)) setInitConv(true);
  };

  const onMouseEnter = useCallback(async () => {
    clearTimeout(leaveTimerRef.current);
    if (!getCustomSettings().userHoverPreview) return;
    setShowMetada(true);
    if (!userKeys || subStart || !metadata) return;
    setSubStart(true);
    const ndkUser = new NDKUser({ pubkey: metadata.pubkey });
    ndkUser.ndk = ndkInstance;
    const [mutuals, userStats] = await Promise.all([
      getMutualFollows(userKeys.pub, user_id),
      getUserStats(user_id),
    ]);
    let stats_ = userStats.find((_) => _.kind === 10000105);
    stats_ = stats_ ? JSON.parse(stats_.content) : {};
    const mutualList = mutuals
      ? mutuals.filter((_) => _.kind === 0).map((_) => getuserMetadata(_))
      : [];
    setFollowers(stats_.followers_count || 0);
    setMutualFollows(mutualList);
    setIsLoading(false);
  }, [subStart, userKeys, user_id, metadata]);

  const onMouseLeave = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => setShowMetada(false), 120);
  }, []);

  const onCardClose = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => setShowMetada(false), 80);
  }, []);

  const avatarStyle = {
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: "50%",
    backgroundColor: "var(--dim-gray)",
  };

  const islandProps = {
    user_id,
    img: img || fetchedImg,
    metadata,
    isNip05Verified,
    followers,
    mutualFollows,
    isLoading,
    userKeys,
    onInitConvo: handleInitConvo,
    onClose: onCardClose,
    anchorRef,
  };

  if (mainAccountUser)
    return (
      <>
        {displayedPicture
          ? <div
            className="pointer fx-centered bg-img cover-bg"
            style={{ ...avatarStyle, backgroundImage: `url(${displayedPicture})` }}
            onClick={handleClick}
          />
          : <div style={{ ...avatarStyle, overflow: "hidden" }} className="pointer fx-centered" onClick={handleClick}>
            <AvatarPlaceholder size={size} />
          </div>
        }
      </>
    );

  const avatarEl = (img || fetchedImg)
    ? <div
      className="pointer fx-centered bg-img cover-bg"
      style={{ ...avatarStyle, backgroundImage: `url(${img || fetchedImg})` }}
      onClick={handleClick}
    />
    : <div style={{ ...avatarStyle, overflow: "hidden" }} className="pointer fx-centered" onClick={handleClick}>
      <AvatarPlaceholder size={size} />
    </div>;

  if (withName)
    return (
      <>
        {initConv && metadata && <InitiConvo exit={() => setInitConv(false)} receiver={user_id} />}
        <div
          ref={anchorRef}
          style={{ position: "relative", display: "inline-flex" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            style={{ opacity: 1, maxWidth: "180px", gap: "4px", transform: "translateY(4px)", alignItems: "center" }}
            onClick={handleClick}
            className="pointer sticker sticker-normal sticker-small sticker-gray"
          >
            {(img || fetchedImg)
              ? <div className="pointer fx-centered bg-img cover-bg" style={{ ...avatarStyle, backgroundImage: `url(${img || fetchedImg})` }} />
              : <div style={{ ...avatarStyle, overflow: "hidden" }} className="pointer fx-centered"><AvatarPlaceholder size={size} /></div>
            }
            <p className="p-one-line gray-c" style={{ margin: 0 }}>{withName}</p>
          </div>
          {showMetadata && metadata && <ProfileIslandCard {...islandProps} />}
        </div>
      </>
    );

  return (
    <>
      {initConv && metadata && <InitiConvo exit={() => setInitConv(false)} receiver={user_id} />}
      <div
        ref={anchorRef}
        style={{ position: "relative", display: "inline-flex" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {avatarEl}
        {showMetadata && metadata && <ProfileIslandCard {...islandProps} />}
      </div>
    </>
  );
}
