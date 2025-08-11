import React, { useEffect, useRef, useState } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { useTranslation } from "react-i18next";

const gf = new GiphyFetch(process.env.REACT_APP_GHIPHY_API_KEY);

export default function Gifs({ setGif, exit, position = "left" }) {
  const ref = useRef(null);
  const { t } = useTranslation();
  const [search, setSearch] = useState();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
    }
  }, [ref.current]);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (ref.current && !ref.current.contains(e.target)) exit();
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [ref]);

  const fetchGifs = (offset) =>
    gf.search(search || "trending", { offset, limit: 10 });

  return (
    <div
      className={`fit-container fx-centered fx-col fx-start-h sc-s-18 bg-sp ${position === "left" ? "drop-down-r" : "drop-down"}`}
      style={{
        maxHeight: "300px",
        overflow: "scroll",
        position: "absolute",
        // [position]: 0,
        bottom: "calc(100% + 5px)",
        width: "200px",
        zIndex: 102,
      }}
      ref={ref}
    >
      <div
        style={{ padding: "unset", backgroundColor: "var(--c1-side)" }}
        className="fit-container sticky "
      >
        <div
          className="fx-centered fit-container "
          style={{
            backgroundColor: "var(--c1-side)",
            padding: "0 1rem",
            borderRadius: "var(--border-r-18)",
            border: "1px solid var(--very-dim-gray)",
          }}
        >
          <div className="search-24"></div>
          <input
            type="text"
            placeholder={t("AWYdgPH")}
            className="if ifs-full if-no-border"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            style={{ paddingLeft: ".5rem", height: "40px" }}
            autoFocus
          />
          {search && (
            <div
              className="close"
              style={{ top: "8px", right: "8px" }}
              onClick={() => {
                setSearch("");
              }}
            >
              <div></div>
            </div>
          )}
        </div>
      </div>
      <Grid
        width={width}
        columns={3}
        fetchGifs={fetchGifs}
        key={search}
        onGifClick={(data, e) => {
          e.preventDefault();
          setGif(data.images.original.url);
        }}
        hideAttribution={true}
        on
      />
    </div>
  );
}
