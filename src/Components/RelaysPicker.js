import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RelayImage from "./RelayImage";
import LoadingDots from "./LoadingDots";
import { saveRelayMetadata } from "@/Helpers/Controlers";
import { getRelayMetadata } from "@/Helpers/utils";
import useUserProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "./UserProfilePic";
import RelayMetadataPreview from "./RelayMetadataPreview";

export default function RelaysPicker({
  allRelays,
  userAllRelays = [],
  addRelay,
  showMessage = true,
}) {
  const { t } = useTranslation();
  const [showList, setShowList] = useState(false);
  const [searchedRelay, setSearchedRelay] = useState("");
  const searchedRelays = useMemo(() => {
    let tempRelay = allRelays.filter((relay) => {
      if (
        !userAllRelays.map((_) => _.url).includes(relay) &&
        relay.includes(searchedRelay)
      )
        return relay;
    });
    return tempRelay;
  }, [userAllRelays, searchedRelay, allRelays]);
  const optionsRef = useRef(null);
  const [selectedRelay, setSelectedRelay] = useState(false);

  useEffect(() => {
    const handleOffClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowList(false);
      setSelectedRelay(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  const handleOnChange = (e) => {
    let value = e.target.value;
    setSearchedRelay(value);
  };

  return (
    <div
      style={{ position: "relative" }}
      className="fit-container"
      ref={optionsRef}
      onClick={() => setShowList(true)}
    >
      <input
        placeholder={t("ALPrAZz")}
        className="if ifs-full"
        style={{ height: "var(--40)" }}
        value={searchedRelay}
        onChange={handleOnChange}
      />
      {showMessage && (
        <div className="box-pad-v-s box-pad-h-s">
          <p className="gray-c p-medium">{t("A2wrBnY")}</p>
        </div>
      )}
      {showList && (
        <div
          className="fit-container sc-s-18 bg-dg fx-centered fx-col fx-start-h fx-start-v box-pad-h-s box-pad-v-s"
          style={{
            position: "absolute",
            left: 0,
            top: "calc(100% + 5px)",
            height: selectedRelay ? "600px" : "300px",
            // maxHeight: "600px",
            overflow: "scroll",
            zIndex: "200",
            gap: 0,
            transition: "height 0.3s ease-in-out",
          }}
        >
          <div className="fx-centered fit-container">
            <p
              className="gray-c box-pad-h-s"
              style={{ minWidth: "max-content" }}
            >
              {allRelays.length} relays
            </p>
            <hr />
            <hr />
          </div>
          {searchedRelays.map((relay) => {
            return (
              <div
                className={`pointer fit-container fx-scattered fx-col ${
                  selectedRelay !== relay
                    ? "box-pad-h-s box-pad-v-s"
                    : "box-pad-h-m box-pad-v-m"
                } option-no-scale relay-item`}
                style={{ position: "relative" }}
                onClick={(e) => {
                  e.stopPropagation();
                  addRelay(relay);
                  setShowList(false);
                  setSearchedRelay("");
                  setSelectedRelay(false);
                }}
              >
                <div
                  className="fit-container fx-scattered"
                  style={{ position: "relative" }}
                >
                  <div className="fx-centered ">
                    <RelayImage url={relay} size={16} />
                    <p>{relay}</p>
                  </div>
                  <div className="fx-centered">
                    <div className="sticker sticker-gray-black">
                      {t("ARWeWgJ")}
                    </div>
                  </div>
                </div>
                {selectedRelay === relay && (
                  <SelectedRelayPreview url={relay} />
                )}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "20px",
                    transform: "translateX(-50%) translateY(100%)",
                  }}
                >
                  <div
                    className="round-icon-small slide-down"
                    style={{ backgroundColor: "var(--dim-gray)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectedRelay === relay
                        ? setSelectedRelay(false)
                        : setSelectedRelay(relay);
                    }}
                  >
                    <div className="arrow "></div>
                  </div>
                </div>
              </div>
            );
          })}
          {searchedRelays.length === 0 && searchedRelay && (
            <div
              className="fx-scattered fit-container pointer"
              onClick={(e) => {
                e.stopPropagation();
                addRelay(
                  searchedRelay.includes("ws://")
                    ? searchedRelay
                    : "wss://" + searchedRelay.replace("wss://", "")
                );
                setShowList(false);
                setSearchedRelay("");
              }}
            >
              <p>{searchedRelay}</p>
              <div className="fx-centered">
                <div className="sticker sticker-gray-black">{t("ARWeWgJ")}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SelectedRelayPreview = ({ url }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState(getRelayMetadata(url));
  const { t } = useTranslation();
  // const { userProfile } = useUserProfile(metadata?.pubkey);
  useEffect(() => {
    const fetchData = async () => {
      let metadata = await saveRelayMetadata([url]);
      setMetadata(metadata[0]);
      setIsLoading(false);
    };
    if (!metadata) {
      fetchData();
    }
  }, []);

  if (!metadata && !isLoading) {
    return (
      <div className="fit-container box-pad-v fx-centered">
        <LoadingDots />
      </div>
    );
  }

  return (
    // <div
    //   className="fit-container fx-centered fx-start-v fx-col"
    //   onClick={(e) => e.stopPropagation()}
    // >
    //   <hr />
    //   <p className="gray-c">{metadata.description}</p>
    //   <hr />
    //   <div className="box-pad-v-s fit-container fx-centered fx-col">
    //     <div className="fx-scattered fit-container">
    //       <p>{t("AD6LbxW")}</p>
    //       <div className="fx-centered">
    //         {userProfile && (
    //           <p>{userProfile.display_name || userProfile.name}</p>
    //         )}
    //         {!userProfile && <p>N/A</p>}
    //         {userProfile && (
    //           <UserProfilePic
    //             img={userProfile.picture}
    //             size={24}
    //             mainAccountUser={false}
    //             user_id={metadata.pubkey}
    //           />
    //         )}
    //       </div>
    //     </div>
    //     <hr />
    //     <div className="fx-scattered fit-container">
    //       <p style={{ minWidth: "max-content" }}>{t("ADSorr1")}</p>
    //       <p className="p-one-line">{metadata.contact || "N/A"}</p>
    //     </div>
    //     <hr />
    //     <div className="fx-scattered fit-container">
    //       <p>{t("AY2x8jS")}</p>
    //       <p>{metadata.software.split("/")[4]}</p>
    //     </div>
    //     <hr />
    //     <div className="fx-scattered fit-container">
    //       <p>{t("ARDY1XM")}</p>
    //       <p>{metadata.version}</p>
    //     </div>
    //     <hr />
    //   </div>
    //   <hr />
    //   <div className="fit-container fx-scattered ">
    //     <p className="gray-c p-centered p-medium box-marg-s">{t("AVabTbf")}</p>
    //     <div className="fx-centered fx-end-h fx-wrap ">
    //       {metadata.supported_nips.map((nip) => {
    //         return (
    //           <div key={nip} className="fx-centered round-icon-small">
    //             <p className="p-medium gray-c">{nip}</p>
    //           </div>
    //         );
    //       })}
    //     </div>
    //   </div>
    // </div>
    <RelayMetadataPreview metadata={metadata} />
  );
};
