import useMints from "@/Hooks/useMints";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import MintItem from "./MintItem";
import LoadingDots from "@/Components/LoadingDots";
import { bytesTohex } from "@/Helpers/Encryptions";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { encrypt44 } from "@/Helpers/Encryptions";
import { InitEvent } from "@/Helpers/Controlers";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { SelectTabsNoIndex } from "@/Components/SelectTabsNoIndex";
import axios from "axios";

export default function WalletManagement({
  exit,
  previousPrivKey,
  currentMintList = [],
  notInWalletMints = [],
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const [isCheckingCustomMint, setIsCheckingCustomMint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mintList, mintUrlsList, getCustomMints } = useMints();
  const [mints, setMints] = useState(currentMintList);
  const [selectedTab, setSelectedTab] = useState(
    notInWalletMints.length > 0 ? 2 : previousPrivKey ? 0 : 1,
  );
  const [customMint, setCustomMint] = useState("");
  const [activeMints, setActiveMints] = useState([]);
  const [inactiveMints, setInactiveMints] = useState([]);

  useEffect(() => {
    if (mintUrlsList.length > 0 && currentMintList.length > 0) {
      let mintsNotInList = currentMintList.filter(
        (mint) => !mintUrlsList.includes(mint),
      );
      let fromCache = mintList.filter((mint) =>
        currentMintList.includes(mint.url),
      );
      setActiveMints(fromCache);
      if (mintsNotInList) {
        getCustomMints(mintsNotInList, setActiveMints);
      }
    }
  }, [mintUrlsList]);

  useEffect(() => {
    if (mintUrlsList.length > 0 && notInWalletMints.length > 0) {
      let mintsNotInList = notInWalletMints.filter(
        (mint) => !mintUrlsList.includes(mint),
      );
      let fromCache = mintList.filter((mint) =>
        notInWalletMints.includes(mint.url),
      );
      setInactiveMints(fromCache);
      if (mintsNotInList) {
        getCustomMints(mintsNotInList, setInactiveMints);
      }
    }
  }, [mintUrlsList]);

  const addCustomMint = async () => {
    if (customMint === "" || isCheckingCustomMint || isLoading) return;
    try {
      let correctedURL = customMint.endsWith("/")
        ? customMint.slice(0, -1)
        : customMint;
      let isInMintList = mintList.find((mint) => mint.url === correctedURL);
      if (isInMintList) {
        setMints((prev) => [...prev, customMint]);
        setActiveMints((prev) => [...prev, isInMintList]);
        setCustomMint("");
        return;
      }
      setIsCheckingCustomMint(true);
      let data = await axios.get(`${correctedURL}/v1/info`);
      setIsCheckingCustomMint(false);
      if (data.data?.pubkey) {
        setMints((prev) => [...prev, customMint]);
        setActiveMints((prev) => [
          ...prev,
          { url: correctedURL, data: data.data },
        ]);
        setCustomMint("");
      }
    } catch (error) {
      console.log(error);
      setIsCheckingCustomMint(false);
      dispatch(setToast({ type: 2, desc: t("AZdNj6Z") }));
    }
  };

  const createWallet = async () => {
    if (isCheckingCustomMint || isLoading) return;
    if (mints.length === 0) {
      dispatch(setToast({ type: 2, desc: t("AUxVdlF") }));
      return;
    }
    setIsLoading(true);
    const pivatekeys = previousPrivKey || bytesTohex(generateSecretKey());
    const pubkey = getPublicKey(pivatekeys);

    let mintsListTags = mints.map((mint) => {
      return ["mint", mint];
    });
    const content = JSON.stringify([["privkey", pivatekeys], ...mintsListTags]);
    const encryptedContent = await encrypt44(userKeys, userKeys.pub, content);
    if (!encryptedContent) {
      setIsLoading(false);
      return;
    }
    const eventInitEx = await InitEvent(17375, encryptedContent, []);

    if (!eventInitEx) {
      setIsLoading(false);
      return;
    }
    dispatch(setToPublish({ eventInitEx }));

    let tags = [["pubkey", pubkey], ...mintsListTags];
    const eventInitEx2 = await InitEvent(10019, "", tags);
    if (!eventInitEx2) {
      setIsLoading(false);
      return;
    }
    dispatch(setToPublish({ eventInitEx: eventInitEx2 }));
    setIsLoading(false);
    exit();
  };

  const handleMintsAdding = (mint, isSelected) => {
    if (isSelected) {
      setMints((prev) => prev.filter((_) => _ !== mint.url));
      setActiveMints((prev) => prev.filter((_) => _.url !== mint.url));
    } else {
      setMints((prev) => [...prev, mint.url]);
      setActiveMints((prev) => [...prev, mint]);
    }
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp "
        style={{
          position: "relative",
          width: "min(100%,650px)",
          maxHeight: "70vh",
          overflow: "scroll",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="fx-centered fx-col fit-container">
          <h4>{previousPrivKey ? t("ACs4qJF") : t("A9nmr3z")}</h4>
          <p className="gray-c p-centered box-pad-h">{t("AEioKpY")}</p>
        </div>
        <div className="fit-container fx-centered">
          <SelectTabsNoIndex
            tabs={[
              { display_name: t("AirJ3fO"), value: 0 },
              { display_name: t("A3nDQdr"), value: 1 },
              notInWalletMints.length > 0 && {
                display_name: `⚠️  ${t("AzURGKK")}`,
                value: 2,
              },
            ]}
            selectedTab={selectedTab}
            setSelectedTab={(tab) => setSelectedTab(tab)}
          />
        </div>

        {selectedTab === 0 && (
          <>
            <div className="fit-container fx-centered box-pad-v-s">
              <input
                type="text"
                value={customMint}
                onChange={(e) => setCustomMint(e.target.value)}
                className="if ifs-full"
                placeholder="https://.."
              />
              <button className="btn btn-normal" onClick={addCustomMint}>
                {isCheckingCustomMint ? <LoadingDots /> : t("ARWeWgJ")}
              </button>
            </div>
            <div className="fit-container" style={{ height: "40vh" }}>
              {activeMints.length === 0 && (
                <div className="fx-centered fx-col fit-container fit-height">
                  <p className="gray-c">{t("AO3RqNI")}</p>
                </div>
              )}
              <Virtuoso
                style={{ width: "100%", height: "40vh" }}
                skipAnimationFrameInResizeObserver={true}
                totalCount={activeMints.length}
                itemContent={(index) => {
                  let item = activeMints[index];
                  let isSelected = mints.includes(item.url);
                  return (
                    <MintItem
                      mint={item}
                      key={item.data.pubkey}
                      isSelected={isSelected}
                      onClick={() => handleMintsAdding(item, isSelected)}
                    />
                  );
                }}
              />
            </div>
          </>
        )}

        {selectedTab === 1 && (
          <>
            {mintList?.length > 0 && (
              <Virtuoso
                style={{ width: "100%", height: "50vh" }}
                skipAnimationFrameInResizeObserver={true}
                totalCount={mintList.length}
                itemContent={(index) => {
                  let item = mintList[index];
                  let isSelected = mints.includes(item.url);
                  // let isCustom = activeMints.find((_) => _.url === item.url);
                  // // if (isCustom) return null;
                  return (
                    <MintItem
                      mint={item}
                      key={item.data.pubkey}
                      isSelected={isSelected}
                      onClick={() => {
                        handleMintsAdding(item, isSelected);
                      }}
                    />
                  );
                }}
              />
            )}
            {mintList?.length === 0 && (
              <div
                className="fit-container fx-centered"
                style={{ height: "50vh" }}
              >
                <LoadingDots />
              </div>
            )}
          </>
        )}
        {selectedTab === 2 && (
          <>
            <div className="fit-container box-pad-h-m box-pad-v-m sc-s-18 bg-sp box-marg-s fx-centered fx-start-h fx-start-v">
              <div>
                <h4>⚠️</h4>
              </div>
              <div>
                <p className="c1-c">{t("APh8L7Z")}</p>
                <p className="gray-c">{t("ADe7Q3k")}</p>
              </div>
            </div>
            {inactiveMints?.length > 0 && (
              <Virtuoso
                style={{ width: "100%", height: "40vh" }}
                skipAnimationFrameInResizeObserver={true}
                totalCount={inactiveMints.length}
                itemContent={(index) => {
                  let item = inactiveMints[index];
                  let isSelected = mints.includes(item.url);
                  return (
                    <MintItem
                      mint={item}
                      key={item.data.pubkey}
                      isSelected={isSelected}
                      onClick={() => {
                        handleMintsAdding(item, isSelected);
                      }}
                    />
                  );
                }}
              />
            )}
            {inactiveMints?.length === 0 && (
              <div
                className="fit-container fx-centered"
                style={{ height: "50vh" }}
              >
                <LoadingDots />
              </div>
            )}
          </>
        )}
        <div className="fit-container fx-centered">
          <button
            className={`btn btn-full ${
              mints.length > 0 ? "btn-normal" : "btn-disabled"
            }`}
            onClick={createWallet}
          >
            {isLoading ? (
              <LoadingDots />
            ) : previousPrivKey ? (
              t("ACs4qJF")
            ) : (
              t("AvjCl1G")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
