import React, { useEffect, useState } from "react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import LoadingDots from "@/Components/LoadingDots";
import Date_ from "@/Components/Date_";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { decodeUrlOrAddress, encodeLud06 } from "@/Helpers/Encryptions";
import axios from "axios";
import { FilePicker } from "@/Components/FilePicker";
import { FileUpload } from "@/Helpers/Helpers";
import Backbar from "@/Components/Backbar";
import { useTranslation } from "react-i18next";
import UserProfilePic from "@/Components/UserProfilePic";

export default function ProfileEdit() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);
  const userAllRelays = useSelector((state) => state.userAllRelays);

  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setImageUploading] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState(false);
  const [userName, setUserName] = useState(false);
  const [userAbout, setUserAbout] = useState(false);
  const [userWebsite, setUserWebsite] = useState(false);
  const [userNip05, setUserNip05] = useState(false);
  const [userLud16, setUserLud16] = useState(false);
  const [userLud06, setUserLud06] = useState(false);
  const [userPicture, setUserPicture] = useState(false);
  const [userBanner, setUserBanner] = useState(false);

  const [showMore, setShowMore] = useState(false);
  const [tempUserRelays, setTempUserRelays] = useState([]);
  const [relaysStatus, setRelaysStatus] = useState([]);

  useEffect(() => {
    triggerEdit();
  }, [userMetadata]);

  useEffect(() => {
    setTempUserRelays(userAllRelays);
    setRelaysStatus(
      userAllRelays.map((item) => {
        return { url: item.url, connected: false };
      })
    );
  }, [userRelays]);

  useEffect(() => {
    const CheckRelays = async () => {
      try {
        tempUserRelays.map(async (relay, index) => {
          let connected = ndkInstance.pool.getRelay(relay.url);
          if (connected.connected) {
            let tempRelays_ = Array.from(relaysStatus);
            tempRelays_[index].connected = true;
            setRelaysStatus(tempRelays_);
          }
        });
      } catch (err) {}
    };

    if (tempUserRelays) CheckRelays();
  }, [tempUserRelays]);

  const updateInfos = async () => {
    let content = { ...userMetadata };
    content.picture = userPicture !== false ? userPicture : content.picture;
    content.banner = userBanner !== false ? userBanner : content.banner;
    content.name = userName !== false ? userName : content.name;
    content.display_name =
      userDisplayName !== false ? userDisplayName : content.display_name;
    content.about = userAbout !== false ? userAbout : content.about || "";
    content.website =
      userWebsite !== false ? userWebsite : content.website || "";
    content.nip05 = userNip05 !== false ? userNip05 : content.nip05;
    content.lud06 = userLud06 !== false ? userLud06 : content.lud06;
    content.lud16 = userLud16 !== false ? userLud16 : content.lud16;

    setIsLoading(true);
    dispatch(
      setToPublish({
        userKeys: userKeys,
        kind: 0,
        content: JSON.stringify(content),
        tags: [],
        allRelays: userRelays,
      })
    );
  };

  const handleLUD16 = async (e) => {
    let add = e.target.value;

    let tempAdd = encodeLud06(decodeUrlOrAddress(add));
    setUserLud16(add);

    if (!tempAdd) setUserLud06("");
    if (tempAdd) {
      let data = await axios.get(decodeUrlOrAddress(add));

      let metadata = JSON.parse(data.data.metadata);
      metadata = metadata.find((_) => _[0].includes("identifier"));

      if (metadata) setUserLud16(metadata[1]);
      setUserLud06(tempAdd);
    }
  };

  const uploadImages = async (data, kind) => {
    let file = data.file;
    setImageUploading(true);
    let url = await FileUpload(file, userKeys);
    if (url) {
      if (kind === "banner") {
        setUserBanner(url);
      }
      if (kind === "picture") {
        setUserPicture(url);
      }
      setImageUploading(false);
      return;
    }
    dispatch(
      setToast({
        type: 2,
        desc: t("AxlGS0U"),
      })
    );
    setImageUploading(false);
  };

  const triggerEdit = () => {
    setUserPicture(userMetadata.picture);
    setUserBanner(userMetadata.banner);
    setUserName(userMetadata.name);
    setUserDisplayName(userMetadata.display_name);
    setUserWebsite(userMetadata.website);
    setUserAbout(userMetadata.about);
    setUserNip05(userMetadata.nip05);
    setUserLud16(userMetadata.lud16);
    setUserLud06(userMetadata.lud06);
    setIsLoading(false);
  };

  const checkMetadata = () => {
    let tempUserMetadata = { ...userMetadata };
    tempUserMetadata.picture = userPicture;
    tempUserMetadata.banner = userBanner;
    tempUserMetadata.name = userName;
    tempUserMetadata.display_name = userDisplayName;
    tempUserMetadata.website = userWebsite;
    tempUserMetadata.about = userAbout;
    tempUserMetadata.nip05 = userNip05;
    tempUserMetadata.lud16 = userLud16;

    return JSON.stringify(userMetadata) === JSON.stringify(tempUserMetadata);
  };

  return (
    <>
      <div>
        <div
          className={`${isLoading || isImageUploading ? "flash" : ""}`}
          style={{
            pointerEvents: isLoading || isImageUploading ? "none" : "auto",
          }}
        >
          <div
            className="fx-centered fit-container  fx-start-v"
            style={{ gap: 0 }}
          >
            <div className="main-middle">
              {userMetadata &&
                (userKeys.sec || userKeys.ext || userKeys.bunker) && (
                  <>
                    <div
                      className="fit-container fx-centered fx-col"
                      style={{ gap: 0 }}
                    >
                      <Backbar />
                      <div
                        className="fit-container fx-centered fx-end-v"
                        style={{
                          height: "250px",
                          position: "relative",
                        }}
                      >
                        <div
                          className="fit-container bg-img cover-bg sc-s"
                          style={{
                            backgroundImage: `url(${userBanner})`,
                            height: "70%",
                            zIndex: 0,
                            position: "absolute",
                            left: 0,
                            top: 0,
                            borderBottom: "1px solid var(--very-dim-gray)",
                            border: "none",
                            borderTopLeftRadius: "0",
                            borderTopRightRadius: "0",
                            // borderRadius: "0",
                          }}
                        ></div>
                        <div
                          className="fx-centered pointer"
                          style={{
                            position: "absolute",
                            right: "16px",
                            top: "16px",
                          }}
                        >
                          <FilePicker
                            element={
                              <div className="fx-centered sticker  sticker-gray-gray">
                                {t("AmcaRMQ")}
                                <div className="plus-sign"></div>
                              </div>
                            }
                            setFile={(data) => {
                              uploadImages(data, "banner");
                            }}
                          />

                          {userBanner && (
                            <div
                              className="close"
                              onClick={() => setUserBanner("")}
                              style={{ position: "static" }}
                            >
                              <div></div>
                            </div>
                          )}
                        </div>
                        <FilePicker
                          element={
                            <div className="fit-container fx-col fx-centered box-pad-h">
                              <div
                                style={{
                                  border: "6px solid var(--white)",
                                  borderRadius: "var(--border-r-50)",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                                className="settings-profile-pic"
                              >
                                <div style={{ position: "relative" }}>
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: 0,
                                      top: 0,

                                      zIndex: 0,
                                      backgroundColor: "rgba(0,0,0,.8)",
                                    }}
                                    className="fx-centered pointer fx-col"
                                  >
                                    <UserProfilePic
                                      size={128}
                                      mainAccountUser={true}
                                      allowClick={false}
                                    />
                                  </div>
                                </div>
                                <div
                                  style={{
                                    position: "relative",
                                    backgroundImage: `url(${userPicture})`,
                                    border: "none",
                                    minWidth: "128px",
                                    aspectRatio: "1/1",
                                    borderRadius: "50%",
                                    zIndex: 1,
                                  }}
                                  className="bg-img cover-bg"
                                ></div>
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    width: "100%",
                                    height: "100%",
                                    zIndex: 1,
                                    backgroundColor: "rgba(0,0,0,.8)",
                                  }}
                                  className="fx-centered pointer toggle fx-col"
                                >
                                  <div
                                    className="image-24"
                                    style={{ filter: "invert()" }}
                                  ></div>
                                  <p className="gray-c">{t("AadiJFs")}</p>
                                </div>
                              </div>
                            </div>
                          }
                          setFile={(data) => {
                            uploadImages(data, "picture");
                          }}
                        />
                      </div>
                      <div className="fit-container fx-col fx-centered box-pad-h">
                        <div className="box-pad-v-s fx-centered fx-col fit-container">
                          {userName === false && (
                            <>
                              <p className="gray-c">
                                <Date_
                                  toConvert={
                                    userMetadata.created_at
                                      ? new Date(userMetadata.created_at * 1000)
                                      : new Date()
                                  }
                                />
                              </p>
                            </>
                          )}
                          <div
                            className="fx-centered fx-col fit-container"
                            style={{ columnGap: "10px" }}
                          >
                            <div className="fit-container sc-s-18 no-bg ">
                              <p
                                className="p-medium gray-c box-pad-h-m"
                                style={{ paddingTop: ".5rem" }}
                              >
                                {t("ALtjgkI")}
                              </p>
                              <input
                                className="if ifs-full if-no-border"
                                style={{ height: "36px" }}
                                placeholder={t("ALtjgkI")}
                                value={userDisplayName}
                                onChange={(e) =>
                                  setUserDisplayName(e.target.value)
                                }
                              />
                            </div>
                            <div className="fit-container sc-s-18 no-bg ">
                              <p
                                className="p-medium gray-c box-pad-h-m"
                                style={{ paddingTop: ".5rem" }}
                              >
                                {t("ALCpv2S")}
                              </p>
                              <div className="fx-centered fit-container">
                                <p style={{ paddingLeft: "1rem" }}>@</p>
                                <input
                                  className="if ifs-full if-no-border"
                                  style={{ height: "36px", paddingLeft: "0" }}
                                  placeholder={t("ALCpv2S")}
                                  value={userName}
                                  onChange={(e) => setUserName(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="fit-container sc-s-18 no-bg ">
                              <p
                                className="p-medium gray-c box-pad-h-m"
                                style={{ paddingTop: ".5rem" }}
                              >
                                {t("ATpIZr5")}
                              </p>
                              <textarea
                                className="txt-area box-pad-v-m ifs-full if-no-border"
                                placeholder={t("ATpIZr5")}
                                rows={20}
                                value={userAbout}
                                onChange={(e) => setUserAbout(e.target.value)}
                              />
                            </div>
                            <div className="fit-container sc-s-18 no-bg">
                              <p
                                className="p-medium gray-c box-pad-h-m"
                                style={{ paddingTop: ".5rem" }}
                              >
                                {t("Ab3i56m")}
                              </p>
                              <input
                                className="if ifs-full if-no-border"
                                style={{ height: "36px" }}
                                placeholder={t("Ab3i56m")}
                                value={userWebsite}
                                onChange={(e) => setUserWebsite(e.target.value)}
                              />
                            </div>
                            <div className="fit-container sc-s-18 no-bg">
                              <p
                                className="p-medium gray-c box-pad-h-m"
                                style={{ paddingTop: ".5rem" }}
                              >
                                {t("AsS6BPz")}
                              </p>
                              <input
                                className="if ifs-full if-no-border"
                                style={{ height: "36px" }}
                                placeholder={t("AsS6BPz")}
                                value={userNip05}
                                onChange={(e) => setUserNip05(e.target.value)}
                              />
                            </div>
                            <div className="fit-container sc-s-18 no-bg">
                              <p
                                className="p-medium gray-c box-pad-h-m"
                                style={{ paddingTop: ".5rem" }}
                              >
                                {t("A40BuYB")}
                              </p>
                              <input
                                className="if ifs-full if-no-border"
                                style={{ height: "36px" }}
                                placeholder={t("A40BuYB")}
                                value={userLud16}
                                onChange={handleLUD16}
                              />
                            </div>

                            {showMore && (
                              <>
                                <div className="fit-container sc-s-18 no-bg">
                                  <p
                                    className="p-medium gray-c box-pad-h-m"
                                    style={{ paddingTop: ".5rem" }}
                                  >
                                    {t("AvQu51Y")}
                                  </p>
                                  <input
                                    className="if ifs-full if-no-border"
                                    style={{ height: "36px" }}
                                    placeholder={t("AvQu51Y")}
                                    value={userPicture}
                                    onChange={(e) =>
                                      setUserPicture(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="fit-container sc-s-18 no-bg">
                                  <p
                                    className="p-medium gray-c box-pad-h-m"
                                    style={{ paddingTop: ".5rem" }}
                                  >
                                    {t("ApHMzMe")}
                                  </p>
                                  <input
                                    className="if ifs-full if-no-border"
                                    style={{ height: "36px" }}
                                    placeholder={t("ApHMzMe")}
                                    value={userBanner}
                                    onChange={(e) =>
                                      setUserBanner(e.target.value)
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <div
                            className="fit-container box-pad-v-s box-pad-h fx-centered pointer"
                            onClick={() => setShowMore(!showMore)}
                          >
                            <p>{t("Ayc6Y5B")}</p>
                            <div
                              className="arrow "
                              style={{
                                rotate: !showMore ? "0deg" : "180deg",
                              }}
                            ></div>
                          </div>
                          <div className="fx-centered fit-container box-marg">
                            <button
                              className={`btn btn-normal fx ${
                                checkMetadata() && !isImageUploading
                                  ? "btn-disabled"
                                  : ""
                              }`}
                              onClick={updateInfos}
                              disabled={checkMetadata()}
                            >
                              {isLoading ? (
                                <LoadingDots />
                              ) : (
                                <>
                                  {isImageUploading
                                    ? t("ADIvW8N")
                                    : t("A8alhKV")}
                                </>
                              )}
                            </button>
                            {!checkMetadata() && (
                              <button
                                className={"btn btn-gst fx "}
                                onClick={triggerEdit}
                              >
                                {isLoading ? (
                                  <LoadingDots />
                                ) : (
                                  <>
                                    {isImageUploading
                                      ? t("ADIvW8N")
                                      : t("Ap06Zt4")}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              {userMetadata &&
                !userKeys.sec &&
                !userKeys.ext &&
                !userKeys.bunker && (
                  <PagePlaceholder page={"nostr-unauthorized"} />
                )}
              {!userMetadata && (
                <PagePlaceholder page={"nostr-not-connected"} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
