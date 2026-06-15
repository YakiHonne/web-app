import React, { useEffect, useMemo, useRef, useState } from "react";
import SWHandler from "smart-widget-handler";
import { useDispatch, useSelector } from "react-redux";
import { addWidgetPathToUrl, assignClientTag } from "@/Helpers/Helpers";
import { getWallets } from "@/Helpers/ClientHelpers";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import { getUser, InitEvent, publishEvent } from "@/Helpers/Controlers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { nanoid } from "nanoid";
import PagePlaceholder from "@/Components/PagePlaceholder";
import { saveUsers } from "@/Helpers/DB";
import axios from "axios";
import { downloadAsFile, getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import LoadingDots from "@/Components/LoadingDots";
import UploadFile from "@/Components/UploadFile";
import UserSearchBar from "@/Components/UserSearchBar";
import PaymentGateway from "@/Components/PaymentGateway";
import Spinner from "@/Components/Spinner";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";

export default function Playground() {
  return (
    <div>
      <Main />
    </div>
  );
}

const Main = () => {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const dispatch = useDispatch();
  const [url, setUrl] = useState("");
  const [urlToCheck, setUrlToCheck] = useState("");
  const [receivedLogs, setReceivedLogs] = useState([]);
  const [refresh, setSetRefresh] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const handleSetUrlToCheck = () => {
    const urlRegex =
      /^(?:(?:https?|ftp):\/\/)?(?:(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/[\w-./?%&=]*)?|(?:[\w-]+\.)+[\w-]+(?::\d+)?(?:\/[\w-./?%&=]*)?)$/i;
    const isValid = urlRegex.test(url.trim());
    if (isValid) {
      setSetRefresh(false);
      setUrlToCheck(url.trim());
      return;
    }
    dispatch(
      setToast({
        type: 2,
        desc: t("AesiKY4"),
      }),
    );
  };

  return (
    <>
      {!userKeys && <PagePlaceholder page={"nostr-not-connected"} />}
      {userKeys && (
        <div className="fit-container fx-centered">
          <div
            style={{ width: "min(100%,400px)" }}
            className="fx-centered fx-col"
          >
            <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
              <p className="gray-c fit-container">{t("AagFn6G")}</p>
              <div className="fit-container fx-centered fx-start-v">
                <input
                  className={`if ifs-full ${
                    urlToCheck ? "if-disabled" : ""
                  }`}
                  type="text"
                  placeholder={t("AnmM3FH")}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                  }}
                  disabled={urlToCheck}
                />
                {!urlToCheck && (
                  <button
                    className="btn btn-normal"
                    style={{ minWidth: "max-content" }}
                    onClick={handleSetUrlToCheck}
                  >
                    {t("AVhZ4Oa")}
                  </button>
                )}
                {urlToCheck && (
                  <div className="fx-centered">
                    <button
                      className="btn btn-red slide-up"
                      style={{ minWidth: "max-content" }}
                      onClick={() => {
                        setUrlToCheck("");
                        setReceivedLogs([]);
                      }}
                    >
                      {t("AdrLdL1")}
                    </button>
                    <div
                      className="round-icon-small round-icon-tooltip slide-right"
                      data-tooltip={t("AckKGvv")}
                      onClick={() => {
                        setSetRefresh(Date.now());
                        setReceivedLogs([]);
                      }}
                    >
                      <Icon name="switch-arrows-v2" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="fx-centered box-marg-s">
              {!urlToCheck && (
                <section
                  className="fx-centered fx-col sc-s-18"
                  style={{
                    width: "400px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    gap: 0,
                    aspectRatio: "10/16",
                  }}
                ></section>
              )}
              {urlToCheck && (
                <MiniApp
                  url={urlToCheck}
                  setReceivedLogs={setReceivedLogs}
                  refresh={refresh}
                />
              )}
            </div>
            {receivedLogs.length > 0 && (
              <button
                className="btn btn-gray btn-full"
                onClick={() => setShowLogs(true)}
              >
                {t("Al8MnWb", { count: receivedLogs.length })}
              </button>
            )}
          </div>
          {showLogs && (
            <LogsOverlay
              logs={receivedLogs}
              exit={() => setShowLogs(false)}
            />
          )}
        </div>
      )}
    </>
  );
};

const LogsOverlay = ({ logs, exit }) => {
  const { t } = useTranslation();
  return (
    <Overlay exit={exit} width={500}>
      <div className="box-pad-h box-pad-v fx-centered fx-col fx-start-h fx-start-v slide-up">
        <h4>{t("A8iuHtc")}</h4>
        <div className="box-pad-v-s"></div>
        <div
          className="fit-container fx-centered fx-col fx-start-h fx-start-v"
          style={{ rowGap: "5px" }}
        >
          {logs.map((log, index) => {
            return (
              <div
                className="fit-container fx-centered fx-col fx-start-h fx-start-v"
                style={{ minWidth: 0 }}
                key={index}
              >
                <div className="fx-centered fx-start-h">
                  <p>
                    Kind: <span className="gray-c">{log.kind}</span>
                  </p>
                  {!log.client && (
                    <div
                      className="fx-centered box-pad-h-s sc-s-18"
                      style={{
                        borderColor: "var(--green-main)",
                        backgroundColor: "transparent",
                        height: "25px",
                      }}
                    >
                      {" "}
                      <p className="p-italic green-c p-medium">{t("Ah3XYp9")}</p>
                    </div>
                  )}
                  {log.client && (
                    <div
                      className="fx-centered box-pad-h-s sc-s-18"
                      style={{
                        borderColor: "var(--c1)",
                        backgroundColor: "transparent",
                        height: "25px",
                      }}
                    >
                      <p className="p-italic c1-c p-medium">{t("A32AiGB")}</p>
                    </div>
                  )}
                </div>
                {log.data && (
                  <ReactMarkdown
                    children={
                      typeof log.data === "string"
                        ? log.data
                        : "```json\n" +
                          JSON.stringify(log.data, null, 2) +
                          "\n```"
                    }
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeRef = nanoid();
                        return !inline ? (
                          <pre
                            style={{
                              padding: "0",
                              width: "400px",
                              maxWidth: "100%",
                              minWidth: 0,
                              overflow: "auto",
                            }}
                            className="fit-container"
                          >
                            <div
                              className="sc-s-18 box-pad-v-s box-pad-h-m fit-container fx-scattered"
                              style={{
                                borderBottomRightRadius: 0,
                                borderBottomLeftRadius: 0,
                                top: "0px",
                                position: "sticky",
                                border: "none",
                              }}
                            >
                              <p className="gray-c p-italic">
                                {match?.length > 0 ? match[1] : ""}
                              </p>
                            </div>
                            <code
                              className={`hljs ${className} fit-container`}
                              {...props}
                              id={codeRef}
                            >
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code
                            className="inline-code fit-container"
                            {...props}
                            style={{ margin: "1rem 0" }}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Overlay>
  );
};

const MiniApp = ({ url, setReceivedLogs, refresh }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userRelays = useSelector((state) => state.userRelays);
  const userMetadata = useSelector((state) => state.userMetadata);
  const [isLoading, setIsLoading] = useState(true);
  const wallets = getWallets();
  const iframeRef = useRef(null);

  const [paymentPayload, setPaymentPayload] = useState("");

  useEffect(() => {
    let listener;
    if (iframeRef.current && url) {
      listener = SWHandler.host.listen(async (event) => {
        setReceivedLogs((prev) => [...prev, { ...event, client: true }]);
        if (event?.kind === "app-loaded") {
          setIsLoading(false);
          if (userMetadata) {
            SWHandler.host.sendContext(
              { ...userMetadata, hasWallet: wallets.length > 0 },
              window.location.origin,
              url,
              iframeRef.current,
            );
            setReceivedLogs((prev) => [
              ...prev,
              {
                data: { ...userMetadata, hasWallet: wallets.length > 0 },
                kind: "user-metadata",
                client: false,
              },
            ]);
          }
          if (!userMetadata) {
            SWHandler.host.sendError(
              t("AC6jYA6"),
              url,
              iframeRef.current,
            );
            setReceivedLogs((prev) => [
              ...prev,
              {
                data: t("AC6jYA6"),
                kind: "err-msg",
                client: false,
              },
            ]);
          }
        }
        if (event?.kind === "sign-event") {
          try {
            let signedEvent = await InitEvent(
              event.data.kind,
              event.data.content,
              assignClientTag(event.data.tags),
            );
            if (signedEvent) {
              SWHandler.host.sendEvent(
                signedEvent,
                "success",
                url,
                iframeRef.current,
              );
              setReceivedLogs((prev) => [
                ...prev,
                {
                  data: signedEvent,
                  kind: "nostr-event",
                  client: false,
                },
              ]);
            } else {
              SWHandler.host.sendError(
                t("AxPNC2r"),
                url,
                iframeRef.current,
              );
              setReceivedLogs((prev) => [
                ...prev,
                {
                  data: t("AxPNC2r"),
                  kind: "err-msg",
                  client: false,
                },
              ]);
            }
          } catch (err) {
            dispatch(
              setToast({
                type: 2,
                desc: t("Acr4Slu"),
              }),
            );
          }
        }
        if (event?.kind === "sign-publish") {
          try {
            let signedEvent = await InitEvent(
              event.data.kind,
              event.data.content,
              assignClientTag(event.data.tags),
            );
            if (!signedEvent) {
              SWHandler.host.sendError(
                t("AxPNC2r"),
                url,
                iframeRef.current,
              );
              setReceivedLogs((prev) => [
                ...prev,
                {
                  data: t("AxPNC2r"),
                  kind: "err-msg",
                  client: false,
                },
              ]);
            } else {
              let publisedEvent = await publishEvent(signedEvent, userRelays);
              SWHandler.host.sendEvent(
                signedEvent,
                publisedEvent ? "success" : "error",
                url,
                iframeRef.current,
              );
              setReceivedLogs((prev) => [
                ...prev,
                {
                  data: signedEvent,
                  kind: "nostr-event",
                  client: false,
                },
              ]);
            }
          } catch (err) {
            dispatch(
              setToast({
                type: 2,
                desc: t("Acr4Slu"),
              }),
            );
          }
        }
        if (event?.kind === "payment-request") {
          setPaymentPayload(event.data);
        }
      });
    }
    return () => {
      if (listener) listener.close();
    };
  }, [iframeRef.current, url]);

  useEffect(() => {
    if (!isLoading) setIsLoading(true);
    iframeRef.current.src = url;
  }, [url]);
  useEffect(() => {
    if (refresh) iframeRef.current.src = url;
  }, [refresh]);

  const handlePaymentResponse = (data) => {
    SWHandler.host.sendPaymentResponse(data, url, iframeRef.current);
    setReceivedLogs((prev) => [
      ...prev,
      {
        data: { ...data, preImage: data.preImage || "" },
        kind: "payment-response",
        client: false,
      },
    ]);
  };
  return (
    <>
      {paymentPayload && (
        <PaymentGateway
          recipientAddr={paymentPayload.address}
          paymentAmount={paymentPayload.amount}
          recipientPubkey={paymentPayload.nostrPubkey}
          nostrEventIDEncode={paymentPayload.nostrEventIDEncode}
          exit={() => setPaymentPayload("")}
          setConfirmPayment={handlePaymentResponse}
        />
      )}

      <section
        className="fx-centered fx-col"
        style={{
          width: "400px",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#343434",
          gap: 0,
        }}
      >
        <div
          className="fit-container fx-centered"
          style={{ position: "relative" }}
        >
          <iframe
            ref={iframeRef}
            src={url}
            allow="microphone; camera; clipboard-write 'src'"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
            style={{ aspectRatio: "10/16" }}
            className="fit-container fit-height sc-s-18"
          ></iframe>
          {isLoading && (
            <section
              className="fx-centered fx-col sc-s-18"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 1,
                width: "100%",
                height: "100%",
                borderRadius: "10px",
                overflow: "hidden",
                gap: 0,
                aspectRatio: "10/16",
              }}
            >
              <Spinner size={32} />
            </section>
          )}
        </div>
        <div className="fit-container box-pad-v-s box-pad-h-s">
          <ManifestFile url={url} />
        </div>
      </section>
    </>
  );
};

const ManifestFile = ({ url }) => {
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState(false);
  const [isMetadataLoding, setIsMetadataLoading] = useState(false);
  const [showGenerateFile, setShowGenerateFile] = useState(false);

  useEffect(() => {
    const getApp = async (url_) => {
      try {
        let url = addWidgetPathToUrl(url_);
        if (!url) {
          return;
        }
        setIsMetadataLoading(true);
        let data = await axios.get(url);

        let { pubkey, widget } = data.data || {};
        let { appUrl, iconUrl, buttonTitle, imageUrl, title, tags } =
          widget || {};
        if (
          !(
            pubkey &&
            widget &&
            appUrl &&
            iconUrl &&
            buttonTitle &&
            imageUrl &&
            title &&
            tags
          )
        ) {
          setIsMetadataLoading(false);
          return;
        }
        saveUsers([pubkey]);
        setMetadata(data.data);
        setIsMetadataLoading(false);
      } catch (err) {
        console.log(err);
        setIsMetadataLoading(false);
      }
    };
    if (url && !url.startsWith("http://localhost")) {
      getApp(url);
    }
  }, [url]);

  if (!url) return <></>;
  if (url.startsWith("http://localhost")) {
    return (
      <>
        {showGenerateFile && (
          <GenerateManifestFile exit={() => setShowGenerateFile()} />
        )}
        <button
          className="btn btn-normal btn-full"
          onClick={() => setShowGenerateFile(true)}
        >
          {t("ALWT79i")}
        </button>
      </>
    );
  }
  if (isMetadataLoding && !metadata) {
    return (
      <div className="fx-centered box-pad-h">
        <LoadingDots />
      </div>
    );
  }
  if (!isMetadataLoding && !metadata) {
    return (
      <>
        {showGenerateFile && (
          <GenerateManifestFile exit={() => setShowGenerateFile()} />
        )}
        <div className="fx-centered fx-col fit-container">
          <p className="c1-c p-italic">{t("Azghmnf")}</p>
          <button
            className="btn btn-normal btn-full"
            onClick={() => setShowGenerateFile(true)}
          >
            Generate a manifest file
          </button>
        </div>
      </>
    );
  }
  return <AppPreview metadata={metadata} />;
};

const GenerateManifestFile = ({ exit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userMetadata = useSelector((state) => state.userMetadata);
  const [developer, setDeveloper] = useState(userMetadata);
  const [developerPubkey, setDeveloperPubkey] = useState(userMetadata.pubkey);
  const [showUsersLists, setShowUsersList] = useState(false);
  const [title, setTitle] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [appIcon, setAppIcon] = useState("");
  const [appThumbnail, setAppThumbnail] = useState("");
  const [appButtonTitle, setButtonTitle] = useState("");
  const [tempTag, setTempTag] = useState("");
  const [tags, setTags] = useState([]);
  const [processDone, setProcessDone] = useState(false);

  const status = useMemo(() => {
    return (
      developerPubkey &&
      title &&
      appUrl &&
      appIcon &&
      appThumbnail &&
      appButtonTitle
    );
  }, [developerPubkey, title, appUrl, appIcon, appThumbnail, appButtonTitle]);

  useEffect(() => {
    if (developerPubkey !== developer.pubkey) {
      const data = getUser(developerPubkey);

      if (data) setDeveloper(data);
      else setDeveloper(getEmptyuserMetadata(developerPubkey));
    }
  }, [developerPubkey]);

  const handleAddTags = (e) => {
    if (e) e?.preventDefault();
    let t = tempTag.trim();
    if (t) {
      setTags((prev) => [...new Set([...prev, t.toLowerCase()])]);
      setTempTag("");
    }
  };
  const removeTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const generateFile = () => {
    if (!status) {
      dispatch(
        setToast({
          type: 2,
          desc: t("ALV8Khl"),
        }),
      );
      return;
    }
    const fileMetadata = {
      pubkey: developerPubkey,
      widget: {
        title: title,
        appUrl: appUrl,
        iconUrl: appIcon,
        imageUrl: appThumbnail,
        buttonTitle: appButtonTitle,
        tags: tags,
      },
    };
    downloadAsFile(fileMetadata, "application/json", "widget.json");
    setProcessDone(true);
  };

  return (
    <Overlay exit={exit} width={500}>
      {processDone && (
        <div
          className="fx-centered slide-up"
        >
          <div className="fx-centered box-pad-v fx-col">
            <Icon name="checkmark-tt" size={60} isColored />
            <h4 className="p-centered" style={{ lineHeight: "150%" }}>
              {t("AXPjOEg")}
            </h4>
            <button className="btn btn-normal" onClick={exit}>
              {t("AjhvX3x")}
            </button>
            <button
              className="btn btn-text-gray"
              onClick={() => setProcessDone(false)}
            >
              {t("AziGH3B")}
            </button>
          </div>
        </div>
      )}
      {!processDone && (
        <div
          className="slide-up"
        >
          <div
            className="box-pad-h-m box-pad-v-m fit-container fx-scattered"
            style={{ borderBottom: "1px solid var(--pale-gray)" }}
          >
            {!showUsersLists && (
              <>
                <div className="fx-centered">
                  <UserProfilePic
                    user_id={developer.pubkey}
                    img={developer.picture}
                    size={50}
                  />
                  <div>
                    <p>{t("ARKDj6i")}</p>
                    <h4>{developer.display_name || developer.name}</h4>
                  </div>
                </div>
                <button
                  className="btn btn-gray btn-small"
                  onClick={() => setShowUsersList(true)}
                >
                  {t("AFX6uFu")}
                </button>
              </>
            )}
            {showUsersLists && (
              <>
                <UserSearchBar
                  full={true}
                  onClick={(data) => {
                    setShowUsersList(false);
                    setDeveloperPubkey(data.pubkey);
                  }}
                />
                <button
                  className="btn btn-gst-red"
                  onClick={() => setShowUsersList(false)}
                >
                  {t("AB4BSCe")}
                </button>
              </>
            )}
          </div>
          <div className="box-pad-h-m box-pad-v-m fx-centered fx-start-h fx-start-v fx-col fit-container">
            <h4>{t("AvNU9bm")}</h4>
            <input
              placeholder={t("AMx6chG")}
              className="if ifs-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder={t("AvDC7MR")}
              className="if ifs-full"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
            />
            <div className="fit-container fx-scattered">
              <input
                placeholder={t("Aez4AQO")}
                className="if ifs-full"
                value={appIcon}
                onChange={(e) => setAppIcon(e.target.value)}
              />
              <UploadFile round={true} setImageURL={setAppIcon} />
            </div>
            <div className="fit-container fx-scattered">
              <input
                placeholder={t("A9gpP5w")}
                className="if ifs-full"
                value={appThumbnail}
                onChange={(e) => setAppThumbnail(e.target.value)}
              />
              <UploadFile round={true} setImageURL={setAppThumbnail} />
            </div>
            <input
              placeholder={t("ATPT0g6")}
              className="if ifs-full"
              value={appButtonTitle}
              onChange={(e) => setButtonTitle(e.target.value)}
            />
            <form
              className="fit-container fx-centered"
              onSubmit={handleAddTags}
            >
              <input
                placeholder={t("AZwaoRX")}
                className="if ifs-full"
                value={tempTag}
                onChange={(e) => setTempTag(e.target.value)}
              />
              <div className="round-icon" onClick={handleAddTags}>
                <Icon name="plus-sign" />
              </div>
            </form>
            {tags.length > 0 && (
              <div className="fit-container fx-centered fx-wrap fx-start-h fx-start-v">
                {tags.map((tag, index) => {
                  return (
                    <div
                      key={index}
                      className="fx-centered box-pad-h-s box-pad-v-s sc-s-18"
                    >
                      <p>{tag}</p>
                      <div
                        style={{ rotate: "-45deg" }}
                        className="box-pad-h-s"
                        onClick={() => removeTag(index)}
                      >
                        <Icon name="plus-sign" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div
              className="fit-container fx-centered fx-start-h fx-start-v fx-col sc-s-18 box-pad-h-s box-pad-v-s"
              style={{ gap: "3px" }}
            >
              <p className="c1-c p-bold">{t("AysGcoC")}</p>
              <p>
                {t("Am3EtRm")}{" "}
                <span
                  className="sticker sticker-orange-side p-bold"
                  style={{ display: "inline-block" }}
                >
                  /.well-known
                </span>{" "}
                {t("AC8oBlE")}
              </p>
            </div>
          </div>
          <div className="fit-container fx-centered box-pad-h-m box-pad-v-m">
            <button className="btn btn-gst-red fx" onClick={exit}>
              {t("AB4BSCe")}
            </button>
            <button
              className={`btn fx ${!status ? "btn-disabled" : "btn-normal"}`}
              disabled={!status}
              onClick={generateFile}
            >
              {t("ACrKIyB")}
            </button>
          </div>
        </div>
      )}
    </Overlay>
  );
};

const AppPreview = ({ metadata }) => {
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [author, setAuthor] = useState(getEmptyuserMetadata(metadata.pubkey));

  useEffect(() => {
    const data = getUser(metadata.pubkey);
    if (data) setAuthor(data);
  }, [nostrAuthors]);

  return (
    <div className="fit-container fx-scattered sc-s-18 box-pad-h-s box-pad-v-s">
      <div className="fx-centered">
        <div
          className="sc-s-18 bg-img cover-bg"
          style={{
            backgroundImage: `url(${metadata.widget.iconUrl})`,
            minWidth: "48px",
            aspectRatio: "1/1",
          }}
        ></div>
        <div>
          <p>{metadata.widget.title}</p>
          <div className="fx-centered">
            <UserProfilePic
              user_id={metadata.pubkey}
              img={author.picture}
              size={20}
            />
            <p className="gray-c">
              {t("AsXpL4b", { name: author.display_name || author.name })}
            </p>
          </div>
        </div>
      </div>
      <div>
        <a href={metadata.widget.appUrl} target="_blank">
          <Icon name="share-icon" />
        </a>
      </div>
    </div>
  );
};
