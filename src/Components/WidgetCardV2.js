import React, { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import OptionsDropdown from "@/Components/OptionsDropdown";
import LoadingDots from "@/Components/LoadingDots";
import Link from "next/link";
import ShareLink from "@/Components/ShareLink";
import AuthorPreview from "@/Components/AuthorPreview";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { getUser, InitEvent } from "@/Helpers/Controlers";
import PostAsNote from "@/Components/PostAsNote";
import { useTranslation } from "react-i18next";
import SWCard from "@/Components/SWCard";
import { getParsedSW } from "@/Helpers/Encryptions";
import { base64ToFile, FileUpload } from "@/Helpers/Helpers";
import ProgressCirc from "@/Components/ProgressCirc";
import Date_ from "@/Components/Date_";
import UserProfilePic from "@/Components/UserProfilePic";
import { nanoid } from "nanoid";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { NDKUser } from "@nostr-dev-kit/ndk";

export default function WidgetCardV2({
  widget,
  deleteWidget,
  options = true,
  addWidget = false,
  header = true,
  authPreviewPosition = "bottom",
}) {
  const dispatch = useDispatch();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userKeys = useSelector((state) => state.userKeys);
  const [swMetadata, setSWMetadata] = useState(widget.metadata);
  const [authorData, setAuthorData] = useState(widget.author);
  const [isLoading, setIsLoading] = useState(false);
  const [isNIP05Verified, setIsNIP05Verified] = useState(false);
  const [postNoteWithWidgets, setPostNoteWithWidget] = useState(false);
  const [initPublish, setInitPublish] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let auth = getUser(widget.author.pubkey);

        if (auth) {
          let ndkUser = new NDKUser({
            pubkey: auth.pubkey,
          });
          ndkUser.ndk = ndkInstance;
          let isVer = auth.nip05
            ? await ndkUser.validateNip05(auth.nip05)
            : false;
          if (isVer) setIsNIP05Verified(true);
          setAuthorData(auth);
        }
        return;
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [nostrAuthors]);

  const copyNaddr = () => {
    navigator?.clipboard?.writeText(widget.metadata.naddr);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AHAP58g")} 👏`,
      })
    );
  };

  const handlePostImageInNote = async () => {
    if (isLoading) return;
    if (swMetadata.image.includes("base64")) {
      try {
        setIsLoading(true);
        let file = base64ToFile(swMetadata.image);
        let uploadedFile = await FileUpload(file, userKeys, setProgress);
        setPostNoteWithWidget(uploadedFile);
        setIsLoading(false);
        setProgress(0);
        return;
      } catch (err) {
        setIsLoading(false);
        return;
      }
    }
    setPostNoteWithWidget(swMetadata.image);
  };

  return (
    <>
      {postNoteWithWidgets && (
        <PostAsNote
          content={postNoteWithWidgets}
          exit={() => setPostNoteWithWidget(false)}
        />
      )}
      {initPublish && (
        <PublishWidget
          widget={swMetadata}
          exit={() => setInitPublish(false)}
          setPostNoteWithWidget={(data) => {
            setInitPublish(false);
            setPostNoteWithWidget(data);
          }}
          publishInNote={initPublish.publishInNote}
        />
      )}
      <div
        className={`fx-centered fit-container fx-start-h fx-start-v ${
          header ? "box-pad-h-s box-pad-v-s sc-s-18 bg-sp" : ""
        }`}
        style={{
          overflow: "visible",
          flexWrap: authPreviewPosition === "bottom" ? "wrap" : "wrap-reverse",
          gap: "5px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {header && (
          <div className="fit-container fx-scattered">
            <div className="fx-centered fx-start-v">
              <AuthorPreview author={authorData} />
              <p className="gray-c">&#8226;</p>
              <p className="gray-c">
                <Date_ toConvert={new Date(widget.created_at * 1000)} />
              </p>
            </div>
            {options && (
              <div className="fx-centered">
                {swMetadata.id !== widget.id && userKeys && (
                  <button
                    className="btn-normal btn btn-small slide-left"
                    onClick={() =>
                      setInitPublish({
                        publish: true,
                        publishInNote: false,
                      })
                    }
                  >
                    {t("As7IjvV")}
                  </button>
                )}
                <OptionsDropdown
                  options={[
                    userKeys && (
                      <div
                        className="fit-container"
                        onClick={() =>
                          swMetadata.id === widget.id
                            ? setPostNoteWithWidget(
                                `https://yakihonne.com/smart-widget/${widget.metadata.naddr}`
                              )
                            : setInitPublish({
                                publish: true,
                                publishInNote: true,
                              })
                        }
                      >
                        <p>{t("AB8DnjO")}</p>
                      </div>
                    ),
                    userKeys && (
                      <div
                        className="fit-container"
                        onClick={handlePostImageInNote}
                      >
                        {isLoading ? (
                          <div className="fx-centered">
                            <p className="c1-c">{t("AdkgVgm")}</p>
                            <ProgressCirc
                              percentage={progress}
                              size={18}
                              width={3}
                            />
                          </div>
                        ) : (
                          <p>{t("AznTfYL")}</p>
                        )}
                      </div>
                    ),
                    swMetadata.id === widget.id && (
                      <div className="fit-container" onClick={copyNaddr}>
                        <p>{t("ApPw14o", { item: "naddr" })}</p>
                      </div>
                    ),
                    userKeys && (
                      <Link
                        className="fit-container"
                        href={"/smart-widget-builder"}
                        state={{ ops: "clone", metadata: { ...swMetadata } }}
                      >
                        <p>{t("AyWVBDx")}</p>
                      </Link>
                    ),
                    <Link
                      className="fit-container"
                      href={`/smart-widget-checker?naddr=${widget.metadata.naddr}`}
                    >
                      <p>{t("AavUrQj")}</p>
                    </Link>,
                    deleteWidget && userKeys.pub === swMetadata.pubkey && (
                      <Link
                        className="fit-container"
                        href={"/smart-widget-builder"}
                        state={{ ops: "edit", metadata: { ...swMetadata } }}
                      >
                        <p>{t("AsXohpb")}</p>
                      </Link>
                    ),
                    deleteWidget && userKeys.pub === swMetadata.pubkey && (
                      <div className="fit-container" onClick={deleteWidget}>
                        <p className="red-c">{t("Almq94P")}</p>
                      </div>
                    ),
                    swMetadata.id === widget.id && (
                      <ShareLink
                        label={t("AGB5vpj")}
                        path={`/smart-widget/${
                          isNIP05Verified
                            ? `${authorData.nip05}/${widget.metadata.d}`
                            : widget.metadata.naddr
                        }`}
                        title={swMetadata.title || swMetadata.description}
                        description={swMetadata.description || swMetadata.title}
                      />
                    ),
                  ]}
                />
              </div>
            )}
            {addWidget && (
              <div
                className="fx-centered"
                onClick={() => addWidget(widget.metadata.naddr)}
              >
                <div
                  className="round-icon-small round-icon-tooltip"
                  data-tooltip={t("AcXhvAu")}
                >
                  <div className="plus-sign"></div>
                </div>
              </div>
            )}
          </div>
        )}
        <SWCard
          onNextWidget={(data) => setSWMetadata(getParsedSW(data))}
          widget={widget}
        />
        {!header && (
          <div
            className="fit-container fx-scattered box-pad-h-s box-pad-v-s sc-s-18 bg-sp"
            style={{ overflow: "visible" }}
          >
            <div className="fx-centered">
              <UserProfilePic
                size={20}
                mainAccountUser={false}
                user_id={authorData.pubkey}
                img={authorData.picture}
                metadata={authorData}
              />
              <p className="gray-c">
                {t("AsXpL4b", {
                  name: authorData.display_name || authorData.name,
                })}
              </p>
            </div>
            <div className="fx-centered">
              {swMetadata.id !== widget.id && (
                <button
                  className="btn btn-gray btn-small slide-left"
                  onClick={() =>
                    setInitPublish({
                      publish: true,
                      publishInNote: false,
                    })
                  }
                >
                  {t("As7IjvV")}
                </button>
              )}
              {options && (
                <OptionsDropdown
                  vertical={false}
                  options={[
                    <div
                      className="fit-container"
                      onClick={() =>
                        setPostNoteWithWidget(
                          `https://yakihonne.com/smart-widget/${widget.metadata.naddr}`
                        )
                      }
                    >
                      <p>{t("AB8DnjO")}</p>
                    </div>,
                    <div
                      className="fit-container"
                      onClick={handlePostImageInNote}
                    >
                      {isLoading ? (
                        <div className="fx-centered">
                          <p className="c1-c">{t("AdkgVgm")}</p>
                          <ProgressCirc
                            percentage={progress}
                            size={18}
                            width={3}
                          />
                        </div>
                      ) : (
                        <p>{t("AznTfYL")}</p>
                      )}
                    </div>,
                    swMetadata.id === widget.id && (
                      <div className="fit-container" onClick={copyNaddr}>
                        <p>{t("ApPw14o", { item: "naddr" })}</p>
                      </div>
                    ),
                    <Link
                      className="fit-container"
                      href={"/smart-widget-builder"}
                      state={{ ops: "clone", metadata: { ...swMetadata } }}
                    >
                      <p>{t("AyWVBDx")}</p>
                    </Link>,
                    <Link
                      className="fit-container"
                      href={`/smart-widget-checker?naddr=${widget.metadata.naddr}`}
                    >
                      <p>{t("AavUrQj")}</p>
                    </Link>,
                    deleteWidget && userKeys.pub === swMetadata.pubkey && (
                      <Link
                        className="fit-container"
                        href={"/smart-widget-builder"}
                        state={{ ops: "edit", metadata: { ...swMetadata } }}
                      >
                        <p>{t("AsXohpb")}</p>
                      </Link>
                    ),
                    deleteWidget && userKeys.pub === swMetadata.pubkey && (
                      <div className="fit-container" onClick={deleteWidget}>
                        <p className="red-c">{t("Almq94P")}</p>
                      </div>
                    ),
                    swMetadata.id === widget.id && (
                      <ShareLink
                        label={t("AGB5vpj")}
                        path={`/smart-widget/${
                          isNIP05Verified
                            ? `${authorData.nip05}/${widget.metadata.d}`
                            : widget.metadata.naddr
                        }`}
                        title={swMetadata.title || swMetadata.description}
                        description={swMetadata.description || swMetadata.title}
                      />
                    ),
                  ]}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const PublishWidget = ({
  widget,
  exit,
  setPostNoteWithWidget,
  publishInNote,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pWidget, setPWidget] = useState("");

  useEffect(() => {
    handlePublish();
  }, []);

  const handlePublish = async () => {
    let tags = getTagsArray();
    let d = nanoid();
    if (!tags) return;
    let eventInitEx = await InitEvent(30033, widget.title, [
      [
        "client",
        "Yakihonne",
        "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
      ],
      ["published_at", `${Math.floor(Date.now() / 1000)}`],
      ["d", d],
      ...tags,
    ]);
    if (!eventInitEx) {
      exit();
      return;
    }

    setIsLoading(false);
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      })
    );
    let sub = ndkInstance.subscribe(
      [{ kinds: [30033], ids: [eventInitEx.id] }],
      {
        closeOnEose: true,
        cacheUsage: "CACHE_FIRST",
      }
    );
    sub.on("event", (event) => {
      let naddr = nip19.naddrEncode({
        pubkey: event.pubkey,
        kind: event.kind,
        identifier: d,
      });
      let url = `https://yakihonne.com/smart-widget/${naddr}`;
      if (publishInNote) {
        setPostNoteWithWidget(url);
        return;
      }
      setPWidget({
        ...event.rawEvent(),
        url,
      });
      setIsLoading(false);
      sub.stop();
    });
  };
  const getTagsArray = () => {
    let imageTag = widget.image ? ["image", widget.image] : false;
    let inputTag = widget.input
      ? ["input", widget.input]
      : widget.components.length > 2
      ? false
      : true;
    let buttonsTag = widget.buttons.filter((_) => _.label && _.url);
    buttonsTag =
      buttonsTag.length > 0
        ? buttonsTag.map((_) => ["button", _.label, _.type, _.url])
        : false;
    let tags = [];

    tags = [imageTag, ...buttonsTag];
    if (inputTag && widget.components.length > 2) tags.push(inputTag);

    return tags;
  };

  const handlePostImageInNote = async () => {
    if (isLoading) return;
    if (widget.image.includes("base64")) {
      try {
        setIsImageLoading(true);
        let file = base64ToFile(widget.image);
        let uploadedFile = await FileUpload(file, userKeys, setProgress);
        setPostNoteWithWidget(uploadedFile);
        setIsImageLoading(false);
        setProgress(0);
        return;
      } catch (err) {
        setIsImageLoading(false);
        return;
      }
    }
    setPostNoteWithWidget(widget.image);
  };
  if (isLoading) {
    return (
      <div className="fixed-container fx-centered">
        <LoadingDots />
      </div>
    );
  }
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{ width: "min(100%, 500px)", position: "relative" }}
        className="box-pad-h box-pad-v sc-s-18 bg-sp fx-centered fx-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h3 className="box-marg-s p-centered box-pad-h">{widget.title}</h3>
        {/* <div className="checkmark-tt" style={{minWidth: ""}}></div> */}
        {pWidget && <SWCard widget={pWidget} />}

        <div className="fit-container fx-centered">
          <button
            className="btn btn-gst fx"
            onClick={handlePostImageInNote}
            disabled={isImageLoading}
          >
            {isImageLoading ? (
              <div className="fx-centered">
                <p className="c1-c">{t("AdkgVgm")}</p>
                <ProgressCirc percentage={progress} size={18} width={3} />
              </div>
            ) : (
              t("AznTfYL")
            )}
          </button>
          <button
            className="btn btn-normal fx"
            onClick={() => setPostNoteWithWidget(pWidget.url)}
            disabled={isImageLoading}
          >
            {isImageLoading ? <LoadingDots /> : t("AB8DnjO")}
          </button>
        </div>
      </div>
    </div>
  );
};
