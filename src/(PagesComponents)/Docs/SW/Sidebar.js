import React, { useEffect, useRef, useState } from "react";
import { customHistory } from "@/Helpers/History";

export default function Sidebar({ page }) {
  const mainFrame = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const currentPath = `/docs/sw/${page}`;

  const isPage = (url) => {
    return url === currentPath;
  };
  useEffect(() => {
    let handleOffClick = (e) => {
      if (mainFrame.current && !mainFrame.current.contains(e.target))
        setIsActive(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [mainFrame]);

  return (
    <>
      <div
        className="fx-scattered fx-end-v  box-pad-v-m fx-col mb-hide sticky" 
        style={{
          zIndex: isActive ? 1000 : 200,
        }}
      >
        <div
          className="fx-scattered fx-start-v fx-col fit-container"
          style={{ height: "100%" }}
        >
          <div className="fx-start-h fx-centered fx-col fit-container">
            <div className="fx-centered fx-start-h fit-container">
              <div
                className="yakihonne-logo-128"
                onClick={() => customHistory("/")}
              ></div>
              <div className="sticker sticker-c1 sticker-small">DOCS</div>
            </div>
            <div className="mb-show" style={{ height: "200px" }}></div>
            <div className="fit-container box-pad-v-s">
              <hr />
              <hr />
            </div>
            <div
              className="fit-container link-items fx-scattered fx-col fx-start-v "
              style={{ rowGap: "8px", maxHeight: "71vh" }}
            >
              <p className="p-bold">Introduction</p>
              <div
                onClick={() => {
                  customHistory("/docs/sw/intro");
                }}
                className={`pointer fit-container fx-start-h fx-centered  ${
                  isPage("/docs/sw/intro") ? "c1-c" : "gray-c"
                }`}
              >
                <div className="link-label">What are Smart widgets?</div>
              </div>
              <div
                onClick={() => {
                  customHistory("/docs/sw/getting-started");
                }}
                className={`pointer fit-container fx-start-h fx-centered  ${
                  isPage("/docs/sw/getting-started") ? "c1-c" : "gray-c"
                }`}
              >
                <div className="link-label">Getting started</div>
              </div>
            </div>
            <div className="fit-container box-pad-v-s">
              <hr />
              <hr />
            </div>
            <div
              className="fit-container link-items fx-scattered fx-col fx-start-v "
              style={{ rowGap: "8px", maxHeight: "71vh" }}
            >
              <p className="p-bold">Build widgets</p>
              <div
                onClick={() => {
                  customHistory("/docs/sw/basic-widgets");
                }}
                className={`pointer fit-container fx-start-h fx-centered  ${
                  isPage("/docs/sw/basic-widgets") ? "c1-c" : "gray-c"
                }`}
              >
                <div className="link-label">Basic widgets</div>
              </div>
              <div
                onClick={() => {
                  customHistory("/docs/sw/action-tool-widgets");
                }}
                className={`pointer fit-container fx-start-h fx-centered  ${
                  isPage("/docs/sw/action-tool-widgets") ? "c1-c" : "gray-c"
                }`}
              >
                <div className="link-label">Action/Tool widgets</div>
              </div>
            </div>
            <div className="fit-container box-pad-v-s">
              <hr />
              <hr />
            </div>
            <div
              className="fit-container link-items fx-scattered fx-col fx-start-v "
              style={{ rowGap: "8px", maxHeight: "71vh" }}
            >
              <p className="p-bold">SDK</p>
              <div
                onClick={() => {
                  customHistory("/docs/sw/smart-widget-builder");
                }}
                className={`pointer fit-container fx-start-h fx-centered  ${
                  isPage("/docs/sw/smart-widget-builder") ? "c1-c" : "gray-c"
                }`}
              >
                <div className="link-label">Smart widget builder</div>
              </div>
              <div
                onClick={() => {
                  customHistory("/docs/sw/smart-widget-previewer");
                }}
                className={`pointer fit-container fx-start-h fx-centered  ${
                  isPage("/docs/sw/smart-widget-previewer") ? "c1-c" : "gray-c"
                }`}
              >
                <div className="link-label">Smart widget previewer</div>
              </div>
              <div
                onClick={() => {
                  customHistory("/docs/sw/smart-widget-handler");
                }}
                className={`pointer fit-container fx-start-h fx-centered  ${
                  isPage("/docs/sw/smart-widget-handler") ? "c1-c" : "gray-c"
                }`}
              >
                <div className="link-label">Smart widget handler</div>
              </div>
            </div>
            <div className="fit-container box-pad-v-s">
              <hr />
              <hr />
            </div>
            <div
              className="fit-container link-items fx-scattered fx-col fx-start-v "
              style={{ rowGap: "8px", maxHeight: "71vh" }}
            >
              <p className="p-bold">Useful links</p>
              <a
                target="_blank"
                href="https://github.com/YakiHonne/sw-dynamic-api"
                className={`pointer fit-container fx-start-h fx-centered`}
              >
                <div className="link-label gray-c">Basic dynamic widgets</div>
                <div className="share-icon"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
