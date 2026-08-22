import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Lottie from "lottie-react";
import { nanoid } from "nanoid";
import PagePlaceholder from "@/Components/PagePlaceholder";
import UploadFile from "@/Components/UploadFile";
import {
  bytesTohex,
  getEmptyuserMetadata,
  getParsedSW,
  timeAgo,
} from "@/Helpers/Encryptions";
import Spinner from "@/Components/Spinner";
import Select from "@/Components/Select";
import OptionsDropdown from "@/Components/OptionsDropdown";
import UserSearchBar from "@/Components/UserSearchBar";
import NProfilePreviewer from "@/Components/NProfilePreviewer";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { generateSecretKey, nip19 } from "nostr-tools";
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { Widget } from "smart-widget-previewer";
import { getUser, InitEvent } from "@/Helpers/Controlers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import PostNoteWithWidget from "@/Components/PostNoteWithWidget";
import { customHistory } from "@/Helpers/History";
import axios from "axios";
import UserProfilePic from "@/Components/UserProfilePic";
import { saveUsers } from "@/Helpers/DB";
import { addWidgetPathToUrl } from "@/Helpers/Helpers";
import widget from "@/JSONs/widgets.json";
import { useRouter } from "next/router";
import { getPostToEdit } from "@/Helpers/ClientHelpers";
import { DraggableComp } from "@/Components/DraggableComp";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import ArrowUp from "@/Components/ArrowUp";
const SWT_YAKIHONNE = "https://swt.yakihonne.com";

