import { nip19 } from "nostr-tools";
import React, { useEffect, useState } from "react";
import Avatar from "boring-avatars";
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

export default function UserProfilePic({
  user_id,
  size,
  img,
  mainAccountUser = false,
  allowClick = true,
  allowPropagation = false,
  metadata = false,
  withName = false,
}) {
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const { t } = useTranslation();
  const [showMetadata, setShowMetada] = useState(false);
  const [fetchedImg, setFetchedImg] = useState(false);
  const [mutualFollows, setMutualFollows] = useState([]);
  const [subStart, setSubStart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initConv, setInitConv] = useState(false);
  const [followers, setFollowers] = useState(0);
  const { isNip05Verified } = useUserProfile(user_id, metadata ? true : false);

  useEffect(() => {
    if (user_id && nostrAuthors.length > 0 && !img) {
      let auth = getUser(user_id);
      if (auth) {
        setFetchedImg(auth.picture);
      }
    }
  }, [nostrAuthors]);

  const handleClick = async (e) => {
    try {
      if (!allowPropagation) e.stopPropagation();
      if (allowClick) {
        let pubkey = nip19.nprofileEncode({
          pubkey: mainAccountUser ? userMetadata.pubkey : user_id,
        });
        customHistory(`/profile/${pubkey}`);
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleInitConvo = () => {
    if (userKeys && (userKeys.sec || userKeys.ext || userKeys.bunker)) {
      setInitConv(true);
    }
  };

  const onMouseHover = async () => {
    let isHoverAllowed = getCustomSettings().userHoverPreview;
    if (!isHoverAllowed) return;
    setShowMetada(true);
    if (!userKeys) return false;
    if (!subStart) {
      setSubStart(true);
      let ndkUser = new NDKUser({ pubkey: metadata.pubkey });
      ndkUser.ndk = ndkInstance;
      let [mutuals, userStats] = await Promise.all([
        getMutualFollows(userKeys.pub, user_id),
        getUserStats(user_id),
      ]);
      let userStats_ = userStats.find((_) => _.kind === 10000105);
      userStats_ = userStats_ ? JSON.parse(userStats_.content) : 0;
      mutuals = mutuals
        ? mutuals.filter((_) => _.kind === 0).map((_) => getuserMetadata(_))
        : [];
      setFollowers(userStats_.followers_count);
      setMutualFollows(mutuals);
      setIsLoading(false);
    }
  };

  if (mainAccountUser)
    return (
      <>
        {userMetadata.picture && (
          <div
            className={`pointer fx-centered bg-img cover-bg`}
            style={{
              minWidth: `${size}px`,
              minHeight: `${size}px`,
              backgroundImage: `url(${userMetadata.picture})`,
              borderRadius: "var(--border-r-14)",
              backgroundColor: "var(--dim-gray)",
              borderColor: "black",
            }}
            onClick={handleClick}
          ></div>
        )}
        {!userMetadata.picture && (
          <div
            style={{
              minWidth: `${size}px`,
              minHeight: `${size}px`,
              borderRadius: "var(--border-r-14)",
              overflow: "hidden",
            }}
            className={`pointer fx-centered`}
            onClick={handleClick}
          >
            <Avatar
              size={size}
              name={userMetadata.name}
              square
              variant="marble"
              colors={["#0A0310", "#49007E", "#FF005B", "#FF7D10", "#FFB238"]}
            />
          </div>
        )}
      </>
    );

  if (withName)
    return (
      <>
        {initConv && metadata && (
          <InitiConvo exit={() => setInitConv(false)} receiver={user_id} />
        )}
        <div
          style={{ position: "relative",  display: "inline-flex", }}
          onMouseEnter={onMouseHover}
          onMouseLeave={() => {
            setShowMetada(false);
          }}
        >
          <div
            style={{
              opacity: "1",
              maxWidth: "180px",
             
              gap: "4px",
              transform: "translateY(4px)",
              alignItems: "center",
            }}
            onClick={handleClick}
            className="pointer sticker sticker-normal sticker-small sticker-orange-side"
          >
            {(img || fetchedImg) && (
              <div
                className={`pointer fx-centered bg-img cover-bg`}
                style={{
                  minWidth: `${size}px`,
                  minHeight: `${size}px`,
                  backgroundImage: `url(${img || fetchedImg})`,
                  borderRadius: "var(--border-r-14)",
                  backgroundColor: "var(--dim-gray)",
                  borderColor: "black",
                }}
              ></div>
            )}
            {!(img || fetchedImg) && (
              <div
                style={{
                  minWidth: `${size}px`,
                  minHeight: `${size}px`,
                  borderRadius: "var(--border-r-14)",
                  overflow: "hidden",
                }}
                className={`pointer fx-centered`}
              >
                <Avatar
                  size={size}
                  name={user_id}
                  square
                  variant="marble"
                  colors={[
                    "#0A0310",
                    "#49007E",
                    "#FF005B",
                    "#FF7D10",
                    "#FFB238",
                  ]}
                />
              </div>
            )}
            <p className="p-one-line">{withName}</p>
          </div>
          {showMetadata && metadata && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 2px)",
                width: "350px",
                zIndex: 200,
                overflow: "visible",
                backgroundColor: "var(--very-dim-gray)",
                borderRadius: "18px",
              }}
              className="fx-centered fx-col fx-start-h fx-start-v sc-s box-pad-h-m box-pad-v-m drop-down-r bg-sp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="fit-container fx-scattered">
                <div className="fx-centered">
                  <UserProfilePic user_id={user_id} size={64} img={img} />
                </div>
              </div>
              <div className="fx-centered">
                <h4>{metadata.display_name || metadata.name}</h4>
                {isNip05Verified && <div className="checkmark-c1-24"></div>}
              </div>
              <div
                className="fx-centered fx-wrap fx-start-h"
                style={{ rowGap: "3px" }}
              >
                <div className="fx-centered fx-start-h">
                  <div className="nip05"></div>
                  <p>{metadata.nip05 || "N/A"}</p>
                </div>
                {metadata.website && (
                  <div className="fx-centered fx-start-h">
                    <div className="link"></div>
                    <a
                      href={
                        metadata.website.toLowerCase().includes("http")
                          ? metadata.website
                          : `https://${metadata.website}`
                      }
                      target="_blank"
                    >
                      {metadata.website || "N/A"}
                    </a>
                  </div>
                )}
              </div>
              <div>
                <p className="p-four-lines">{metadata.about || "N/A"}</p>
              </div>

              <div className="fx-centered fit-container fx-start-h">
                <p className="fx-centered" style={{ minWidth: "max-content" }}>
                  <NumberShrink value={followers} />
                  <span className="gray-c">{t("A6huCnT")}</span>
                </p>
                {!isLoading && userKeys && (
                  <DisplayMutualFollows users={mutualFollows} />
                )}
                {isLoading && userKeys && (
                  <p className="gray-c p-medium">{t("ACKGFwm")}</p>
                )}
              </div>
              <div className="fx-centered fit-container">
                <button
                  className="btn btn-gst btn-full"
                  onClick={handleInitConvo}
                >
                  {t("AN0NVU3")}
                </button>
                <Follow
                  toFollowKey={user_id}
                  toFollowName={""}
                  bulkList={[]}
                  icon={false}
                  full={true}
                />
                <ZapTip
                  recipientLNURL={checkForLUDS(metadata.lud06, metadata.lud16)}
                  recipientPubkey={metadata.pubkey}
                  senderPubkey={userKeys.pub}
                  recipientInfo={{
                    name: metadata.name,
                    picture: metadata.picture,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  return (
    <>
      {initConv && metadata && (
        <InitiConvo exit={() => setInitConv(false)} receiver={user_id} />
      )}

      <div
        style={{ position: "relative" }}
        onMouseEnter={onMouseHover}
        onMouseLeave={() => {
          setShowMetada(false);
        }}
      >
        {(img || fetchedImg) && (
          <div
            className={`pointer fx-centered bg-img cover-bg`}
            style={{
              minWidth: `${size}px`,
              minHeight: `${size}px`,
              backgroundImage: `url(${img || fetchedImg})`,
              borderRadius: "var(--border-r-14)",
              backgroundColor: "var(--dim-gray)",
              borderColor: "black",
            }}
            onClick={handleClick}
          ></div>
        )}
        {!(img || fetchedImg) && (
          <div
            style={{
              minWidth: `${size}px`,
              minHeight: `${size}px`,
              borderRadius: "var(--border-r-14)",
              overflow: "hidden",
            }}
            className={`pointer fx-centered`}
            onClick={handleClick}
          >
            <Avatar
              size={size}
              name={user_id}
              square
              variant="marble"
              colors={["#0A0310", "#49007E", "#FF005B", "#FF7D10", "#FFB238"]}
            />
          </div>
        )}
        {showMetadata && metadata && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 2px)",
              width: "350px",
              zIndex: 200,
              overflow: "visible",
              backgroundColor: "var(--very-dim-gray)",
              borderRadius: "18px",
            }}
            className="fx-centered fx-col fx-start-h fx-start-v sc-s box-pad-h-m box-pad-v-m drop-down-r bg-sp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fit-container fx-scattered">
              <div className="fx-centered">
                <UserProfilePic user_id={user_id} size={64} img={img} />
              </div>
            </div>
            <div className="fx-centered">
              <h4>{metadata.display_name || metadata.name}</h4>
              {isNip05Verified && <div className="checkmark-c1-24"></div>}
            </div>
            <div
              className="fx-centered fx-wrap fx-start-h"
              style={{ rowGap: "3px" }}
            >
              <div className="fx-centered fx-start-h">
                <div className="nip05"></div>
                <p>{metadata.nip05 || "N/A"}</p>
              </div>
              {metadata.website && (
                <div className="fx-centered fx-start-h">
                  <div className="link"></div>
                  <a
                    href={
                      metadata.website.toLowerCase().includes("http")
                        ? metadata.website
                        : `https://${metadata.website}`
                    }
                    target="_blank"
                  >
                    {metadata.website || "N/A"}
                  </a>
                </div>
              )}
            </div>
            <div>
              <p className="p-four-lines">{metadata.about || "N/A"}</p>
            </div>

            <div className="fx-centered fit-container fx-start-h">
              <p className="fx-centered" style={{ minWidth: "max-content" }}>
                <NumberShrink value={followers} />
                <span className="gray-c">{t("A6huCnT")}</span>
              </p>
              {!isLoading && userKeys && (
                <DisplayMutualFollows users={mutualFollows} />
              )}
              {isLoading && userKeys && (
                <p className="gray-c p-medium">{t("ACKGFwm")}</p>
              )}
            </div>
            <div className="fx-centered fit-container">
              <button
                className="btn btn-gst btn-full"
                onClick={handleInitConvo}
              >
                {t("AN0NVU3")}
              </button>
              <Follow
                toFollowKey={user_id}
                toFollowName={""}
                bulkList={[]}
                icon={false}
                full={true}
              />
              <ZapTip
                recipientLNURL={checkForLUDS(metadata.lud06, metadata.lud16)}
                recipientPubkey={metadata.pubkey}
                senderPubkey={userKeys.pub}
                recipientInfo={{
                  name: metadata.name,
                  picture: metadata.picture,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const DisplayMutualFollows = ({ users }) => {
  const { t } = useTranslation();
  const firstMutuals = users.slice(0, 3);

  if (users.length === 0)
    return (
      <div className="sticker sticker-small sticker-gray-black">
        {t("AUIEBY7")}
      </div>
    );
  return (
    <div className="fit-container fx-centered fx-start-h">
      <div className="fx-centered">
        {firstMutuals.map((user, index) => {
          return (
            <div
              key={index}
              style={{
                transform: `translateX(-${15 * index}px)`,
                border: "2px solid var(--very-dim-gray)",
                borderRadius: "50%",
              }}
            >
              <UserProfilePic
                user_id={user?.pubkey}
                size={24}
                mainAccountUser={false}
                img={user.picture}
              />
            </div>
          );
        })}
      </div>
      {users.length > 3 && (
        <p className="gray-c" style={{ transform: "translateX(-35px)" }}>
          {t("ALJ9RPE", { count: users.length - 3 })}
        </p>
      )}
      {users.length <= 3 && (
        <p
          className="gray-c p-medium"
          style={{ transform: `translateX(-${15 * (users.length - 1)}px)` }}
        >
          {t("ARV3co8")}
        </p>
      )}
    </div>
  );
};
