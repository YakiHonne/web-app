import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingDots from "@/Components/LoadingDots";
import { getUser, getUserFromNOSTR } from "@/Helpers/Controlers";
import { setUserKeys } from "@/Store/Slides/UserData";
import {
  bytesTohex,
  downloadAsFile,
  getEmptyuserMetadata,
  getHex,
  hexToUint8Array,
} from "@/Helpers/Encryptions";
import {
  generateSecretKey,
  getPublicKey,
  nip04,
  nip19,
  nip44,
} from "nostr-tools";
import * as secp from "@noble/secp256k1";
import { copyText, FileUpload, LoginToAPI, sleepTimer } from "@/Helpers/Helpers";
import { setIsConnectedToYaki } from "@/Store/Slides/YakiChest";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { setToast } from "@/Store/Slides/Publishers";
import UserProfilePic from "@/Components/UserProfilePic";
import InterestSuggestions from "@/Content/InterestSuggestions";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { saveUsers } from "@/Helpers/DB";
import axiosInstance from "@/Helpers/HTTP_Client";
import {
  NDKEvent,
  NDKNip46Signer,
  NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { FilePicker } from "@/Components/FilePicker";
import Spinner from "@/Components/Spinner";
import { useTranslation } from "react-i18next";
import {
  BUNKER_REGEX,
  BunkerSigner,
  parseBunkerInput,
} from "nostr-tools/nip46";
import { NostrConnect } from "nostr-tools/kinds";
import QRCode from "react-qr-code";
import Router from "next/router";
import Overlay from "@/Components/Overlay";
import useRecommendedPacks from "@/Hooks/useRecommendedPacks";
import PackPreview from "./Explore/PackPreview";
import PackPreviewOnboarding from "@/Components/PackPreviewOnboarding";
import Icon from "@/Components/Icon";
import DotGrid from "@/Components/DotGrid/DotGrid";
import { SelectTabs } from "@/Components/SelectTabs";
import { useTheme } from "next-themes";
let profilePlaceholder =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/profile-avatar.png";
let isNewAccount = getWallets().length > 0 ? true : false;

export default function Login() {
  const { theme } = useTheme()
  const { t } = useTranslation();
  let sk_ = generateSecretKey();
  let sk = bytesTohex(sk_);
  let pk = getPublicKey(sk_);
  let userKeys = { pub: pk, sec: sk };
  const [isLogin, setIsLogin] = useState(true);
  const { recommendedStarterPacks } = useRecommendedPacks();
  useEffect(() => {
    let pubkeys = [
      ...new Set(
        InterestSuggestions.map((interest) => interest.pubkeys).flat(),
      ),
    ].map((pubkey) => {
      return getHex(pubkey);
    });
    saveUsers(pubkeys);
  }, []);

  return (
    <div className="login-stage">
      <div className="login-bg-layer">
        <DotGrid
          dotSize={7}
          gap={19}
          baseColor={["dark", "gray"].includes(theme) ? "#2b2b2b" : "#e8e8e8"}
          activeColor="#ff5c27"
          proximity={270}
          shockRadius={250}
          shockStrength={14}
          resistance={1350}
          returnDuration={1.7}
        />
      </div>
      <div className="login-vignette"></div>
      <div className="login-brandmark">
        <Icon name="yakihonne-logo" width={120} height={42} isColored={false} />
      </div>
      <div className="login-stage-content">
        <div className="login-card bg-dropdown-t">
          <button
            className="btn btn-normal btn-gray fx-centered bg-dropdown login-back-btn"
            onClick={() => Router.back()}
          >
            <Icon name="arrow" transform="rotate(90deg)" />
          </button>
          <div className="login-card-head">
            <p className="login-card-eyebrow">{t("ANbrnTP")}</p>
            <h3 className="login-card-title-plain" key={isLogin ? "login" : "signup"}>
              {isLogin ? t("AITU9z0") : t("AHXrr4Y")}
            </h3>
          </div>
          <div className="login-mode-tabs fx-centered">
            <div>
              <SelectTabs
                selectedTab={isLogin ? 0 : 1}
                tabs={[t("AmOtzoL"), t("AHXrr4Y")]}
                setSelectedTab={(index) => setIsLogin(index === 0)}
              />
            </div>
          </div>
          {isLogin && (
            <LoginScreen
              switchScreen={() => setIsLogin(!isLogin)}
              userKeys={userKeys}
            />
          )}

          {!isLogin && (
            <SignupScreen
              switchScreen={() => setIsLogin(!isLogin)}
              userKeys={userKeys}
              recommendedStarterPacks={recommendedStarterPacks}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const Bunker = ({ autoLaunch = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [nostrConnectURI, setNostrConnectURI] = useState("");
  const [bunkerURL, setBunkerURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const localKeys = NDKPrivateKeySigner.generate();

  const launchBunkerWindow = () => {
    const relay =
      "wss://nostr-01.yakihonne.com&relay=wss://offchain.pub&relay=wss://relay.nsec.app&relay=wss://relay.damus.io";
    const localSigner = NDKNip46Signer.nostrconnect(
      ndkInstance,
      "wss://nostr-01.yakihonne.com",
      localKeys,
      {
        name: "Yakihonne",
        url: "https://yakihonne.com",
        perms: [],
      },
    );
    let nostrConnectUri = localSigner.nostrConnectUri;
    setNostrConnectURI(nostrConnectUri);
    const sub = ndkInstance.subscribe(
      [{ kinds: [NostrConnect], "#p": [localKeys.pubkey] }],
      {
        groupable: false,
      },
    );

    sub.on("event", async (event) => {
      let data = "";
      let isDecrypted = false;
      let remotePubkey = event.pubkey;
      let bunkerUrl = `bunker://${remotePubkey}?relay=wss://relay.nsec.app&relay=${relay}`;
      try {
        data = nip44.decrypt(
          event.content,
          nip44.v2.utils.getConversationKey(
            hexToUint8Array(localKeys.privateKey),
            event.pubkey,
          ),
        );
        isDecrypted = true;
        data = JSON.parse(data);
      } catch (err) {
        console.log(err);
      }

      if (!isDecrypted) {
        try {
          data = nip04.decrypt(
            hexToUint8Array(localKeys.privateKey),
            event.pubkey,
            event.content,
          );
          data = JSON.parse(data);
        } catch (err) {
          console.log(err);
        }
      }
      if (!data) {
        sub.stop();
        return;
      }
      sub.stop();
      const bunkerPointer = await parseBunkerInput(bunkerUrl);
      if (!bunkerPointer) {
        return;
      }
      const bunker = BunkerSigner.fromBunker(
        hexToUint8Array(localKeys.privateKey),
        bunkerPointer,
        {
          onauth: (url) => {
            window.open(
              url,
              "_blank",
              "width=600,height=650,scrollbars=yes,resizable=yes",
            );
          },
        },
      );

      await bunker.connect();
      const pubkey = await bunker.getPublicKey();
      let toSave = {
        localKeys: {
          sec: localKeys.privateKey,
          pub: getPublicKey(hexToUint8Array(localKeys.privateKey)),
        },
        pub: pubkey,
        bunker: bunkerUrl,
      };
      dispatch(setUserKeys(toSave));

      Router.back();
    });
  };
  const handleBunker = async () => {
    let testInput = BUNKER_REGEX.test(bunkerURL);
    if (!testInput) {
      dispatch(
        setToast({
          type: 2,
          desc: t("A2l1JgC"),
        }),
      );
      return;
    }
    const bunkerPointer = await parseBunkerInput(bunkerURL);
    if (!bunkerPointer) {
      throw new Error("Invalid bunker input");
    }
    setIsLoading(true);
    const bunker = BunkerSigner.fromBunker(
      hexToUint8Array(localKeys.privateKey),
      bunkerPointer,
      {
        onauth: (url) => {
          window.open(
            url,
            "_blank",
            "width=600,height=650,scrollbars=yes,resizable=yes",
          );
        },
      },
    );

    await bunker.connect();
    const pubkey = await bunker.getPublicKey();
    let toSave = {
      localKeys: {
        sec: localKeys.privateKey,
        pub: getPublicKey(hexToUint8Array(localKeys.privateKey)),
      },
      pub: pubkey,
      bunker: bunkerURL,
    };
    setIsLoading(false);
    dispatch(setUserKeys(toSave));
    Router.back();
  };

  useEffect(() => {
    if (autoLaunch) launchBunkerWindow();
  }, []);

  return (
    <>
      {nostrConnectURI && (
        <Overlay exit={() => setNostrConnectURI("")} width={360}>
          <div className="login-bunker-overlay box-pad-h box-pad-v bg-dropdown-t">
            <div className="close" onClick={() => setNostrConnectURI("")}>
              <div></div>
            </div>
            <h4 className="login-card-title" style={{ fontSize: "1.3rem" }}>
              {t("A9eQr6B")}
            </h4>
            <p className="login-card-subtitle">{t("AJdT1m0")}</p>
            <div className="login-qr-frame">
              <QRCode value={nostrConnectURI} width={220} />
            </div>
            <div
              className="login-bunker-uri"
              onClick={() => copyText(nostrConnectURI, t("AB1PYvA"))}
            >
              <p className="p-one-line gray-c">{nostrConnectURI}</p>
              <Icon name="copy" />
            </div>
            <div className="login-divider-row">
              <hr />
              <span>{t("Ax46s4g")}</span>
              <hr />
            </div>
            <input
              type="text"
              className="if ifs-full"
              placeholder="bunker://..."
              value={bunkerURL}
              onChange={(e) => setBunkerURL(e.target.value)}
            />
            <div className="login-actions fit-container">
              <button
                className="btn btn-normal btn-full"
                onClick={handleBunker}
                disabled={isLoading || !bunkerURL}
              >
                {isLoading ? <LoadingDots /> : t("AmOtzoL")}
              </button>
              {isLoading && (
                <button className="btn btn-gst btn-full">
                  {t("AB4BSCe")}
                </button>
              )}
            </div>
          </div>
        </Overlay>
      )}
      {!autoLaunch && (
        <button className="btn btn-gst btn-full" onClick={launchBunkerWindow}>
          {t("A9eQr6B")}
        </button>
      )}
    </>
  );
};

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [key, setKey] = useState("");
  const [checkExt, setCheckExt] = useState(window.nostr ? true : false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState("");

  const methods = [
    {
      id: "key",
      icon: "key-icon",
      title: t("AHm6tIw"),
      desc: t("A7uff0L"),
    },
    {
      id: "ext",
      icon: "puzzle",
      iconV: 2,
      title: t("AHm6tIx"),
      desc: t("AHm6tIu"),
      disabled: !checkExt,
    },
    {
      id: "bunker",
      icon: "bolt",
      title: t("A9eQr6B"),
      desc: t("AJdT1m0"),
    },
  ];
  const activeMethodData = methods.find((m) => m.id === activeMethod);

  const handleMethodClick = (method) => {
    if (method.disabled) return;
    if (method.id === "ext") {
      onLoginWithExt();
      return;
    }
    setActiveMethod(method.id);
  };

  const onLogin = async (inputKey) => {
    if (!inputKey) return;
    setIsLoading(true);
    if (inputKey.startsWith("npub")) {
      try {
        let hex = getHex(inputKey);
        let user = await getUserFromNOSTR(hex);
        if (user) {
          let keys = {
            pub: hex,
          };
          dispatch(setUserKeys(keys));
        }
        setIsLoading(false);
        Router.back();
        return;
      } catch (err) {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 2,
            desc: t("AiHLMRi"),
          }),
        );
      }
    }
    if (inputKey.startsWith("nsec")) {
      try {
        let hex = getHex(inputKey);
        if (secp.utils.isValidPrivateKey(hex)) {
          let secKey = hexToUint8Array(hex);
          let user = await getUserFromNOSTR(getPublicKey(secKey));
          if (user) {
            let keys = {
              sec: hex,
              pub: getPublicKey(secKey),
            };
            dispatch(setUserKeys(keys));
          }
          setIsLoading(false);

          Router.back();
          return;
        }
      } catch (err) {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 2,
            desc: t("AC5ByUA"),
          }),
        );
      }
    }
    if (secp.utils.isValidPrivateKey(inputKey)) {
      let user = await getUserFromNOSTR(getPublicKey(inputKey));
      if (user) {
        let keys = {
          sec: inputKey,
          pub: getPublicKey(inputKey),
        };

        dispatch(setUserKeys(keys));
      }
      setIsLoading(false);

      Router.back();
      return;
    }
    setIsLoading(false);
    dispatch(
      setToast({
        type: 2,
        desc: t("AC5ByUA"),
      }),
    );
  };
  const onLoginWithExt = async () => {
    try {
      setIsLoading(true);

      let key = await window.nostr.getPublicKey();
      let keys = {
        pub: key,
        ext: true,
      };
      let extWallet = [
        {
          id: Date.now(),
          kind: 1,
          entitle: "WebLN",
          active: true,
          data: "",
        },
      ];
      let wallet = updateWallets(extWallet, keys.pub);

      if (wallet.length > 0) dispatch(setUserKeys(keys));

      setIsLoading(false);
      Router.back();
      return;
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AiHLMRi"),
        }),
      );
    }
  };

  return (
    <>
      <div className="login-conversation">
        <p className="login-convo-question fx-centered gray-c">{t("AHm6tIv")}</p>

        {activeMethod !== "key" && (
          <div className="login-convo-options" key="options">
            {methods.map((method, index) => (
              <div
                key={method.id}
                className={`login-convo-option bg-dropdown-t ${method.disabled ? "disabled" : ""}`}
                style={{ "--stagger-i": index }}
                onClick={() => handleMethodClick(method)}
                disabled={method.disabled}
              >
                <span className="login-convo-option-icon">
                  <Icon name={method.icon} v={method.iconV || 1} size={26} />
                </span>
                <span className="login-convo-option-copy">
                  <b>{method.title}</b>
                  <span>{method.desc}</span>
                </span>
                <span className="login-convo-option-go">
                  <Icon name="arrow" size={14} transform="rotate(-90deg)" />
                </span>
              </div>
            ))}
          </div>
        )}
        {activeMethod === "bunker" && <Bunker autoLaunch />}
        {activeMethod === "key" && (
          <div className="login-convo-answer" key={activeMethod}>
            <div
              className="login-convo-back"
              onClick={() => setActiveMethod("")}
            >
              <Icon name="arrow" size={13} transform="rotate(90deg)" />
              {t("AyGDBDa")}
            </div>


            <div className="login-convo-field">
              <input
                type="text"
                className="if ifs-full"
                placeholder={t("A7uff0L")}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoFocus
              />
              <div className="login-actions">
                <button
                  className="btn btn-normal btn-full"
                  onClick={() => onLogin(key)}
                  disabled={isLoading || !key}
                >
                  {isLoading ? <LoadingDots /> : <>{t("AmOtzoL")}</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const SignupScreen = ({ switchScreen, userKeys, recommendedStarterPacks }) => {
  const dispatch = useDispatch();
  const previousUserKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [pictureFile, setPictureFile] = useState("");
  const [picture, setPicture] = useState("");
  const [bannerFile, setBannerFile] = useState("");
  const [banner, setBanner] = useState("");
  const [NWCURL, setNWCURL] = useState("");
  const [NWAddr, setNWCAddr] = useState("");
  const [isCreatingWalletLoading, setIsCreatingWalletLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedInterest, setSelectedInteres] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showErrorMessage, setShowMessageError] = useState(false);
  const [showEmptyUNMessage, setShowMessageEmtpyUN] = useState(false);
  const [showInvalidMessage, setShowInvalidMessage] = useState(false);
  const [userName, setUserName] = useState("");
  const [enableWalletLinking, setEnablingWalletLinking] = useState(true);
  const [selectedPacks, setSelectedPacks] = useState([]);

  const railSteps = [
    { id: 1, label: t("AyBBPWE") },
    { id: 2, label: t("AVzZUeP") },
    { id: 3, label: t("Ah1Kxvl") },
    { id: 4, label: t("AimqDYY") },
  ];

  const stepTitles = {
    1: t("AyBBPWE"),
    2: t("AVzZUeP"),
    3: t("AqBdu7X"),
    4: t("AimqDYY"),
  };

  const handleNextSteps = () => {
    if (![1, 2, 3].includes(step)) return;
    if (step === 1) {
      if (!name) {
        dispatch(setToast({ type: 2, desc: t("AdrCWCj") }));
        return;
      }
    }
    setStep(step + 1);
  };
  const handlePrevSteps = () => {
    if (![2, 3, 4].includes(step)) return;
    setStep(step - 1);
  };

  const handleSelectedInterest = (index) => {
    if (index === selectedInterest) setSelectedInteres(false);
    else setSelectedInteres(index);
  };
  const handleSelectInterests = (data) => {
    if (!data) return;
    let index = selectedInterests.findIndex(
      (interest) => interest.tag === data.tag,
    );

    let tempArray = Array.from(selectedInterests);
    if (index !== -1) {
      if (data.pubkeys.length > 0) {
        tempArray[index].pubkeys = data.pubkeys;
        setSelectedInterests(tempArray);
      }
      if (data.pubkeys.length === 0) {
        tempArray = tempArray.splice(index, 0);
        setSelectedInterests(tempArray);
      }
    }
    if (index === -1) {
      tempArray.push(data);
      setSelectedInterests(tempArray);
    }
  };
  const handleCreateWallet = async () => {
    try {
      if (isCreatingWalletLoading || showInvalidMessage) return;
      if (!userName) {
        setShowMessageEmtpyUN(true);
        return;
      }
      setIsCreatingWalletLoading(true);

      if (previousUserKeys) {
        try {
          await axiosInstance.post("/api/v1/logout");
        } catch (err) {
          console.log(err);
        }
        dispatch(setIsConnectedToYaki(false));
      }
      await LoginToAPI(userKeys.pub, userKeys);

      let url = await axiosInstance.post("/api/v1/wallet", {
        username: userName?.toLowerCase(),
      });

      setNWCURL(url.data.connectionSecret);
      setNWCAddr(url.data.lightningAddress);
      let toSave = [
        "Important: Store this information securely. If you lose it, recovery may not be possible. Keep it private and protected at all times",
        "---",
        `Address: ${url.data.lightningAddress}`,
        `NWC secret: ${url.data.connectionSecret}`,
      ];
      downloadAsFile(
        toSave.join("\n"),
        "text/plain",
        `${url.data.lightningAddress}-NWC.txt`,
        t("AIzBCBb"),
        false,
      );
      setIsCreatingWalletLoading(false);
      setStep(4);
    } catch (err) {
      console.log(err);
      setIsCreatingWalletLoading(false);
      if (err.response.status) {
        setShowMessageError(true);
      } else
        dispatch(
          setToast({
            type: 3,
            desc: t("AQ12OQz"),
          }),
        );
    }
  };

  const initializeAccount = async () => {
    try {
      setStep(5);
      let picture_ = pictureFile
        ? await FileUpload({ file: pictureFile, userKeys })
        : "";
      if (picture_ === false) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AfM6xbs"),
          }),
        );
        setStep(4);
        return;
      }
      let banner_ = bannerFile
        ? await FileUpload({ file: bannerFile, userKeys })
        : "";
      if (banner_ === false) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AnmPNHc"),
          }),
        );
        setStep(4);
        return;
      }

      dispatch(setUserKeys(userKeys));
      let toSave = [
        "Important: Store this information securely. If you lose it, recovery may not be possible. Keep it private and protected at all times",
        "---",
        `Private key: ${nip19.nsecEncode(hexToUint8Array(userKeys.sec))}`,
        `Public key: ${nip19.npubEncode(userKeys.pub)}`,
      ];
      downloadAsFile(
        toSave.join("\n"),
        "text/plain",
        `account-credentials.txt`,
        t("AdoWp0E"),
        false,
      );

      let signer = new NDKPrivateKeySigner(userKeys.sec);
      ndkInstance.signer = signer;

      await Promise.all([
        warmup(),
        metadataEvent(picture_, banner_),
        interestsEvents(),
        relaysEvent(),
      ]);

      if (NWAddr) {
        let nwcNode = {
          id: Date.now(),
          kind: 3,
          entitle: NWAddr,
          active: true,
          data: NWCURL,
        };
        updateWallets([nwcNode], userKeys.pub);
      }

      Router.back();
    } catch (err) {
      console.log(err);
      setStep(4);
    }
  };

  const warmup = () => {
    const tempEvent = new NDKEvent(ndkInstance);
    tempEvent.kind = 0;
    tempEvent.content = "";
    tempEvent.publish();
    return;
  };

  const metadataEvent = async (profilePicture, bannerPicture) => {
    try {
      const ndkEvent = new NDKEvent(ndkInstance);
      let metadata = {};

      metadata.display_name = name;
      metadata.name = name;
      metadata.about = about;
      metadata.picture = profilePicture || "";
      metadata.banner = bannerPicture || "";
      if (NWAddr) metadata.lud16 = NWAddr;
      ndkEvent.kind = 0;
      ndkEvent.content = JSON.stringify(metadata);

      let published = await ndkEvent.publish(undefined, 2000);

      return ndkEvent;
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const interestsEvents = async () => {
    if (selectedInterests.length === 0 && selectedPacks.length === 0) return;
    let published = await Promise.all([
      await tagsEvent(),
      await followingsEvent(),
    ]);
    return;
  };

  const tagsEvent = async () => {
    try {
      if (selectedInterests.length === 0) return;
      let interestsTags = selectedInterests.map((interest) => [
        "t",
        interest.tag?.toLowerCase(),
      ]);
      const ndkInterestEvent = new NDKEvent(ndkInstance);
      ndkInterestEvent.kind = 10015;
      ndkInterestEvent.content = "";
      ndkInterestEvent.tags = interestsTags;

      let published = await ndkInterestEvent.publish(undefined, 2000);
      return published;
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const followingsEvent = async () => {
    try {
      let followingsTags = [];
      let interestsTagsPubkeys = [
        ...new Set(
          selectedInterests.map((interest) => interest.pubkeys).flat(),
        ),
      ].map((pubkey) => ["p", pubkey]);
      let packsTagsPubkeys = selectedPacks.map((pubkey) => ["p", pubkey]);
      followingsTags = [...interestsTagsPubkeys, ...packsTagsPubkeys];

      const ndkFollowingsEvent = new NDKEvent(ndkInstance);
      ndkFollowingsEvent.kind = 3;
      ndkFollowingsEvent.content = "";
      ndkFollowingsEvent.tags = followingsTags;

      let published = await ndkFollowingsEvent.publish(undefined, 2000);

      return published;
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const relaysEvent = async () => {
    try {
      let defaultRelays = [
        "wss://nostr-01.yakihonne.com",
        "wss://nostr-02.yakihonne.com",
        "wss://relay.damus.io",
      ];
      let relaysTags = defaultRelays.map((relay) => ["r", relay]);

      let event = {
        kind: 10002,
        content: "",
        tags: relaysTags,
      };

      const ndkRelaysEvent = new NDKEvent(ndkInstance, { ...event });
      let published = await ndkRelaysEvent.publish(undefined, 2000);

      return;
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const handleInputField = (e) => {
    let value = e.target.value;
    let isValid = /^[a-zA-Z0-9]+$/.test(value);
    if (showErrorMessage) setShowMessageError(false);
    if (showEmptyUNMessage) setShowMessageEmtpyUN(false);
    if (!value || (isValid && showInvalidMessage)) setShowInvalidMessage(false);
    if (value && !isValid && !showInvalidMessage) setShowInvalidMessage(true);
    setUserName(value);
  };

  const handleMultiSelection = ({ pubkeys, action }) => {
    if (action === "add") {
      setSelectedPacks((prev) => [...new Set([...prev, ...pubkeys])]);
    } else {
      console.log(pubkeys.length);
      setSelectedPacks((prev) =>
        prev.filter((pubkey) => !pubkeys.includes(pubkey)),
      );
    }
  };
  const handleSingleSelection = ({ pubkey, action }) => {
    if (action === "add") {
      setSelectedPacks((prev) => [...new Set([...prev, pubkey])]);
    } else {
      setSelectedPacks((prev) => prev.filter((pubkey_) => pubkey_ !== pubkey));
    }
  };

  return (
    <>
      {step <= 4 && (
        <div className="signup-rail">
          {railSteps.map((railStep, i) => (
            <div
              key={railStep.id}
              className={`signup-rail-item ${step === railStep.id ? "active" : ""} ${step > railStep.id ? "done" : ""}`}
            >
              <span className="signup-rail-marker" style={{ "--marker-i": i }}>
                {step > railStep.id ? (
                  <Icon name="check_big" v={2} size={20} isBoldThemeColor />
                ) : (
                  railStep.id
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="fit-container signup-step-body" key={step}>
        {step <= 4 && (
          <p className="signup-step-title">{stepTitles[step]}</p>
        )}
        {step === 1 && (
          <>
            <FilePicker
              element={
                <div className="fit-container fx-col fx-centered box-pad-h">
                  <div className="signup-avatar-wrap">
                    <div
                      className="bg-img cover-bg sc-s signup-avatar-img"
                      style={{ backgroundImage: `url(${picture || profilePlaceholder})` }}
                    ></div>
                    <div className="signup-avatar-overlay fx-centered fx-col pointer toggle">
                      <Icon name="image" size={24} />
                      <p className="gray-c p-medium" >{t("AnD39Ci")}</p>
                    </div>
                  </div>
                </div>
              }
              setFile={(data) => {
                setPictureFile(data.file);
                setPicture(data.url);
              }}
            />
            <div className="fit-container fx-centered fx-col signup-name-field">
              <input
                type="text"
                className="if ifs-full p-bold p-centered if-no-border"
                placeholder={t("At0Sp8H")}
                value={name}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setName(e.target.value);
                }}
                autoFocus
              />
            </div>
          </>
        )}
        {step === 2 && (
          <div className="signup-packs-list">
            {recommendedStarterPacks.map((_) => (
              <PackPreviewOnboarding
                pack={_}
                handleMultiSelection={handleMultiSelection}
                handleSingleSelection={handleSingleSelection}
                selectedPubkeys={selectedPacks}
                key={_.id}
              />
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="fit-container fx-centered fx-col">
            <WalletIllustration
              isLoading={isCreatingWalletLoading}
              isCreated={NWCURL}
            />
            {!NWCURL && (
              <div className="fit-container fx-centered fx-col slide-up signup-wallet-field">
                <div className="fit-container fx-centered">
                  <input
                    type="text"
                    className="if ifs-full"
                    placeholder={t("ALCpv2S")}
                    value={userName}
                    onChange={handleInputField}
                    style={{
                      borderColor: showErrorMessage || showEmptyUNMessage || showInvalidMessage
                        ? "var(--red-main)"
                        : "",
                    }}
                  />
                  <p className="gray-c p-big signup-wallet-domain">@wallet.yakihonne.com</p>
                </div>
                {showErrorMessage && (
                  <p className="red-c p-medium fit-container box-pad-h-m">{t("AgrHddv")}</p>
                )}
                {showEmptyUNMessage && (
                  <p className="red-c p-medium fit-container box-pad-h-m">{t("AhQtS0K")}</p>
                )}
                {showInvalidMessage && (
                  <p className="red-c p-medium fit-container box-pad-h-m">{t("AqSxggD")}</p>
                )}
              </div>
            )}
            {NWCURL && (
              <div className="signup-wallet-address">
                <span className="signup-wallet-address-label">{t("A40BuYB")}</span>
                <span className="signup-wallet-address-value">{NWAddr}</span>
              </div>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="fit-container fx-centered fx-col signup-allset">
            <div className="signup-allset-avatar" style={{ "--allset-i": 0 }}>
              <div
                className="bg-img cover-bg sc-s"
                style={{ backgroundImage: `url(${picture || profilePlaceholder})` }}
              ></div>
            </div>
            <h4 className="signup-allset-name" style={{ "--allset-i": 1 }}>{name}</h4>
            {NWAddr && (
              <div className="signup-wallet-address signup-wallet-address-sm" style={{ "--allset-i": 2 }}>
                <span className="signup-wallet-address-label">{t("A40BuYB")}</span>
                <span className="signup-wallet-address-value">{NWAddr}</span>
              </div>
            )}
          </div>
        )}
        {step <= 4 && (
          <div className={`login-step-nav${step === 3 && !NWCURL ? " login-step-nav--wallet" : ""}`}>
            {step > 1 && (
              <button
                className="btn btn-gray"
                onClick={handlePrevSteps}
                disabled={isCreatingWalletLoading}
              >
                {t("AF7iGeG")}
              </button>
            )}
            {step === 3 && !NWCURL && (
              <button
                className="btn btn-gray"
                onClick={handleNextSteps}
                disabled={isCreatingWalletLoading}
              >
                {t("AWallet1")}
              </button>
            )}
            {step === 3 && !NWCURL ? (
              <button
                className="btn btn-normal"
                onClick={handleCreateWallet}
                disabled={isCreatingWalletLoading}
              >
                {isCreatingWalletLoading ? <LoadingDots /> : t("AWallet2")}
              </button>
            ) : (
              <button
                className="btn btn-normal"
                onClick={step !== 4 ? handleNextSteps : initializeAccount}
              >
                {step !== 4 ? t("AgGi8rh") : t("AB0SnxL")}
              </button>
            )}
          </div>
        )}
        {step === 5 && <InitiProfile />}
      </div>
    </>
  );
};

const InitiProfile = () => {
  return (
    <div
      className="fit-container fx-centered fx-col"
      style={{ height: "500px" }}
    >
      <Spinner size={32} />
    </div>
  );
};

const WalletIllustration = ({ isCreated, isLoading }) => {
  return (
    <div className="signup-wallet-illustration">
      <div className={`signup-wallet-ring ${isLoading ? "pulse-orange" : ""} ${isCreated ? "signup-wallet-ring--done" : ""}`}>
        <span className="signup-wallet-btc">₿</span>
      </div>
    </div>
  );
};