const getLocalSWv2Drafts = () => {
  try {
    let previousDrafts = localStorage?.getItem("swv2-drafts") || false;
    previousDrafts = previousDrafts ? JSON.parse(previousDrafts) : [];
    return previousDrafts;
  } catch (err) {
    console.log(err);
    return [];
  }
};
const getLocalSWv2CDraft = () => {
  try {
    let current = localStorage?.getItem("swv2-cdraft") || false;
    current = current ? JSON.parse(current) : false;
    return current;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default function SmartWidgetEditor() {
  let { query } = useRouter();
  let { edit, clone } = query || {};
  let toEdit = edit ? getPostToEdit(edit) : false;
  let toClone = clone ? getPostToEdit(clone) : clone;
  const userKeys = useSelector((state) => state.userKeys);
  const [buildOption, setBuildOption] = useState("normal");
  const [buildOptions, setBuildOptions] = useState(query ? false : true);
  const [template, setTemplate] = useState(
    toEdit || toClone ? toEdit || toClone : getLocalSWv2CDraft(),
  );
  const [identifier, setIdentifier] = useState(edit ? true : false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const getTemplates = async () => {
      try {
        let t = await axios.post(SWT_YAKIHONNE, undefined, {
          withCredentials: true,
        });
        setTemplates(t.data);
      } catch (err) {
        console.log(err);
      }
    };
    getTemplates();
  }, []);

  const handleSelectTemplate = (t) => {
    setTemplate(t);
    setBuildOption("normal");
    setBuildOptions(false);
    setIdentifier(false);
  };

  const handleSelectDraft = (draft, publish) => {
    setTemplate(draft);
    setBuildOptions(false);
    setIdentifier(false);
  };
  return (
    <div>
      <ArrowUp />
      <div className="fit-container fx-centered fx-start-h fx-start-v">
        <div className="main-middle box-pad-h-m">
          {userKeys && (
            <>
              {(userKeys.sec || userKeys.ext || userKeys.bunker) && (
                <>
                  {buildOptions && (
                    <>
                      {buildOption === "normal" && (
                        <BuildOptions
                          setTemplate={(data, newID) => {
                            setBuildOptions(false);
                            setTemplate(data);
                          }}
                          template={template}
                          setBuildOption={(option) => setBuildOption(option)}
                          back={() => setBuildOptions(false)}
                        />
                      )}
                      {buildOption === "template" && (
                        <SWTemplates
                          setBuildOption={() => setBuildOption("normal")}
                          setTemplate={handleSelectTemplate}
                          templates={templates}
                        />
                      )}
                      {buildOption === "drafts" && (
                        <SWDrafts
                          back={setBuildOption}
                          setTemplate={handleSelectDraft}
                        />
                      )}
                    </>
                  )}
                  {!buildOptions && (
                    <SmartWidgetBuilder
                      back={(data) => {
                        setBuildOptions(true);
                        setTemplate(data);
                      }}
                      template={template}
                      identifier={identifier}
                    />
                  )}
                </>
              )}
              {!userKeys.sec && !userKeys.ext && !userKeys.bunker && (
                <PagePlaceholder page={"nostr-unauthorized"} />
              )}
            </>
          )}
          {!userKeys && <PagePlaceholder page={"nostr-not-connected"} />}
        </div>
      </div>
    </div>
  );
}

const BuildOptions = ({ setTemplate, template, back, setBuildOption }) => {
  const { t } = useTranslation();
  return (
    <div className="fit-container fx-centered fx-col">
      <div style={{ width: "min(100%,550px)" }} className="fx-centered fx-col">
        <div style={{ width: "350px" }} className="fx-centered">
          <Lottie animationData={widget} loop={true} />
        </div>
        <div className="fx-centered fx-col">
          <h3 className="p-centered">{t("AgnT2y8")}</h3>
          <p className="gray-c p-centered">{t("AG1WdKb")}</p>
        </div>
        <div
          className="fit-container fx-centered fx-wrap box-pad-v"
          style={{ columnGap: "16px" }}
        >
          <div
            className="fx fx-centered fx-col sc-s-18 bg-sp option pointer"
            style={{ height: "200px" }}
            onClick={() => setTemplate(false, true)}
          >
            <div className="round-icon">
              <Icon name="plus-sign" />
            </div>
            <p className="gray-c">{t("AbvONJd")}</p>
          </div>
          <div
            className="fx fx-centered fx-col sc-s-18 bg-sp option pointer"
            style={{ height: "200px" }}
            onClick={() => setBuildOption("drafts")}
          >
            <Icon name="smart-widget-draft" size={36} />
            <p className="gray-c">{t("AaXbNvT")}</p>
          </div>
          <div
            className="fx fx-centered fx-col sc-s-18 bg-sp option pointer"
            style={{ height: "200px" }}
            onClick={() => setBuildOption("template")}
          >
            <Icon name="frames" size={36} />
            <p className="gray-c">{t("A60QDNZ")}</p>
          </div>
        </div>
        {template && (
          <div className="fx-centered pointer" onClick={back}>
            <div
              className="round-icon-small roun-icon-tooltip"
              data-tooltip={t("AufOzcc")}
            >
              <Icon name="arrow" transform="rotate(90deg)" />
            </div>
            <p className="orange-c">{t("ARVqa3s")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SmartWidgetBuilder = ({ back, template, identifier }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [isSaving, setIsSaving] = useState(false);
  const [swType, setSwType] = useState(template?.type || "basic");
  const [swMetadataUrl, setSwMetadataUrl] = useState("");
  const [swMetadataIsLoading, setSwMetadataIsLoading] = useState(false);
  const [swMetadata, setSwMetadata] = useState(false);
  const [swIcon, setSwIcon] = useState(template?.icon || "");
  const [swTitle, setSwTitle] = useState(template?.title || "");
  const [selectedComp, setSelectedComp] = useState("");
  const canvasRef = useRef(null);
  const [showSaveDraft, setShowSaveDraft] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [swImage, setSwImage] = useState(template ? template.image : "");
  const [swInput, setSwInput] = useState(
    template ? template.input : t("AEyQqPE"),
  );
  const [swButtons, setSwButtons] = useState(
    template
      ? template.buttons
      : [{ type: "redirect", label: "Button", url: "" }],
  );
  const [swComponents, setSwComponents] = useState(
    template
      ? template.components
      : [
        { value: swImage, type: "image" },
        { value: swInput, type: "input" },
        { value: swButtons, type: "button" },
      ],
  );
  const [widgetToPostInNote, setWidgetToPostInNote] = useState(false);
  const swTypes = [
    {
      display_name: "Basic",
      value: "basic",
    },
    {
      display_name: "Action",
      value: "action",
    },
    {
      display_name: "Tool",
      value: "tool",
    },
  ];

  useEffect(() => {
    if (template && template.type !== "basic") {
      setSwMetadataUrl(template.buttons[0].url);
      getApp(template.buttons[0].url);
    }
  }, []);

  useEffect(() => {
    if (swComponents.length < 3) {
      setSwComponents([
        { value: swImage, type: "image" },
        { value: swButtons, type: "button" },
      ]);
      return;
    }
    setSwComponents([
      { value: swImage, type: "image" },
      { value: swInput, type: "input" },
      { value: swButtons, type: "button" },
    ]);

    setIsSaving(true);
    let current = {
      title: "",
      image: swImage,
      input: swInput,
      buttons: swButtons,
      components: swComponents,
    };
    if (swImage || swButtons.length > 1 || swComponents.length <= 2) {
      localStorage?.setItem("swv2-cdraft", JSON.stringify(current));
    } else {
      localStorage?.removeItem("swv2-cdraft");
    }
    let timer = setTimeout(() => {
      setIsSaving(false);
      clearTimeout(timer);
    }, [500]);
    return () => {
      clearTimeout(timer);
    };
  }, [swImage, swInput, swButtons]);

  const handleInputInCompSet = () => {
    if (swComponents.length > 2) {
      setSwComponents(swComponents.filter((_) => _.type !== "input"));
      return;
    }
    setSwComponents([
      { value: swImage, type: "image" },
      { value: swInput, type: "input" },
      { value: swButtons, type: "button" },
    ]);
  };

  const handleAddButton = () => {
    let btn = { type: "redirect", label: "Button", url: "" };
    setSwButtons((prev) => [...prev, btn]);
  };
  const handleRemoveButton = (index) => {
    let selectedCompIndex =
      selectedComp && selectedComp.includes("button")
        ? parseInt(selectedComp.split(":")[1])
        : 0;
    if (
      selectedComp.includes("button:") &&
      selectedCompIndex > swButtons.length - 2
    )
      setSelectedComp("");
    setSwButtons(swButtons.filter((_, _index) => _index !== index));
  };

  const handlePReview = async () => {
    if (preview) {
      setPreview(false);
      return;
    }
    setSelectedComp("");
    let tags;
    if (swType === "basic") {
      tags = getTagsArray();
      if (!tags) return;
    } else {
      if (!swMetadata) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AbfIPKv"),
          }),
        );
        return;
      }
      tags = [
        ["image", swMetadata.widget.imageUrl],
        ["button", swMetadata.widget.buttonTitle, "app", swMetadata.widget.appUrl],
      ];
    }
    const sk = bytesTohex(generateSecretKey());
    let ndkInstance_ = new NDK();
    ndkInstance_.signer = new NDKPrivateKeySigner(sk);
    let identifier = `unpublished_smart_widget_${Date.now()}`;
    let tags_ = [["d", identifier], ["l", swType], ["icon", swIcon], ...tags];
    const ndkEvent = new NDKEvent(ndkInstance_);
    ndkEvent.kind = 30033;
    ndkEvent.content = swTitle;
    ndkEvent.tags = tags_;
    await ndkEvent.sign();
    setPreview(ndkEvent.rawEvent());
  };
  const handlePublish = async () => {
    if (!swTitle) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AbfIPKv"),
        }),
      );
      return;
    }
    setSelectedComp("");

    if (swType === "basic") await publishBasicSW();
    if (swType !== "basic") await publishNoneBasicSW();
  };

  const publishBasicSW = async () => {
    let tags = getTagsArray();
    let d = identifier ? template.d : nanoid();
    if (!tags) return;
    let eventInitEx = await InitEvent(30033, swTitle, [
      [
        "client",
        "Yakihonne",
        "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
      ],
      ["published_at", `${Math.floor(Date.now() / 1000)}`],
      ["d", d],
      ["l", swType],
      ["icon", swIcon],
      ...tags,
    ]);
    if (!eventInitEx) return;
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      }),
    );
    let sub = ndkInstance.subscribe(
      [{ kinds: [30033], ids: [eventInitEx.id] }],
      {
        closeOnEose: true,
        cacheUsage: "CACHE_FIRST",
      },
    );

    sub.on("event", (event) => {
      let naddr = nip19.naddrEncode({
        pubkey: event.pubkey,
        kind: event.kind,
        identifier: d,
      });
      setWidgetToPostInNote(
        `https://yakihonne.com/smart-widget-checker?naddr=${naddr}`,
      );
      sub.stop();
    });
  };

  const publishNoneBasicSW = async () => {
    if (!swMetadata) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AbfIPKv"),
        }),
      );
      return;
    }

    let d = identifier ? template.d : nanoid();
    let eventInitEx = await InitEvent(30033, swTitle, [
      [
        "client",
        "Yakihonne",
        "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
      ],
      ["published_at", `${Math.floor(Date.now() / 1000)}`],
      ["d", d],
      ["l", swType],
      ["icon", swIcon],
      ["image", swMetadata.widget.imageUrl],
      [
        "button",
        swMetadata.widget.buttonTitle,
        "app",
        swMetadata.widget.appUrl,
      ],
    ]);
    if (!eventInitEx) return;
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      }),
    );
    let sub = ndkInstance.subscribe(
      [{ kinds: [30033], ids: [eventInitEx.id] }],
      {
        closeOnEose: true,
        cacheUsage: "CACHE_FIRST",
      },
    );

    sub.on("event", (event) => {
      let naddr = nip19.naddrEncode({
        pubkey: event.pubkey,
        kind: event.kind,
        identifier: d,
      });
      setWidgetToPostInNote(
        `https://yakihonne.com/smart-widget-checker?naddr=${naddr}`,
      );
      sub.stop();
    });
  };

  const getTagsArray = () => {
    let imageTag = swImage ? ["image", swImage] : false;
    let inputTag = swInput
      ? ["input", swInput]
      : swComponents.length > 2
        ? false
        : true;
    let buttonsTag = swButtons.filter((_) => _.label && _.url);
    buttonsTag =
      buttonsTag.length > 0
        ? buttonsTag.map((_) => ["button", _.label, _.type, _.url])
        : false;
    let tags = [];
    if (!imageTag) {
      dispatch(
        setToast({
          type: 2,
          desc: t("Ar85kI3"),
        }),
      );
      return;
    }
    if (!inputTag) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AKIvtnO"),
        }),
      );
      return;
    }
    if (!buttonsTag) {
      dispatch(
        setToast({
          type: 2,
          desc: t("ASEZMzR"),
        }),
      );
      return;
    }

    tags = [imageTag, ...buttonsTag];
    if (inputTag && swComponents.length > 2) tags.push(inputTag);

    return tags;
  };

  const handleDragEnd = (res) => {
    if (!res.destination || res.destination.index === res.source.index) return;
    let tempArr = structuredClone(swButtons);
    let selectedCompIndex =
      selectedComp && selectedComp.includes("button")
        ? parseInt(selectedComp.split(":")[1])
        : false;
    let [reorderedArr] = tempArr.splice(res.source.index, 1);
    tempArr.splice(res.destination.index, 0, reorderedArr);
    setSwButtons(tempArr);

    if (selectedCompIndex !== false) {
      if (selectedComp === `button:${res.source.index}`)
        setSelectedComp(`button:${res.destination.index}`);
      if (selectedComp !== `button:${res.source.index}`) {
        if (res.destination.index > selectedCompIndex)
          setSelectedComp(`button:${Math.max(0, selectedCompIndex - 1)}`);
        else if (res.destination.index < selectedCompIndex)
          setSelectedComp(
            `button:${Math.min(swButtons.length - 1, selectedCompIndex + 1)}`,
          );
        else if (res.destination.index === selectedCompIndex) {
          if (res.source.index < selectedCompIndex)
            setSelectedComp(`button:${Math.max(0, selectedCompIndex - 1)}`);
          else
            setSelectedComp(
              `button:${Math.min(swButtons.length - 1, selectedCompIndex + 1)}`,
            );
        }
      }
    }
  };
  const handleBack = () => {
    let current = {
      title: swTitle,
      image: swImage,
      input: swInput,
      buttons: swButtons,
      components: swComponents,
    };
    back(current);
  };

  const getApp = async (url_) => {
    try {
      let url = addWidgetPathToUrl(url_ || swMetadataUrl);
      if (!url) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AOF2uGu"),
          }),
        );
        return;
      }
      setSwMetadataIsLoading(true);
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
        dispatch(
          setToast({
            type: 2,
            desc: t("AOF2uGu"),
          }),
        );
        return;
      }
      saveUsers([pubkey]);
      setSwMetadata(data.data);
      if (!url_) setSwTitle(title);
      setSwIcon(iconUrl);
      setSwMetadataIsLoading(false);
    } catch (err) {
      console.log(err);
      setSwMetadataIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AOF2uGu"),
        }),
      );
    }
  };

  const handleSwitchSWTypes = (data) => {
    setPreview(false);
    setSwType(data);
  };

  return (
    <>
      {showSaveDraft && (
        <SaveDraft
          exit={() => setShowSaveDraft(false)}
          swButtons={swButtons}
          swComponents={swComponents}
          swImage={swImage}
          swInput={swInput}
        />
      )}
      {showNextOverlay && (
        <PublishOverlay
          exit={() => setShowNextOverlay(false)}
          swTitle={swTitle}
          setSwTitle={setSwTitle}
          handlePublish={handlePublish}
          openSaveDraft={() => {
            setShowNextOverlay(false);
            setShowSaveDraft(true);
          }}
        />
      )}
      {widgetToPostInNote && (
        <PostNoteWithWidget
          widget={widgetToPostInNote}
          onlyNext={false}
          exit={() => customHistory.push("/smart-widgets")}
        />
      )}
      <div
        ref={canvasRef}
        className="fit-container fx-centered fx-col fx-start-h"
        style={{ maxWidth: "700px", margin: "0 auto" }}
      >
        <div
          className="fit-container fx-scattered sticky sw-editor-sticky-solid"
          style={{ zIndex: 120, padding: ".25rem 0" }}
        >
          <div
            className="round-icon round-icon-tooltip bg-dropdown"
            data-tooltip={t("ATB2h6T")}
            onClick={handleBack}
          >
            <Icon name="arrow" transform="rotate(90deg)" />
          </div>
          <div className="fx-centered" style={{ gap: "8px" }}>
            {swType === "basic" && (
              <div style={{ position: "relative" }}>
                <div
                  className={`round-icon round-icon-tooltip bg-dropdown ${selectedComp || layersOpen ? "sw-editor-toolbar-btn-active" : ""
                    }`}
                  data-tooltip={t("AYmIvXo")}
                  onClick={() => {
                    if (selectedComp) {
                      setSelectedComp("");
                      setLayersOpen(true);
                    } else {
                      setLayersOpen((prev) => !prev);
                    }
                  }}
                  style={{
                    pointerEvents: preview ? "none" : "auto",
                    opacity: preview ? ".5" : "1",
                  }}
                >
                  <Icon name="layers" />
                </div>
                <SWEditorToolbar
                  swType={swType}
                  layersOpen={layersOpen}
                  setLayersOpen={setLayersOpen}
                  swComponents={swComponents}
                  selectedComp={selectedComp}
                  setSelectedComp={setSelectedComp}
                  handleInputInCompSet={handleInputInCompSet}
                  handleRemoveButton={handleRemoveButton}
                  swButtons={swButtons}
                  setSwButtons={setSwButtons}
                  swImage={swImage}
                  setSwImage={setSwImage}
                  swInput={swInput}
                  setSwInput={setSwInput}
                  canvasRef={canvasRef}
                />
              </div>
            )}
            <Select
              value={swType}
              options={swTypes}
              setSelectedValue={handleSwitchSWTypes}
              disabled={swMetadataIsLoading}
            />
          </div>
        </div>
        {["action", "tool"].includes(swType) && (
          <div
            className="fit-container fx-centered"
            style={{ gap: "8px", marginBottom: "1rem" }}
          >
            <input
              type="text"
              className={`if ifs-full ${swMetadata ? "if-disabled" : ""}`}
              placeholder={t("AGzvrvd")}
              value={swMetadataUrl}
              disabled={swMetadata}
              onChange={(e) => setSwMetadataUrl(e.target.value)}
            />
            {!swMetadata && (
              <button
                className="btn btn-normal"
                disabled={swMetadataIsLoading}
                onClick={() => getApp()}
              >
                {swMetadataIsLoading ? <Spinner /> : t("ACfptgy")}
              </button>
            )}
            {swMetadata && (
              <button
                className="btn btn-red"
                onClick={() => setSwMetadata(false)}
              >
                {t("AitJw8N")}
              </button>
            )}
          </div>
        )}
        {swMetadata && swType !== "basic" && (
          <div className="fit-container" style={{ marginBottom: "1rem" }}>
            <AppPreview metadata={swMetadata} />
          </div>
        )}
        <div
          className="fit-container fx-scattered"
          style={{ marginTop: ".25rem", marginBottom: "1rem" }}
        >
          <button
            className="btn btn-normal fx-centered"
            onClick={handlePReview}
            disabled={isSaving}
          >
            {isSaving ? (
              <Spinner />
            ) : preview ? (
              t("AsXohpb")
            ) : (
              t("Ao1TlO5")
            )}
          </button>
          <button
            className="btn btn-normal fx-centered"
            onClick={() => setShowNextOverlay(true)}
          >
            {t("AgGi8rh")}
          </button>
        </div>
        {!preview && swType === "basic" && (
          <div
            className="fit-container sc-s-18 bg-sp fx-centered fx-col"
            style={{
              padding: ".5rem",
              overflow: "visible",
            }}
          >
            <div
              className="fit-container pointer"
              style={{
                padding: ".30rem",
                borderColor:
                  selectedComp === "image" ? "var(--c1)" : "var(--pale-gray)",
                borderRadius: "var(--border-r-18)",
                borderStyle: "dashed",
                borderWidth: "2px",
              }}
              onClick={() =>
                setSelectedComp(selectedComp === `image` ? "" : `image`)
              }
            >
              <div
                className="fit-container fx-centered pointer sc-s-18 bg-sp"
                style={{
                  border: "none",
                  borderBottom: "1px solid var(--pale-gray)",
                }}
              >
                {swImage && <img style={{ width: "100%" }} src={swImage} />}
                {!swImage && (
                  <div
                    className="fit-container fx-centered"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Icon name="image" size={24} />
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                gap: "8px",
              }}
              className="fit-container fx-centered fx-col"
            >
              <div className="fit-container fx-scattered">
                {swComponents.length > 2 && (
                  <div
                    className="fit-container pointer"
                    style={{
                      padding: ".30rem",
                      borderColor:
                        selectedComp === "input"
                          ? "var(--c1)"
                          : "var(--pale-gray)",
                      borderRadius: "var(--border-r-18)",
                      borderStyle: "dashed",
                      borderWidth: "2px",
                    }}
                    onClick={() =>
                      setSelectedComp(selectedComp === `input` ? "" : `input`)
                    }
                  >
                    <input
                      className={"if ifs-full pointer"}
                      placeholder={swInput}
                    />
                  </div>
                )}
                {swComponents.length < 3 && (
                  <>
                    <div
                      className="fx-centered fit-container sc-s-d box-pad-h-s box-pad-v-s pointer"
                      style={{
                        borderRadius: "var(--border-r-18)",
                        position: "relative",
                      }}
                      onClick={handleInputInCompSet}
                    >
                      <Icon name="plus-sign" />{" "}
                      <p className="gray-c">{t("AqrGbmn")}</p>
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  gap: "8px",
                }}
                className="sw-fit-container sw-fx-centered sw-fx-scattered sw-fx-wrap"
              >
                {swButtons.map((_, index) => {
                  if (index < 3)
                    return (
                      <div
                        style={{
                          flex: 1,
                          padding: ".30rem",
                          borderColor:
                            selectedComp === `button:${index}`
                              ? "var(--c1)"
                              : "var(--pale-gray)",
                          borderRadius: "var(--border-r-18)",
                          borderStyle: "dashed",
                          borderWidth: "2px",
                        }}
                        onClick={() =>
                          setSelectedComp(
                            selectedComp === `button:${index}`
                              ? ""
                              : `button:${index}`,
                          )
                        }
                        key={index}
                      >
                        <button className={"btn-gray btn btn-full"}>
                          <p className="sw-p-one-line">{_.label}</p>
                        </button>
                      </div>
                    );
                })}
              </div>
              {swButtons.length > 3 && (
                <div
                  style={{
                    gap: "8px",
                  }}
                  className="sw-fit-container sw-fx-centered sw-fx-scattered sw-fx-wrap"
                >
                  {swButtons.map((_, index) => {
                    if (index > 2)
                      return (
                        <div
                          style={{
                            flex: 1,
                            padding: ".30rem",
                            borderColor:
                              selectedComp === `button:${index}`
                                ? "var(--c1)"
                                : "var(--pale-gray)",
                            borderRadius: "var(--border-r-18)",
                            borderStyle: "dashed",
                            borderWidth: "2px",
                          }}
                          onClick={() =>
                            setSelectedComp(
                              selectedComp === `button:${index}`
                                ? ""
                                : `button:${index}`,
                            )
                          }
                          key={index}
                        >
                          <button className={"btn-gray btn btn-full"}>
                            <p className="sw-p-one-line">{_.label}</p>
                          </button>
                        </div>
                      );
                  })}
                </div>
              )}
              {swButtons.length < 6 && (
                <div
                  className="fx-centered fit-container sc-s-d box-pad-h-s box-pad-v-s pointer"
                  style={{
                    borderRadius: "var(--border-r-18)",
                    position: "relative",
                  }}
                  onClick={handleAddButton}
                >
                  <Icon name="plus-sign" />{" "}
                  <p className="gray-c">{t("Amg4EKo")}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {!preview && swType !== "basic" && (
          <div
            className="fit-container sc-s-18 bg-sp fx-centered fx-col"
            style={{
              overflow: "visible",
            }}
          >
            {swMetadata && (
              <>
                <div
                  className="fit-container fx-centered pointer sc-s-18 bg-sp"
                  style={{
                    border: "none",
                    borderBottom: "1px solid var(--pale-gray)",
                  }}
                >
                  {swMetadata.widget.imageUrl && (
                    <img
                      style={{ width: "100%" }}
                      src={swMetadata.widget.imageUrl}
                    />
                  )}
                  {!swMetadata.widget.imageUrl && (
                    <div
                      className="fit-container fx-centered"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <Icon name="image" size={24} />
                    </div>
                  )}
                </div>
                {swMetadata.widget.buttonTitle && (
                  <div className="box-pad-v-m fit-container box-pad-h fx-centered">
                    <p className="p-one-line ">
                      {swMetadata.widget.buttonTitle}
                    </p>
                  </div>
                )}
              </>
            )}
            {!swMetadata && (
              <div
                className="fit-container fx-centered sc-s"
                style={{ aspectRatio: "1/1" }}
              >
                <Icon v={2} name="puzzle" size={40} />
              </div>
            )}
          </div>
        )}
        {preview && (
          <div className="fit-container" style={{ width: "100%" }}>
            <Widget
              event={preview}
              onZapButton={() => alert(t("AXNd5xs"))}
              onNostrButton={() => alert(t("AbzzoX6"))}
              widgetBorderColor="var(--pale-gray)"
            />
          </div>
        )}
        <div style={{ height: "2rem" }}></div>
      </div>
    </>
  );
};

const SWEditorToolbar = ({
  swType,
  layersOpen,
  setLayersOpen,
  swComponents,
  selectedComp,
  setSelectedComp,
  handleInputInCompSet,
  handleRemoveButton,
  swButtons,
  setSwButtons,
  swImage,
  setSwImage,
  swInput,
  setSwInput,
  canvasRef,
}) => {
  const toolbarRef = useRef(null);
  const editPanelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const insideToolbar = toolbarRef.current?.contains(e.target);
      const insideEditPanel = editPanelRef.current?.contains(e.target);
      const insideCanvas = canvasRef?.current?.contains(e.target);
      const insideEscapedDropdown = e.target?.closest?.(".select-escaped-dropdown");
      if (insideCanvas) {
        setLayersOpen(false);
        return;
      }
      if (!insideToolbar && !insideEditPanel && !insideEscapedDropdown) {
        setLayersOpen(false);
        setSelectedComp("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (swType !== "basic" || (!layersOpen && !selectedComp)) return null;

  return (
    <div ref={toolbarRef}>
      {!selectedComp && layersOpen && (
        <div className="sw-editor-toolbar-wrap">
          <div className="sw-editor-toolbar-panel bg-dropdown">
            <div className="sw-editor-layers-list">
              <p className="gray-c p-medium box-pad-h-s">{t("AYmIvXo")}</p>
              {swComponents.map((comp, index) => (
                <div className="sw-editor-dock-comp" key={index}>
                  <div
                    className="fx-scattered pointer sw-layer-row"
                    onClick={(e) => {
                      e.stopPropagation();
                      comp.type === "button"
                        ? setSelectedComp(`button:0`)
                        : setSelectedComp(comp.type);
                    }}
                  >
                    <div className="fx-centered fx-start-h">
                      <div
                        className={`sw-layer-icon ${comp.type === "input"
                          ? "container-one-24"
                          : `${comp.type}-24`
                          }`}
                      ></div>
                      <p className="p-one-line sw-layer-label">{comp.type}</p>
                    </div>
                    {comp.type === "input" && (
                      <Icon
                        name="trash"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputInCompSet();
                        }}
                      />
                    )}
                  </div>
                  {Array.isArray(comp.value) && (
                    <div className="sw-editor-dock-comp-children">
                      <DraggableComp
                        children={comp.value.map((_) => {
                          let id = nanoid();
                          return { ..._, id };
                        })}
                        setNewOrderedList={(data) => setSwButtons(data)}
                        component={ButtonItem}
                        props={{
                          handleRemoveButton,
                          setSelectedComp,
                          outterComp: comp,
                          selectedComp,
                        }}
                        background={false}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedComp &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="sw-editor-edit-wrap">
            <div className="sw-editor-edit-panel bg-dropdown" ref={editPanelRef}>
              <div className="sw-editor-toolbar-panel-context">
                {selectedComp === "image" && (
                  <CustomizeImage value={swImage} setValue={setSwImage} />
                )}
                {selectedComp === "input" && (
                  <CustomizeInput
                    value={swInput}
                    setValue={setSwInput}
                    onRemove={() => {
                      handleInputInCompSet();
                      setSelectedComp("");
                    }}
                  />
                )}
                {selectedComp.includes("button") && (
                  <CustomizeButton
                    index={parseInt(selectedComp.split(":")[1])}
                    value={swButtons}
                    setValue={setSwButtons}
                    swComps={swComponents}
                    onRemove={
                      swButtons.length > 1
                        ? () =>
                          handleRemoveButton(
                            parseInt(selectedComp.split(":")[1]),
                          )
                        : null
                    }
                  />
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const ButtonItem = ({
  item,
  index,
  handleRemoveButton,
  outterComp,
  setSelectedComp,
  selectedComp,
}) => {
  return (
    <div
      className="fit-container fx-scattered sc-s pointer"
      style={{
        padding: ".5rem",
        borderColor: selectedComp === `button:${index}` ? "var(--c1)" : "",
        borderRadius: "var(--border-r-6)",
        backgroundColor: "transparent",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComp(
          selectedComp === `button:${index}` ? "" : `button:${index}`,
        );
      }}
    >
      <div className="fx-centered fx-start-h">
        {outterComp.value.length > 1 && (
          <div className={`drag-el box-pad-h-s`}></div>
        )}
        <p>
          button &#x2192; <span className="c1-c">{item.type}</span>
        </p>
      </div>
      {outterComp.value.length > 1 && (
        <Icon
          name="trash"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveButton(index);
          }}
        />
      )}
    </div>
  );
};

const AppPreview = ({ metadata }) => {
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

const CustomizeImage = ({ value, setValue }) => {
  return (
    <div className="fit-container fx-centered fx-col fx-start-v">
      <p className="gray-c">{t("ArKQgmW")}</p>
      <div className="fx-centered fit-container">
        <input
          placeholder={t("AA8XLSe")}
          className="if ifs-full"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <UploadFile round={true} setImageURL={(data) => setValue(data)} />
      </div>
    </div>
  );
};

const CustomizeInput = ({ value, setValue, onRemove }) => {
  return (
    <div className="fit-container fx-centered fx-col fx-start-v">
      <p className="gray-c">{t("AAmUHSp")}</p>
      <input
        placeholder={t("Ato9VGt")}
        className="if ifs-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {onRemove && (
        <button className="btn btn-red btn-full" onClick={onRemove}>
          {t("AzkTxuy")}
        </button>
      )}
    </div>
  );
};

const CustomizeButton = ({ index, value, setValue, swComps, onRemove }) => {
  const buttonTypes = [
    {
      display_name: "Redirect",
      value: "redirect",
    },
    {
      display_name: "Zap",
      value: "zap",
    },
    {
      display_name: "Nostr",
      value: "nostr",
    },
    {
      display_name: "Post",
      value: "post",
    },
  ];
  const postFunctions = [
    {
      display_name: t("A9rc7Ni"),
      value: "https://",
    },
    {
      display_name: t("AowMF91"),
      value: "https://swt.yakihonne.com/user-search",
    },
    {
      display_name: t("Ar6CqVi"),
      value: "https://swt.yakihonne.com/quote",
    },
    {
      display_name: t("ARx9Q6e"),
      value: "https://swt.yakihonne.com/trending-notes/next",
    },
    {
      display_name: t("AIus9gb"),
      value: "https://swt.yakihonne.com/trending-users/next",
    },
    {
      display_name: t("A8MH8NR"),
      value: "https://swt.yakihonne.com/event-countdown/countdown",
    },
    {
      display_name: t("AiGC7RP"),
      value: "https://swt.yakihonne.com/memes/shuffle",
    },
    {
      display_name: t("AehzAoy"),
      value: "https://swt.yakihonne.com/generate-memes/list/0",
    },
    {
      display_name: t("AWh5g66"),
      value: "https://swt.yakihonne.com/quiz-game",
    },
    {
      display_name: t("AEi6SJh"),
      value: "https://swt.yakihonne.com/user-stats-search",
    },
    {
      display_name: t("AR0Bz6H"),
      value: "https://swt.yakihonne.com/user-zaps/zap",
    },
    {
      display_name: t("AGAO1Kr"),
      value: "https://swt.yakihonne.com/jokes/joke",
    },
    {
      display_name: t("AIXpEsf"),
      value: "https://swt.yakihonne.com/user-profile-zapping/profiles",
    },
    {
      display_name: t("AbyPbsN"),
      value: "https://swt.yakihonne.com/user-profile-visiting/profiles",
    },
  ];

  const handleButtonData = (type, data) => {
    let buttons = structuredClone(value);
    if (type === "label") {
      let label = data;
      let button = buttons[index];
      button.label = label;
      buttons[index] = button;
      setValue(buttons);
    }
    if (type === "url") {
      let url = data;
      let button = buttons[index];
      button.url = url;
      buttons[index] = button;
      setValue(buttons);
    }
    if (type === "type") {
      let type = data;
      let button = buttons[index];
      button.type = type;
      buttons[index] = button;
      setValue(buttons);
    }
  };

  return (
    <div className="fit-container fx-centered fx-col fx-start-v">
      <p className="gray-c">{t("A5IuG4M")}</p>
      <p className="gray-c p-medium">{t("A38I7Hm")}</p>
      <input
        placeholder={t("A38I7Hm")}
        className="if ifs-full"
        value={value[index].label}
        onChange={(e) => handleButtonData("label", e.target.value)}
      />
      {!(
        value[index].type === "post" &&
        value[index].url.includes("swt.yakihonne.com")
      ) && (
          <>
            <p className="gray-c p-medium">{t("AGaizjj")}</p>
            <input
              placeholder={
                value[index].type === "zap" ? t("AVLYYDh") : t("AGaizjj")
              }
              className="if ifs-full"
              value={value[index].url}
              onChange={(e) => handleButtonData("url", e.target.value)}
            />
          </>
        )}
      <p className="gray-c p-medium">{t("Ayd7Ojf")}</p>
      <Select
        options={buttonTypes}
        fullWidth={true}
        revert={true}
        escapeContainer={true}
        className="if"
        setSelectedValue={(value) => handleButtonData("type", value)}
        value={value[index].type}
        defaultLabel={`-- ${t("Ayd7Ojf")} --`}
      />
      {value[index].type === "post" && (
        <>
          <Select
            options={postFunctions}
            fullWidth={true}
            revert={true}
            escapeContainer={true}
            className="if"
            setSelectedValue={(value) => handleButtonData("url", value)}
            value={value[index].url.split("?")[0]}
            defaultLabel={`-- ${t("AKKhOC2")} --`}
          />
          <CustomFunctionRequiredData
            url={value[index].url}
            setUrl={(value) => handleButtonData("url", value)}
          />

          {[
            "/user-search",
            "/user-stats-search",
            "/user-zaps/zap",
            "/user-profile-zapping",
          ].includes(value[index].url.split("swt.yakihonne.com")[1]) &&
            swComps.length < 3 && (
              <p className="red-c p-medium box-pad-h-s">{t("A4eRArd")}</p>
            )}
        </>
      )}
      {onRemove && (
        <button className="btn btn-red btn-full" onClick={onRemove}>
          {t("AzkTxuy")}
        </button>
      )}
    </div>
  );
};

const CustomFunctionRequiredData = ({ url, setUrl }) => {
  if (
    [
      "/quote",
      "/trending-notes/next",
      "/trending-users/next",
      "/memes/shuffle",
      "/generate-memes/list/0",
      "/quiz-game",
      "/jokes/joke",
    ].includes(url.split("swt.yakihonne.com")[1])
  )
    return;

  if (url.includes("/event-countdown/countdown"))
    return <CountdownFunction url={url} setUrl={setUrl} />;
  if (url.includes("/user-zaps/zap"))
    return <HighestZapperFunction url={url} setUrl={setUrl} />;
  if (
    url.includes("/user-profile-zapping/profiles") ||
    url.includes("/user-profile-visiting/profiles")
  )
    return <UserProfiles url={url} setUrl={setUrl} />;
};

const CountdownFunction = ({ url, setUrl }) => {
  let { time } = Object.fromEntries(new URL(url).searchParams.entries());
  const [date, setDate] = useState(
    time ? new Date(time * 1000).toISOString().slice(0, 16) : "",
  );
  return (
    <>
      <p className="gray-c p-medium">{t("AE6wLmo")}</p>
      <input
        type="datetime-local"
        className="if ifs-full"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setUrl(
            url.split("?")[0] +
            `?time=${Math.floor(new Date(e.target.value).getTime() / 1000)}`,
          );
        }}
        min={new Date().toISOString().slice(0, 16)}
      />
    </>
  );
};

const HighestZapperFunction = ({ url, setUrl }) => {
  let { lud16, ends_at } = Object.fromEntries(
    new URL(url).searchParams.entries(),
  );
  const [date, setDate] = useState(
    ends_at ? new Date(ends_at * 1000).toISOString().slice(0, 16) : "",
  );
  const [addr, setAddr] = useState(lud16 || "");
  return (
    <>
      <p className="gray-c p-medium">{t("A40BuYB")}</p>
      <input
        className="if ifs-full"
        placeholder={t("A40BuYB")}
        value={addr}
        onChange={(e) => {
          setAddr(e.target.value);
          setUrl(
            url.split("?")[0] +
            `?lud16=${e.target.value}&starts_at=${Math.floor(
              new Date().getTime() / 1000,
            )}${date
              ? `&ends_at=${Math.floor(new Date(date).getTime() / 1000)}`
              : ""
            }`,
          );
        }}
        min={new Date().toISOString().slice(0, 16)}
      />
      <p className="gray-c p-medium">{t("AoNggMQ")}</p>
      <input
        type="datetime-local"
        className="if ifs-full"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setUrl(
            url.split("?")[0] +
            `?lud16=${addr}&starts_at=${Math.floor(
              new Date().getTime() / 1000,
            )}&ends_at=${Math.floor(
              new Date(e.target.value).getTime() / 1000,
            )}`,
          );
        }}
        min={new Date().toISOString().slice(0, 16)}
      />
    </>
  );
};

const UserProfiles = ({ url, setUrl }) => {
  let profiles = new URL(url).searchParams.getAll("pubkey");
  let [pubkeys, setPubkeys] = useState(
    profiles && Array.isArray(profiles)
      ? profiles.map((_) => nip19.decode(_).data)
      : profiles.map((_) => nip19.decode(_).data)
        ? [nip19.decode(profiles).data]
        : [],
  );
  const handleAddProfiles = (data) => {
    let pubkeys_ = Array.from(pubkeys);
    pubkeys_ = [...new Set([...pubkeys_, data])];
    setPubkeys(pubkeys_);
    let finalUrl = url.split("?")[0] + "?";
    for (let pub of pubkeys_) {
      let pub_ = nip19.npubEncode(pub);
      finalUrl = finalUrl + `pubkey=${pub_}&`;
    }
    finalUrl = finalUrl.slice(0, -1);
    setUrl(finalUrl);
  };
  const handleRemoveProfiles = (pub) => {
    let pubkeys_ = Array.from(pubkeys);
    pubkeys_ = pubkeys_.filter((_) => _ !== pub);
    setPubkeys(pubkeys_);
    let finalUrl = url.split("?")[0] + "?";
    for (let pub of pubkeys_) {
      let pub_ = nip19.npubEncode(pub);
      finalUrl = finalUrl + `pubkey=${pub_}&`;
    }
    finalUrl.slice(0, -1);
    setUrl(finalUrl);
  };
  return (
    <>
      <p className="gray-c p-medium">{t("ABn8zyu")}</p>
      {pubkeys.length < 6 && (
        <UserSearchBar onClick={handleAddProfiles} full={true} />
      )}
      {pubkeys.map((pub) => {
        return (
          <NProfilePreviewer
            pubkey={pub}
            margin={false}
            close={true}
            key={pub}
            onClose={() => handleRemoveProfiles(pub)}
          />
        );
      })}
      {pubkeys.length === 0 && (
        <p className="c1-c box-pad-h-s p-medium">{t("AuyfKBY")}</p>
      )}
    </>
  );
};

const SWTemplates = ({ templates, setTemplate, setBuildOption }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getTemplate = async (templatePath) => {
    try {
      setIsLoading(true);
      const t = await axios.post(SWT_YAKIHONNE + templatePath, undefined, {
        withCredentials: true,
      });
      setTemplate(getParsedSW(t.data));
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <Overlay exit={() => { }}>
          <Spinner />
        </Overlay>
      )}
      <div className="fit-container fx-centered fx-start-h fx-start-v fx-col">
        <div className="fit-container fx-scattered box-marg-s sticky">
          <div className="fx-centered">
            <div
              className="round-icon-small round-icon-tooltip"
              data-tooltip={t("AufOzcc")}
              onClick={setBuildOption}
            >
              <Icon name="arrow" />
            </div>
            <h3>{t("A60QDNZ")}</h3>
          </div>
        </div>
        <div className="fit-container fx-wrap fx-centered fx-start-h fx-start-v">
          {templates.map((sample, index) => {
            return (
              <div
                className="fx-centered fx-col pointer"
                key={index}
                onClick={() => getTemplate(sample.path)}
                style={{ flex: "1 1 250px" }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    backgroundImage: `url(${sample.thumbnail})`,
                  }}
                  className="bg-img cover-bg sc-s-18"
                ></div>
                <p className="gray-c">{sample.title}</p>
              </div>
            );
          })}
          <div style={{ flex: "1 1 250px" }}></div>
          <div style={{ flex: "1 1 250px" }}></div>
        </div>
      </div>
    </>
  );
};

const PublishOverlay = ({
  exit,
  swTitle,
  setSwTitle,
  handlePublish,
  openSaveDraft,
}) => {
  const { t } = useTranslation();
  return (
    <Overlay exit={exit} width={450}>
      <div className="box-pad-h box-pad-v fx-centered fx-col">
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <input
          type="text"
          className="if ifs-full"
          placeholder={t("AqTI7Iu")}
          value={swTitle}
          onChange={(e) => setSwTitle(e.target.value)}
        />
        <button
          className="btn btn-normal btn-full"
          onClick={() => {
            exit();
            handlePublish();
          }}
        >
          {t("As7IjvV")}
        </button>
        <button className="btn btn-gst btn-full" onClick={openSaveDraft}>
          {t("ABg9vzA")}
        </button>
      </div>
    </Overlay>
  );
};

const SaveDraft = ({ exit, swButtons, swImage, swInput, swComponents }) => {
  const dispatch = useDispatch();
  const [title, setTile] = useState("");
  const saveDraft = () => {
    try {
      let current = {
        created_at: Date.now(),
        title: title,
        image: swImage,
        input: swInput,
        buttons: swButtons,
        components: swComponents,
      };
      let previousDrafts = getLocalSWv2Drafts();
      previousDrafts = [current, ...previousDrafts];
      localStorage?.setItem("swv2-drafts", JSON.stringify(previousDrafts));
      dispatch(
        setToast({
          type: 1,
          desc: t("AawZhvj"),
        }),
      );
      exit();
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("Acr4Slu"),
        }),
      );
    }
  };
  return (
    <Overlay exit={exit} width={450}>
      <div
        className="box-pad-h box-pad-v fx-centered fx-col"
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4>{t("AjbW7pt")}</h4>
        <p className="gray-c box-pad-h p-centered box-marg-s">{t("AAMzwZn")}</p>
        <input
          type="text"
          className="if ifs-full"
          placeholder={t("AQT9kRr")}
          value={title}
          onChange={(e) => setTile(e.target.value)}
        />
        <button className="btn btn-normal btn-full" onClick={saveDraft}>
          {t("ABg9vzA")}
        </button>
      </div>
    </Overlay>
  );
};

const SWDrafts = ({ back, setTemplate }) => {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [drafts, setDrafts] = useState(getLocalSWv2Drafts());

  const deleteDraft = (index) => {
    let tempArray = Array.from(drafts);
    tempArray.splice(index, 1);
    setDrafts(tempArray);
    localStorage?.setItem("swv2-drafts", JSON.stringify(tempArray));
  };

  return (
    <div className="box-pad-v-m">
      {drafts.length > 0 && (
        <div className="fx-centered box-marg-s fx-start-h fit-container">
          <div
            className="round-icon-small round-icon-tooltip"
            data-tooltip={t("Afnv5k6")}
            onClick={() => back("normal")}
          >
            <Icon name="arrow" transform="rotate(90deg)" />
          </div>
          <h3>{t("Ayh5F4w")}</h3>
        </div>
      )}
      {drafts.length > 0 && (
        <div className="fit-container fx-centered fx-wrap fx-start-h fx-start-v">
          {drafts?.map((draft, index) => {
            return (
              <div
                style={{ width: "min(100%, 450px)", overflow: "visible" }}
                key={draft.id}
                className="fit-container fx-centered fx-col sc-s-18 bg-sp box-pad-h-m box-pad-v-m"
              >
                <div className="fit-container fx-scattered">
                  <div
                    className="fx-centered pointer"
                    onClick={() => setTemplate(draft)}
                  >
                    {draft.image && (
                      <img
                        src={draft.image}
                        className="sc-s-18 fx-centered"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    {!draft.image && (
                      <div
                        className="sc-s-18 bg-sp fx-centered"
                        style={{
                          minWidth: "60px",
                          minHeight: "60px",
                        }}
                      >
                        <Icon name="image" size={24} />
                      </div>
                    )}
                    <div className="fx-col fx-centered fx-start-v">
                      <p className="gray-c p-medium">
                        {t("AcKscQl", {
                          date: timeAgo(
                            new Date(draft?.created_at || Date.now()),
                          ),
                        })}
                      </p>
                      <h4 className="p-maj">{draft.title}</h4>
                    </div>
                  </div>
                  <OptionsDropdown
                    options={[
                      <div onClick={() => setTemplate(draft)}>
                        {t("AsXohpb")}
                      </div>,
                      <div className="red-c" onClick={() => deleteDraft(index)}>
                        {t("Almq94P")}
                      </div>,
                    ]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {drafts.length === 0 && (
        <PagePlaceholder
          page={"widgets-draft"}
          onClick={() => back("normal")}
        />
      )}
    </div>
  );
};
