import React from "react";
import SearchEngine from "./SearchEngine";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { customHistory } from "@/Helpers/History";
import { swContent } from "./content";
import RightSidebar from "./RightSidebar";

export default function MobileNavbar({ page }) {
  const currentPath = `/docs/sw/${page}`;

  const isPage = (url) => {
    return url === currentPath;
  };

  return (
    <div className="fit-container fx-centered fx-col desk-hide-1200 box-pad-h-m box-pad-v-m">
      <div className="fit-container fx-scattered">
        <div
          className="yakihonne-logo"
          style={{
            width: "100px",
            height: "50px",
          }}
        ></div>
        <SearchEngine sticky={false} />
      </div>
      <hr />
      <div className="fit-container fx-scattered">
        <div className="fx-centered">
          <p>{swContent[page].title}</p>
          <OptionsDropdown
            icon="arrow"
            options={[
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
              </div>,
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
              </div>,
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
                    isPage("/docs/sw/smart-widget-previewer")
                      ? "c1-c"
                      : "gray-c"
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
              </div>,
              <div
                className="fit-container link-items fx-scattered fx-col fx-start-v "
                style={{ rowGap: "8px", maxHeight: "71vh" }}
              >
                <p className="p-bold">Useful links</p>
                <div className={`pointer fit-container fx-start-h fx-centered`}>
                  <div className="link-label gray-c">Basic dynamic widgets</div>
                  <div className="share-icon"></div>
                </div>
              </div>,
            ]}
            vertical={false}
          />
        </div>
        <div className="fx-centered desk-hide-1000">
          <p className="p-bold">On this page</p>
          <OptionsDropdown
            options={[<RightSidebar compact={true} page={page} />]}
            displayLeft={true}
            vertical={false}
          />
        </div>
      </div>
      <hr />
      <hr />
    </div>
  );
}
