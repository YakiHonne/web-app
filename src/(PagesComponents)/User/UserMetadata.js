import React, { useState, useEffect, useMemo } from "react";
import {
  checkForLUDS,
  getEmptyuserMetadata,
  getParsedAuthor,
  getuserMetadata,
  shortenKey,
} from "@/Helpers/Encryptions";
import ZapTip from "@/Components/ZapTip";
import Follow from "@/Components/Follow";
import ShowPeople from "@/Components/ShowPeople";
import axios from "axios";
import NumberShrink from "@/Components/NumberShrink";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import LoadingDots from "@/Components/LoadingDots";
import InitiConvo from "@/Components/InitConvo";
import Avatar from "boring-avatars";
import { useDispatch, useSelector } from "react-redux";
import { setFollowersCountSL } from "@/Store/Slides/Extras";
import { saveFetchedUsers } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { getUser } from "@/Helpers/Controlers";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { getUserStats } from "@/Helpers/WSInstance";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import Carousel from "@/Components/Carousel";
import PagePlaceholder from "@/Components/PagePlaceholder";
import bannedList from "@/Content/BannedList";
import UserFollowers from "@/Components/UserFollowers";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import QRSharing from "@/Components/QRSharing";
import useUserProfile from "@/Hooks/useUsersProfile";
import useIsMute from "@/Hooks/useIsMute";
import { sleepTimer } from "@/Helpers/Helpers";

