import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import UsersGroupProfilePicture from "@/Components/UsersGroupProfilePicture";
import { saveUsers } from "@/Helpers/DB";
import { Virtuoso } from "react-virtuoso";
import UserToFollow from "./UserToFllow";
import useUsersProfile from "@/Hooks/useUsersProfile";
import useFollowUsers from "@/Hooks/useFollowUsers";
import UserProfilePic from "@/Components/UserProfilePic";
import Link from "next/link";
import OptionsDropdown from "@/Components/OptionsDropdown";
import LoadingDots from "@/Components/LoadingDots";
import ShareLink from "@/Components/ShareLink";
import AddPack from "@/Components/ContentSettings/ContentSource/AddPack";

export default function PackPreview({ pack, noRedirect = false }) {
  let url = pack.kind === 39089 ? "/pack/s?d=" + pack.d : "/pack/m?d=" + pack.d;
  const { t } = useTranslation();
  const { userProfile } = useUsersProfile(pack.pubkey);
  const { isAllFollowing, followUnfollowBulk, isFollowLoading } =
    useFollowUsers({
      pubkeys: pack.pTags,
    });
  const [showAddPack, setShowAddPack] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const handleShowDetails = () => {
    setShowDetails(!showDetails);
    saveUsers([...pack.pTags, pack.pubkey]);
  };
  return (
    <>
      {showAddPack && (
        <AddPack
          exit={() => {
            setShowAddPack(false);
          }}
          kind={pack.kind}
          toEdit={pack}
        />
      )}
      <div
        className="fit-container fx-centered fx-col fx-start-v fx-start-h sc-s bg-sp box-marg-s pointer"
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
                minWidth: "58px",
                minHeight: "58px",
                borderRadius: "50%",
              }}
              className="bg-img cover-bg"
            ></div>
            <div className="fx-centered fx-col fx-start-v fit-container">
              <div className="fit-container fx-scattered">
                <div>
                  <p className="p-maj p-big">{pack.title}</p>
                  <p className={`gray-c  ${showDetails ? "" : "p-one-line"}`}>
                    {pack.description || (
                      <span className="p-italic">{t("AtZrjns")}</span>
                    )}
                  </p>
                </div>
                <div className="fx-centered">
                  <div className="round-icon-small">
                    <div className="arrow"></div>
                  </div>
                  <OptionsDropdown
                    options={[
                      <div
                        className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
                        onClick={(e) => {
                          e.stopPropagation();
                          followUnfollowBulk(pack.pTags);
                        }}
                      >
                        {isFollowLoading ? (
                          <LoadingDots />
                        ) : (
                          <>
                            {!isAllFollowing ? (
                              <>
                                <div className="user-to-follow-24"></div>
                                <p>{t("AzkUxnd")}</p>
                              </>
                            ) : (
                              <>
                                <div className="user-to-unfollow-24"></div>
                                <p>{t("AyohNeT")}</p>
                              </>
                            )}
                          </>
                        )}
                      </div>,
                      <div
                        className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddPack(true);
                        }}
                      >
                        <div className="clone-24"></div>
                        <p>{t("AyWVBDx")}</p>
                      </div>,
                      <div
                        className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <ShareLink
                          label={t("A6enIP3")}
                          title={
                            pack.title ||
                            userProfile.display_name ||
                            userProfile.name
                          }
                          description={
                            pack.description || pack.about || pack.content || ""
                          }
                          path={url}
                        />
                      </div>,
                    ]}
                  />
                </div>
              </div>
              {!showDetails && (
                <div className="fx-centered">
                  <UsersGroupProfilePicture
                    pubkeys={pack.pTags}
                    number={5}
                    imgSize={32}
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
                      return <UserToFollow pubkey={pubkey} />;
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {!noRedirect && (
          <Link
            className="fit-container fx-centered box-pad-v-m pointer"
            style={{ borderTop: "1px solid var(--pale-gray)" }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            href={url}
          >
            <p className="gray-c">{t("AER5KJi")}</p>
            <div>
              <div className="share-icon"></div>
            </div>
          </Link>
        )}
      </div>
    </>
  );
}
