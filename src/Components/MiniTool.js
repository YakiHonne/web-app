import React, { useEffect, useRef } from "react";
import SWHandler from "smart-widget-handler";
import { useDispatch, useSelector } from "react-redux";
import { assignClientTag } from "@/Helpers/Helpers";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import { InitEvent, publishEvent } from "@/Helpers/Controlers";

export default function MiniTool({ url, setReturnedData }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userRelays = useSelector((state) => state.userRelays);
  const userMetadata = useSelector((state) => state.userMetadata);
  const iframeRef = useRef(null);

  useEffect(() => {
    let listener;
    if (iframeRef.current) {
      listener = SWHandler.host.listen(async (event) => {
        if (event?.kind === "app-loaded") {
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
          setReturnedData(event.data);
        }
      });
    }
    return () => {
      if (listener) listener.close();
    };
  }, []);

  const copyURL = () => {
    navigator.clipboard.writeText(url);
    dispatch(
      setToast({
        type: 1,
        desc: "Link was copied",
      })
    );
  };

  return (
    <section
      className="fit-container fx-centered"
      style={{
        overflow: "hidden",
        gap: 0,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* <div className="sw-fit-container box-pad-h-m box-pad-v-s fx-scattered">
        <div className="close" style={{ position: "static" }} onClick={exit}>
          <div></div>
        </div>
        <div className="fx-centered fx-col" style={{ gap: 0 }}>
          <p>{domain}</p>
          <p className="p-one-line gray-c p-medium">
            {url.replace("https://", "")}
          </p>
        </div>
        <OptionsDropdown
          options={[
            <p
              style={{
                color: "white",
                fontSize: ".8rem",
                cursor: "pointer",
              }}
              onClick={copyURL}
            >
              Copy link
            </p>,
            <p
              style={{
                color: "white",
                fontSize: ".8rem",
                cursor: "pointer",
              }}
              onClick={reloadiFrame}
            >
              Reload app
            </p>,
          ]}
        />
      </div> */}
      <div className="fit-container fx-centered">
        <iframe
          ref={iframeRef}
          src={url}
          allow="microphone; camera; clipboard-write 'src'"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          style={{ border: "none", height: "60vh", margin: 0 }}
          className="fit-container"
        ></iframe>
      </div>
    </section>
  );
}
