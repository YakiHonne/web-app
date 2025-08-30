import React, { useEffect, useMemo, useRef, useState } from "react";
import SWHandler from "smart-widget-handler";
import { useDispatch, useSelector } from "react-redux";
import {
  addWidgetPathToUrl,
  assignClientTag,
} from "@/Helpers/Helpers";
import {
  getWallets,
} from "@/Helpers/ClientHelpers";
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
import {
  downloadAsFile,
  getEmptyuserMetadata,
} from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import LoadingDots from "@/Components/LoadingDots";
import UploadFile from "@/Components/UploadFile";
import UserSearchBar from "@/Components/UserSearchBar";
import PaymentGateway from "@/Components/PaymentGateway";
import LoadingLogo from "@/Components/LoadingLogo";

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
  const [mbHide, setMbHide] = useState(true);
  const [url, setUrl] = useState("");
  const [urlToCheck, setUrlToCheck] = useState("");
  const [receivedLogs, setReceivedLogs] = useState([]);
  const [refresh, setSetRefresh] = useState(false);

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
        desc: "Invalid URL",
      })
    );
  };

  return (
    <>
      {!userKeys && <PagePlaceholder page={"nostr-not-connected"} />}
      {userKeys && (
        <div className="fit-container fx-centered fx-start-h fx-start-v">
          <div
            style={{ width: "min(100%,800px)", flex: 1.5 }}
            className={`${
              !mbHide ? "mb-hide-800" : ""
            } fx-centered box-marg-full`}
          >
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
          <div
            style={{
              height: "100vh",
              backgroundColor: "var(--pale-gray)",
              width: "1px",
              position: "sticky",
              top: 0,
              margin: "0 .5rem",
            }}
            className="mb-hide-800"
          ></div>
          <div
            style={{
              width: "min(100%,400px)",
              height: "100vh",
              overflow: "scroll",
              padding: "1rem .5rem",
              flex: 1,
            }}
            className={`box-pad-h-m box-pad-v sticky ${
              mbHide ? "mb-hide-800" : ""
            }`}
          >
            <div className="fx-centered fx-start-h fit-container box-marg-s desk-hide">
              <div
                className="round-icon-small  round-icon-tooltip "
                onClick={() => setMbHide(true)}
                data-tooltip={t("ATB2h6T")}
              >
                <div
                  className="arrow"
                  style={{ rotate: "90deg", scale: ".7" }}
                ></div>
              </div>
              <p>{t("AzZ1GXv")}</p>
            </div>
            <div className="fit-container fx-scattered">
              <h4 className=" box-marg-s fit-container">
                Your Mini App's domain
              </h4>
            </div>
            <input
              className={`if ifs-full ${
                urlToCheck ? "if-disabled" : ""
              } box-marg-s`}
              type="text"
              placeholder="https://example.com or http://localhost:3000"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              disabled={urlToCheck}
            />
            {!urlToCheck && (
              <button
                className="btn btn-normal btn-full"
                onClick={handleSetUrlToCheck}
              >
                Test app
              </button>
            )}
            {urlToCheck && (
              <div className="fx-centered">
                <button
                  className="btn btn-red btn-full slide-up"
                  onClick={() => {
                    setUrlToCheck("");
                    setReceivedLogs([]);
                  }}
                >
                  Test another app
                </button>
                <div
                  className="round-icon-small round-icon-tooltip slide-right"
                  data-tooltip={"Refresh"}
                  onClick={() => {
                    setSetRefresh(Date.now());
                    setReceivedLogs([]);
                  }}
                >
                  <div className="switch-arrows-v2"></div>
                </div>
              </div>
            )}
            <div
              className="fit-container fx-centered fx-col fx-start-h fx-start-v box-pad-v"
              style={{ rowGap: "5px" }}
            >
              {receivedLogs.length > 0 && <h4>App logs</h4>}
              <div className="box-pad-v-s"></div>
              {receivedLogs.map((log, index) => {
                return (
                  <div
                    className="fit-container fx-centered fx-col fx-start-h fx-start-v"
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
                          <p className="p-italic green-c p-medium">Sent data</p>
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
                          <p className="p-italic c1-c p-medium">
                            Received data
                          </p>
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
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            const codeRef = nanoid();
                            return !inline ? (
                              <pre
                                style={{ padding: "0", width: "350px" }}
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
        </div>
      )}
    </>
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
              iframeRef.current
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
              "The user is not connected",
              url,
              iframeRef.current
            );
            setReceivedLogs((prev) => [
              ...prev,
              {
                data: "The user is not connected",
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
              assignClientTag(event.data.tags)
            );
            if (signedEvent) {
              SWHandler.host.sendEvent(
                signedEvent,
                "success",
                url,
                iframeRef.current
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
                "Signing event failed",
                url,
                iframeRef.current
              );
              setReceivedLogs((prev) => [
                ...prev,
                {
                  data: "Signing event failed",
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
              })
            );
          }
        }
        if (event?.kind === "sign-publish") {
          try {
            let signedEvent = await InitEvent(
              event.data.kind,
              event.data.content,
              assignClientTag(event.data.tags)
            );
            if (!signedEvent) {
              SWHandler.host.sendError(
                "Signing event failed",
                url,
                iframeRef.current
              );
              setReceivedLogs((prev) => [
                ...prev,
                {
                  data: "Signing event failed",
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
                iframeRef.current
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
              })
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
              <LoadingLogo size={64} />
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
          Generate a manifest file
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
          <p className="c1-c p-italic">Could not find a manifest file!</p>
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
          desc: "Please fill all the required fields",
        })
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
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      {processDone && (
        <div
          className="sc-s-18 bg-sp fx-centered slide-up"
          style={{ width: "min(100%,400px)" }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="fx-centered box-pad-v fx-col">
            <div
              className="checkmark-tt"
              style={{ minWidth: "60px", minHeight: "60px" }}
            ></div>
            <h4 className="p-centered" style={{ lineHeight: "150%" }}>
              The file was generated successfully!
            </h4>
            <button className="btn btn-normal" onClick={exit}>
              Back to Playground
            </button>
            <button
              className="btn btn-text-gray"
              onClick={() => setProcessDone(false)}
            >
              Edit my file
            </button>
          </div>
        </div>
      )}
      {!processDone && (
        <div
          className="sc-s-18 bg-sp slide-up"
          style={{ width: "min(100%,500px)" }}
          onClick={(e) => {
            e.stopPropagation();
          }}
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
                    <p>Developer</p>
                    <h4>{developer.display_name || developer.name}</h4>
                  </div>
                </div>
                <button
                  className="btn btn-gray btn-small"
                  onClick={() => setShowUsersList(true)}
                >
                  Change
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
                  Cancel
                </button>
              </>
            )}
          </div>
          <div className="box-pad-h-m box-pad-v-m fx-centered fx-start-h fx-start-v fx-col fit-container">
            <h4>Widget metadata</h4>
            <input
              placeholder="Widget title (required)"
              className="if ifs-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="App URL (required)"
              className="if ifs-full"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
            />
            <div className="fit-container fx-scattered">
              <input
                placeholder="App icon URL (required)"
                className="if ifs-full"
                value={appIcon}
                onChange={(e) => setAppIcon(e.target.value)}
              />
              <UploadFile round={true} setImageURL={setAppIcon} />
            </div>
            <div className="fit-container fx-scattered">
              <input
                placeholder="App thumbnail URL (required)"
                className="if ifs-full"
                value={appThumbnail}
                onChange={(e) => setAppThumbnail(e.target.value)}
              />
              <UploadFile round={true} setImageURL={setAppThumbnail} />
            </div>
            <input
              placeholder="App button title (required)"
              className="if ifs-full"
              value={appButtonTitle}
              onChange={(e) => setButtonTitle(e.target.value)}
            />
            <form
              className="fit-container fx-centered"
              onSubmit={handleAddTags}
            >
              <input
                placeholder="Add tags"
                className="if ifs-full"
                value={tempTag}
                onChange={(e) => setTempTag(e.target.value)}
              />
              <div className="round-icon" onClick={handleAddTags}>
                <div className="plus-sign"></div>
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
                        <div className="plus-sign"></div>
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
              <p className="c1-c p-bold">Important</p>
              <p>
                Please place the generated file in a{" "}
                <span
                  className="sticker sticker-orange-side p-bold"
                  style={{ display: "inline-block" }}
                >
                  /.well-known
                </span>{" "}
                folder in a publicly accessible domain
              </p>
            </div>
          </div>
          <div className="fit-container fx-centered box-pad-h-m box-pad-v-m">
            <button className="btn btn-gst-red fx" onClick={exit}>
              Cancel
            </button>
            <button
              className={`btn fx ${!status ? "btn-disabled" : "btn-normal"}`}
              disabled={!status}
              onClick={generateFile}
            >
              Generate
            </button>
          </div>
        </div>
      )}
    </div>
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
          <div className="share-icon"></div>
        </a>
      </div>
    </div>
  );
};
