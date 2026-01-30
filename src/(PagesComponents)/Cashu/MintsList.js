import React from "react";
import useCloseContainer from "@/Hooks/useCloseContainer";

export default function Mintslist({
  list,
  cashuTokens,
  selectedMint,
  setSelectedMint,
  label,
  balancePosition = "bottom",
}) {
  const { containerRef, open, setOpen } = useCloseContainer();

  return (
    <div
      className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fit-container fx-scattered pointer"
      style={{ position: "relative", overflow: "visible" }}
      ref={containerRef}
    >
      {balancePosition === "bottom" && !open && (
        <div
          className="sticker sticker-normal sticker-green-side"
          style={{
            position: "absolute",
            left: "50%",
            right: "auto",
            bottom: "-20px",
            transform: "translate(-50%)",
            zIndex: 10000,
          }}
        >
          Max {cashuTokens[selectedMint.url]?.total || 0} sats
        </div>
      )}
      <div
        className="fit-container fx-centered fx-col fx-start-h fx-start-v"
        onClick={() => setOpen(!open)}
      >
        <div className="fit-container fx-scattered">
          <p className=" p-bold">{label}</p>
          <div className="arrow"></div>
        </div>
        <div className="fit-container fx-scattered">
          <div className="fx-centered">
            <div
              style={{
                backgroundImage: `url(${selectedMint.data.icon_url})`,
                minWidth: "32px",
                minHeight: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--pale-gray)",
              }}
              className="bg-img cover-bg"
            ></div>
            <div>
              <p className="p-caps p-one-line">{selectedMint.data.name}</p>
              <p className="gray-c p-medium p-one-line">{selectedMint.url}</p>
            </div>
          </div>
          {balancePosition !== "bottom" && (
            <div className="sticker sticker-normal sticker-green-side">
              Max {cashuTokens[selectedMint.url]?.total || 0} sats
            </div>
          )}
        </div>
      </div>
      {open && (
        <div
          className="fit-container sc-s-18 bg-sp fx-centered fx-col fx-start-v fx-start-h box-pad-h-s box-pad-v-s"
          style={{
            height: "max-content",
            maxHeight: "200px",
            overflow: "scroll",
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            right: 0,
            zIndex: 10000,
          }}
        >
          {list.map((mint) => {
            return (
              <div
                className="pointer fx-scattered fit-container box-pad-h-s box-pad-v-s option-no-scale"
                onClick={() => {
                  setSelectedMint(mint);
                  setOpen(false);
                }}
                key={mint.url}
              >
                <div className="fx-centered">
                  <div
                    style={{
                      backgroundImage: `url(${mint.data.icon_url})`,
                      minWidth: "32px",
                      minHeight: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--pale-gray)",
                    }}
                    className="bg-img cover-bg"
                  ></div>
                  <div>
                    <p className="p-caps p-one-line">{mint.data.name}</p>
                    <p className="gray-c p-medium p-one-line">{mint.url}</p>
                  </div>
                </div>
                <div
                  className="sticker sticker-normal sticker-green-side"
                  style={{ minWidth: "max-content" }}
                >
                  Max {cashuTokens[mint.url]?.total || 0} sats
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