export default function UserMetadata({ user }) {
  const { t } = useTranslation();
  const id = user.pubkey;
  const userKeys = useSelector((state) => state.userKeys);
  const { isNip05Verified } = useUserProfile(user.pubkey);
  const { muteUnmute, isMuted } = useIsMute(user.pubkey);
  const [showPeople, setShowPeople] = useState(false);
  const [timestamp, setTimestamp] = useState(new Date().getTime());
  const [userFollowers, setUserFollowers] = useState(0);
  const [initConv, setInitConv] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showMetadataCarousel, setShowMetadataCarousel] = useState(false);
  const [selectedItemInCarousel, setSelectedItemInCarousel] = useState(0);

  useEffect(() => {
    getUserFollowers();
  }, [timestamp]);

  const getUserFollowers = async () => {
    try {
      let followersCount = 0;
      followersCount = await getUserFollowersCache();
      console.log(followersCount);
      if (followersCount === 0) {
        followersCount = await getUserFollowersNostrBand();
      }

      setUserFollowers(followersCount);
    } catch (err) {
      console.log(err);
    }
  };

  const getUserFollowersCache = async () => {
    try {
      let stats = await Promise.race([getUserStats(id), sleepTimer(2000)]);
   
      if (stats) {
        let userStats_ = stats.find((_) => _.kind === 10000105);
        userStats_ = userStats_ ? JSON.parse(userStats_.content) : false;
        if (userStats_) return userStats_.followers_count;
        return 0;
      }
      return 0;
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

  const getUserFollowersNostrBand = async () => {
    try {
      let fCount = await Promise.race([
        axios.get("https://api.nostr.band/v0/stats/profile/" + id),
        sleepTimer(3000),
      ]);
      if (!fCount) return 0;
      fCount = fCount.data.stats[id].followers_pubkey_count;
      return fCount;
    } catch (err) {
      console.log(err);
      return 0;
    }
  };
  const handleInitConvo = () => {
    if (userKeys && (userKeys.sec || userKeys.ext)) {
      setInitConv(true);
    }
  };

  const handleCarouselItems = (index) => {
    let temArray = [];
    if (user.banner) temArray.push(user.banner);
    if (user.picture) temArray.push(user.picture);

    if (index === 1 && temArray.length < 2) {
      setSelectedItemInCarousel(0);
      setShowMetadataCarousel(temArray);
      return;
    }
    setShowMetadataCarousel(temArray);
    setSelectedItemInCarousel(index);
  };

  if (isMuted)
    return <PagePlaceholder page={"muted-user"} onClick={muteUnmute} />;
  return (
    <>
      {showPeople === "following" && (
        <ShowPeople
          exit={() => setShowPeople(false)}
          list={user.followings}
          type={showPeople}
        />
      )}

      {initConv && <InitiConvo exit={() => setInitConv(false)} receiver={id} />}
      {showQR && (
        <QRSharing
          user={user}
          exit={() => setShowQR(false)}
          isVerified={isNip05Verified}
        />
      )}
      {showMetadataCarousel && (
        <Carousel
          selectedImage={selectedItemInCarousel}
          imgs={showMetadataCarousel}
          back={() => {
            setSelectedItemInCarousel(0);
            setShowMetadataCarousel(false);
          }}
        />
      )}
      <div className="fit-container">
        <div
          className="fit-container fx-centered fx-start-h fx-end-v fx-start-v box-pad-h-s box-pad-v-s bg-img cover-bg"
          style={{
            position: "relative",
            height: user?.banner ? "250px" : "150px",
          }}
        >
          <div
            className="fit-container sc-s bg-img cover-bg"
            style={{
              height: "calc(100% - 90px)",
              position: "absolute",
              left: 0,
              top: 0,
              backgroundImage: user?.banner ? `url(${user?.banner})` : "",
              backgroundColor: "var(--very-dim-gray)",
              overflow: "visible",
              zIndex: 0,
              borderTopLeftRadius: "0",
              borderTopRightRadius: "0",
              cursor: user?.banner ? "zoom-in" : "default",
            }}
            onClick={() => handleCarouselItems(0)}
          ></div>
          <div
            className="fx-centered fx-col fx-start-v fit-container"
            style={{ position: "relative", zIndex: 200 }}
          >
            <div
              className="fx-centered fx-end-v fit-container"
              style={{ columnGap: "16px" }}
            >
              <UserPP
                size={128}
                src={user?.picture}
                user_id={user?.pubkey}
                setSelectedItemInCarousel={handleCarouselItems}
              />
              <div className="fit-container fx-scattered fx-end-h box-marg-s">
                <div className="fx-centered">
                  <div>
                    {user.pubkey !== userKeys.pub && (
                      <Follow
                        toFollowKey={user?.pubkey}
                        toFollowName={user?.name}
                        setTimestamp={setTimestamp}
                        bulkList={[]}
                        icon={false}
                      />
                    )}
                  </div>
                  {user.pubkey === userKeys.pub && (
                    <button
                      className="btn btn-gray"
                      onClick={() => customHistory.push("/settings/profile")}
                    >
                      {t("AfxwB6z")}
                    </button>
                  )}
                  {user.pubkey !== userKeys.pub && (
                    <div className="fx-centered">
                      <ZapTip
                        recipientLNURL={checkForLUDS(user?.lud06, user?.lud16)}
                        recipientPubkey={user?.pubkey}
                        senderPubkey={userKeys.pub}
                        recipientInfo={{
                          name: user?.name,
                          picture: user?.picture,
                        }}
                        setReceivedEvent={() => null}
                      />
                      <div
                        className={`round-icon round-icon-tooltip ${
                          !userKeys || userKeys.bunker ? "if-disabled" : ""
                        }`}
                        data-tooltip={
                          userKeys && (userKeys.sec || userKeys.ext)
                            ? t("AEby39n", { name: user?.name || "" })
                            : t("AlNe9hu")
                        }
                        style={{
                          cursor:
                            userKeys && (userKeys.sec || userKeys.ext)
                              ? "pointer"
                              : "not-allowed",
                        }}
                        onClick={handleInitConvo}
                      >
                        <div className="env-edit-24"></div>
                      </div>
                    </div>
                  )}
                  <EventOptions
                    event={{ ...user, image: user?.cover }}
                    component="user"
                    border={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fx-centered fit-container box-pad-v-m box-pad-h-m">
          <div
            className="fx-centered fx-col fx-start-v"
            style={{ width: "min(100%, 800px)" }}
          >
            <div className="fx-centered" style={{ gap: "6px" }}>
              <h3 className="p-caps">{user?.display_name || user?.name}</h3>
              {isNip05Verified && <div className="checkmark-c1-24"></div>}
              <div
                className="fx-centered pointer"
                onClick={() => setShowQR(true)}
              >
                <div>
                  <div className="qrcode"></div>
                </div>
              </div>
            </div>
            <div className="fx-centered">
              <div className="fx-centered">
                <div className="nip05-24"></div>{" "}
                {user?.nip05 && (
                  <p className="p-one-line" style={{ minWidth: "max-content" }}>
                    {user?.nip05?.length < 50
                      ? user?.nip05
                      : shortenKey(user?.nip05, 15)}
                  </p>
                )}
                {!user?.nip05 && <p>N/A</p>}
              </div>

              {user?.website && (
                <div className="fx-centered fx-start-h">
                  <div className="link-24"></div>

                  <a
                    href={
                      user?.website.toLowerCase().includes("http")
                        ? user?.website
                        : `https://${user?.website}`
                    }
                    target="_blank"
                    className="p-one-line"
                    style={{ textDecoration: user?.website ? "underline" : "" }}
                  >
                    {user?.website || "N/A"}
                  </a>
                </div>
              )}
            </div>
            <div
              className="fx-centered fx-start-v fit-container"
              style={{ columnGap: "24px" }}
            >
              <div className="box-pad-v-s fx-centered fx-start-v fx-col fit-container">
                {user?.about && (
                  <div dir="auto" className="fit-container">
                    {getNoteTree(user?.about, true)}
                  </div>
                )}
                <div className="fx-centered">
                  <div className="fx-centered" style={{ columnGap: "10px" }}>
                    <div className="user"></div>
                    <div
                      className="pointer"
                      onClick={() =>
                        user.followings.length !== 0
                          ? setShowPeople("following")
                          : null
                      }
                    >
                      <p>
                        <NumberShrink value={user.followings.length} />{" "}
                        <span className="gray-c">{t("A9TqNxQ")}</span>
                      </p>
                    </div>
                    <UserFollowers id={id} followersCount={userFollowers} />
                    {userKeys && user.followings.includes(userKeys?.pub) && (
                      <div className="sticker sticker-gray-black">
                        {t("AjfORVL")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const UserPP = ({ src, size, user_id, setSelectedItemInCarousel }) => {
  if (!src) {
    return (
      <div
        style={{
          border: "6px solid var(--white)",
          borderRadius: "var(--border-r-50)",
          position: "relative",
          overflow: "hidden",
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
        }}
        className="settings-profile-pic"
      >
        <Avatar
          size={size}
          name={user_id}
          variant="marble"
          square
          colors={["#0A0310", "#49007E", "#FF005B", "#FF7D10", "#FFB238"]}
        />
      </div>
    );
  }
  return (
    <img
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItemInCarousel(1);
      }}
      className="sc-s-18 settings-profile-pic"
      style={{
        cursor: "zoom-in",
        aspectRatio: "1/1",
        objectFit: "cover",
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`,
        border: "6px solid var(--white)",
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--border-r-50)",
      }}
      width={"100%"}
      src={src}
      alt="el"
      loading="lazy"
    />
  );
};
