import React, { useEffect, useState } from "react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import Spinner from "@/Components/Spinner";
import Date_ from "@/Components/Date_";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { decodeUrlOrAddress, encodeLud06 } from "@/Helpers/Encryptions";
import axios from "axios";
import { FilePicker } from "@/Components/FilePicker";
import { FileUpload, copyText } from "@/Helpers/Helpers";
import Backbar from "@/Components/Backbar";
import { useTranslation } from "react-i18next";
import UserProfilePic from "@/Components/UserProfilePic";
import Icon from "@/Components/Icon";
import YakiNameField from "@/Components/YakiNameField";
import YakiNip05Overlay from "@/Components/YakiNip05Overlay";
import LinkWalletOverlay from "@/Components/LinkWalletOverlay";
import useAccess from "@/Hooks/useAccess";
import useNameClaim from "@/Hooks/useNameClaim";
import useQuotaGuard from "@/Hooks/useQuotaGuard";
import { claimUsername } from "@/Endpoints/Account";
import { setSubscriptionStatus } from "@/Store/Slides/Subscription";
import { openUpgradeSheet } from "@/Store/Slides/Upgrade";
import axiosInstance from "@/Helpers/HTTP_Client";
import { InitEvent } from "@/Helpers/Controlers";

export default function ProfileEdit() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);
  const userAllRelays = useSelector((state) => state.userAllRelays);
  const toPublish = useSelector((state) => state.toPublish);
  const { handleAccessError } = useQuotaGuard();
  const {
    isPaid,
    inTrial,
    username: yakiUsername,
    hasUsername,
    nip05Name,
    nip05,
  } = useAccess();

  const canUseYakiNames = isPaid && !inTrial;

  const [claimingUsername, setClaimingUsername] = useState(false);
  const [showNip05Overlay, setShowNip05Overlay] = useState(false);
  const [showWalletOverlay, setShowWalletOverlay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("linkWallet")) {
      setShowWalletOverlay(true);
      params.delete("linkWallet");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`,
      );
    }
  }, []);

  const usernameClaim = useNameClaim({
    kind: "username",
    enabled: canUseYakiNames && !hasUsername,
  });

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
    if (!toPublish) setIsLoading(false);
  }, [toPublish]);

  useEffect(() => {
    setTempUserRelays(userAllRelays);
    setRelaysStatus(
      userAllRelays.map((item) => {
        return { url: item.url, connected: false };
      }),
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
      } catch (err) { }
    };

    if (tempUserRelays) CheckRelays();
  }, [tempUserRelays]);

  const hasPendingUsername =
    canUseYakiNames && !hasUsername && usernameClaim.claimable;

  const updateInfos = async () => {
    const metadataChanged = !checkMetadata();
    const tasks = [];

    if (hasPendingUsername) tasks.push(claimPendingUsername());
    if (metadataChanged) tasks.push(publishMetadata(buildMetadata()));

    await Promise.allSettled(tasks);
  };

  const publishMetadata = async (content) => {
    setIsLoading(true);
    const event = await InitEvent(0, JSON.stringify(content), []);
    if (!event) {
      setIsLoading(false);
      dispatch(setToast({ type: 2, desc: t("ALmNi6E") }));
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx: event,
        allRelays: userRelays,
      }),
    );
  };

  const publishField = (patch) => {
    publishMetadata({ ...userMetadata, ...patch });
  };

  const refreshAccount = async () => {
    try {
      const { data } = await axiosInstance.get("/api/v1/subscription-status");
      dispatch(setSubscriptionStatus(data));
    } catch { }
  };

  const claimPendingUsername = async () => {
    if (claimingUsername) return false;
    setClaimingUsername(true);
    try {
      await claimUsername(usernameClaim.value);
      await refreshAccount();
      dispatch(setToast({ type: 1, desc: t("Ayq4yyv") }));
      setClaimingUsername(false);
      return true;
    } catch (err) {
      if (!handleAccessError(err, "username")) {
        dispatch(
          setToast({
            type: 3,
            desc:
              err?.response?.data?.message || t("AQMQDrO"),
          }),
        );
      }
      setClaimingUsername(false);
      return false;
    }
  };

  const handleUseNip05 = (address) => {
    setUserNip05(address);
    publishField({ nip05: address });
    refreshAccount();
  };

  const handleUseWallet = (address) => {
    setUserLud16(address);
    setUserLud06("");
    publishField({ lud16: address, lud06: "" });
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
    let url = await FileUpload({ file, userKeys });
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
      }),
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

  const buildMetadata = () => {
    const content = { ...userMetadata };
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
    return content;
  };

  const checkMetadata = () =>
    JSON.stringify(userMetadata) === JSON.stringify(buildMetadata());

  const nothingToUpdate = () =>
    checkMetadata() && !hasPendingUsername && !claimingUsername;

  return (
    <>
      {showNip05Overlay && (
        <YakiNip05Overlay
          pubkey={userKeys?.pub}
          nip05Name={nip05Name}
          isActive={nip05?.is_active !== false}
          currentNip05={userNip05}
          onUse={handleUseNip05}
          exit={() => setShowNip05Overlay(false)}
        />
      )}
      {showWalletOverlay && (
        <LinkWalletOverlay
          currentLud16={userLud16}
          onUse={handleUseWallet}
          exit={() => setShowWalletOverlay(false)}
        />
      )}
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
                                <Icon name="plus-sign" />
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
                                  <Icon name="image" size={24} />
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
                            {canUseYakiNames ? (
                              <>
                                {hasUsername ? (
                                  <div className="yaki-username-border">
                                    <div className="yaki-username-border-spinner" />
                                    <div className="yaki-username-border-content">
                                      <YakiNameField
                                        label={t("Ap3wrvF")}
                                        prefix="yakihonne.com/"
                                        value={yakiUsername}
                                        state="owned"
                                        reason={t("Azvn2wX")}
                                        disabled
                                        badge
                                        action={
                                          <div
                                            className="pointer fx-centered"
                                            title={t("AoTWbxS")}
                                            onClick={() =>
                                              copyText(
                                                `https://yakihonne.com/${yakiUsername}`,
                                                t("AoTWbxS"),
                                              )
                                            }
                                          >
                                            <Icon name="copy" size={16} />
                                          </div>
                                        }
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <YakiNameField
                                    label={t("Ap3wrvF")}
                                    prefix="yakihonne.com/"
                                    value={usernameClaim.value}
                                    state={usernameClaim.state}
                                    reason={usernameClaim.reason}
                                    onChange={usernameClaim.onChange}
                                  />
                                )}
                              </>
                            ) : (
                              <div
                                className="fit-container pointer"
                                onClick={() =>
                                  dispatch(
                                    openUpgradeSheet({
                                      source: "profile-username",
                                    }),
                                  )
                                }
                              >
                                <YakiNameField
                                  label={t("Ap3wrvF")}
                                  prefix="yakihonne.com/"
                                  value={yakiUsername || ""}
                                  state="owned"
                                  disabled
                                  action={
                                    <div className="pointer fx-centered">
                                      <Icon name="crown" size={16} />
                                    </div>
                                  }
                                />
                              </div>
                            )}
                            <div
                              className="fx-centered fit-container fx-start-v profile-edit-row"
                              style={{ columnGap: "10px" }}
                            >
                              <div className="fit-container sc-s-18 no-bg box-pad-v-s">
                                <p className="p-medium gray-c box-pad-h-m">
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
                              <div className="fit-container sc-s-18 no-bg box-pad-v-s">
                                <p className="p-medium gray-c box-pad-h-m">
                                  {t("ALCpv2S")}
                                </p>
                                <div className="fx-centered fit-container">
                                  <p style={{ paddingLeft: "1rem" }}>@</p>
                                  <input
                                    className="if ifs-full if-no-border"
                                    style={{ height: "36px", paddingLeft: "0" }}
                                    placeholder={t("ALCpv2S")}
                                    value={userName}
                                    onChange={(e) =>
                                      setUserName(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="fit-container sc-s-18 no-bg box-pad-v-s">
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
                            <div className="fit-container sc-s-18 no-bg box-pad-v-s">
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
                            <div className="fit-container sc-s-18 no-bg box-pad-v-s">
                              <div className="fx-scattered fit-container">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p className="p-medium gray-c box-pad-h-m">
                                    {t("AsS6BPz")}
                                  </p>
                                  <input
                                    className="if ifs-full if-no-border"
                                    style={{ height: "36px" }}
                                    placeholder={t("AsS6BPz")}
                                    value={userNip05}
                                    onChange={(e) =>
                                      setUserNip05(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="box-pad-h-m">
                                  <button
                                    className="btn btn-small btn-gray"
                                    style={{ minWidth: "max-content" }}
                                    onClick={() =>
                                      canUseYakiNames
                                        ? setShowNip05Overlay(true)
                                        : dispatch(
                                            openUpgradeSheet({
                                              source: "profile-nip05",
                                            }),
                                          )
                                    }
                                  >
                                    {t("AikNyQn")}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="fit-container sc-s-18 no-bg box-pad-v-s">
                              <div className="fx-scattered fit-container">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p className="p-medium gray-c box-pad-h-m">
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
                                <div className="box-pad-h-m">
                                  <button
                                    className="btn btn-small btn-gray"
                                    style={{ minWidth: "max-content" }}
                                    onClick={() => setShowWalletOverlay(true)}
                                  >
                                    {t("AmQVpu4")}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {showMore && (
                              <>
                                <div className="fit-container sc-s-18 no-bg box-pad-v-s">
                                  <p className="p-medium gray-c box-pad-h-m">
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
                                <div className="fit-container sc-s-18 no-bg box-pad-v-s">
                                  <p className="p-medium gray-c box-pad-h-m">
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
                            <Icon name="arrow" />
                          </div>
                          <div className="fx-centered fit-container box-marg">
                            <button
                              className={`btn btn-normal fx ${nothingToUpdate() && !isImageUploading
                                  ? "btn-disabled"
                                  : ""
                                }`}
                              onClick={updateInfos}
                              disabled={nothingToUpdate()}
                            >
                              {isLoading || claimingUsername ? (
                                <Spinner />
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
                                  <Spinner />
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
