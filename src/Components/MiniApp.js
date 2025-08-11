import React, { useEffect, useRef, useState } from "react";
import SWHandler from "smart-widget-handler";
import { useDispatch, useSelector } from "react-redux";
import { assignClientTag, extractRootDomain } from "@/Helpers/Helpers";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import { InitEvent, publishEvent } from "@/Helpers/Controlers";
import OptionsDropdown from "@/Components/OptionsDropdown";
import PostAsNote from "@/Components/PostAsNote";
import PaymentGateway from "@/Components/PaymentGateway";
import LoadingLogo from "@/Components/LoadingLogo";
import axios from "axios";
import { saveUsers } from "@/Helpers/DB";
import useUserProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "@/Components/UserProfilePic";
import Link from "next/link";
import { nip19 } from "nostr-tools";

export default function MiniApp({ url, exit, setReturnedData }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userRelays = useSelector((state) => state.userRelays);
  const userMetadata = useSelector((state) => state.userMetadata);
  const domain = extractRootDomain(url);
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customData, setCustomData] = useState("");
  const [paymentPayload, setPaymentPayload] = useState("");
  const [appMetadata, setAppMetadata] = useState({});
  const reloadiFrame = () => {
    iframeRef.current.src = url;
  };

  useEffect(() => {
    fetchAppMetadata();
    let listener;
    if (iframeRef.current) {
      listener = SWHandler.host.listen(async (event) => {
        if (event?.kind === "app-loaded") {
          setIsLoading(false);
          if (userMetadata)
            SWHandler.host.sendContext(
              userMetadata,
              window.location.origin,
              url,
              iframeRef.current
            );
          if (!userMetadata)
            SWHandler.host.sendError(
              "The user is not connected",
              url,
              iframeRef.current
            );
        }
        if (event?.kind === "sign-event") {
          try {
            let signedEvent = await InitEvent(
              event.data.kind,
              event.data.content,
              assignClientTag(event.data.tags)
            );
            if (signedEvent)
              SWHandler.host.sendEvent(
                signedEvent,
                "success",
                url,
                iframeRef.current
              );
            else
              SWHandler.host.sendError(
                "Signing event failed",
                url,
                iframeRef.current
              );
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
            } else {
              let publisedEvent = await publishEvent(signedEvent, userRelays);
              SWHandler.host.sendEvent(
                signedEvent,
                publisedEvent ? "success" : "error",
                url,
                iframeRef.current
              );
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
        if (event?.kind === "custom-data") {
          setCustomData(event.data);
          setReturnedData && setReturnedData(event.data);
        }
        if (event?.kind === "payment-request") {
          setPaymentPayload(event.data);
        }
      });
    }
    return () => {
      if (listener) listener.close();
    };
  }, [iframeRef.current]);

  const handlePaymentResponse = (data) => {
    SWHandler.host.sendPaymentResponse(data, url, iframeRef.current);
  };

  const copyURL = () => {
    navigator.clipboard.writeText(url);
    dispatch(
      setToast({
        type: 1,
        desc: "Link was copied",
      })
    );
  };

  const fetchAppMetadata = async () => {
    try {
      let path = `https://${url.split("/")[2]}/.well-known/widget.json`;
      const response = await axios.get(path);
      if (response.data?.pubkey) {
        setAppMetadata(response.data);
        saveUsers([response.data?.pubkey]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (customData && !setReturnedData)
    return <PostAsNote exit={exit} content={customData} />;

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
      <div
        className="fixed-container fx-centered fx-col box-pad-h"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          className="fx-centered fx-col fx-start-v fx-start-h slide-up"
          style={{
            width: "455px",
            padding: "5px",
            borderRadius: "18px",
            overflow: "hidden",
            backgroundColor: "#282828",
            gap: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div
            className="sw-fit-container box-pad-h-s box-pad-v-s fx-scattered"
            style={{ zIndex: 2 }}
          >
            <div
              className="close"
              style={{ position: "static" }}
              onClick={exit}
            >
              <div></div>
            </div>
            <div className="fx-centered fx-col" style={{ gap: 0 }}>
              <p className="p-big p-bold">
                {appMetadata?.widget?.title || domain}
              </p>
            </div>
            <OptionsDropdown
              options={[
                <div className="fx-centered pointer">
                  <div className="copy"></div>
                  <p onClick={copyURL}>Copy link</p>
                </div>,
                <div className="fx-centered">
                  <div className="switch-arrows"></div>
                  <p onClick={reloadiFrame}>Reload app</p>
                </div>,
              ]}
            />
          </div>
          <div
            className="fit-container fx-centered"
            style={{ position: "relative", borderRadius: "10px", zIndex: 1 }}
          >
            <iframe
              ref={iframeRef}
              src={url}
              allow="microphone; camera; clipboard-write 'src'"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
              style={{
                border: "none",
                aspectRatio: "10/16.5",
                opacity: isLoading ? 0 : 1,
                borderRadius: "18px",
                overflow: "scroll",
                maxHeight: "80vh",
              }}
              className="fit-container fit-height"
            ></iframe>
            {isLoading && (
              <div
                className="fx-centered fx-col sc-s-18"
                style={{
                  position: "absolute",
                  borderRadius: 0,
                  left: 0,
                  top: 0,
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  gap: 0,
                  aspectRatio: "10/16",
                  borderRadius: "18px",
                }}
              >
                <LoadingLogo size={64} />
              </div>
            )}
          </div>
        </div>
        {!isLoading && appMetadata && (
          <UserPreview pubkey={appMetadata?.pubkey} />
        )}
      </div>
    </>
  );
}

const UserPreview = ({ pubkey }) => {
  const { userProfile } = useUserProfile(pubkey);
  if (!pubkey) return null;
  return (
    <div
      className="sc-s-18 bg-sp fx-scattered box-pad-h-s box-pad-v-s slide-down"
      style={{ width: "440px", borderRadius: "18px" }}
    >
      <div className="fx-centered">
        <UserProfilePic
          pubkey={pubkey}
          img={userProfile.picture}
          mainAccountUser={false}
          size={48}
        />
        <div>
          <p className="gray-c p-medium">Developed by</p>
          <p className="p-maj p-big">
            {userProfile.display_name || userProfile.name}
          </p>
        </div>
      </div>
      <Link
        href={`/profile/${nip19.nprofileEncode({ pubkey })}`}
        target="_blank"
        className="box-pad-h-s"
      >
        <div className="share-icon-24"></div>
      </Link>
    </div>
  );
};
