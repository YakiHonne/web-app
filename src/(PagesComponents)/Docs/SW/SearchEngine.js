import React, { useEffect, useState } from "react";
import { swContent } from "./content";
import { customHistory } from "@/Helpers/History";
import slugify from "slugify";

export default function SearchEngine({ sticky = true }) {
  const [searchWindow, setSearchWindow] = useState(false);
  useEffect(() => {
    let handleKeyDown = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        setSearchWindow(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {searchWindow && <SearchWindow exit={() => setSearchWindow(false)} />}
      <div className={`fx-centered fx-start-h ${sticky ? "fit-container sticky" : ""}`}>
        <div
          className="if fx-scattered fit-container pointer sw-search-box sc-s-18"
          onClick={() => setSearchWindow(!searchWindow)}
          style={{ width: "250px", height: "40px", padding: "0 .75rem" }}
        >
          <div className="fx-centered">
            <div className="search"></div>
            <p className="gray-c">Search</p>
          </div>
          <div
            style={{
              border: "1px solid var(--gray)",
              borderRadius: "5px",
              padding: ".15rem .5rem",
            }}
          >
            <p className="p-medium">/</p>
          </div>
        </div>
      </div>
    </>
  );
}

const SearchWindow = ({ exit }) => {
  const [results, setResults] = useState([]);
  const handleOnChange = (e) => {
    const searchValue = e.target.value;
    if (!searchValue) {
      setResults([]);
      return;
    }
    let res = searchSmartWidgetDocs(swContent, searchValue);
    res.length = Math.min(res.length, 7);
    setResults(res);
  };

  const handleRedirect = (page, hash) => {
    customHistory(
      `/docs/sw/${page}${
        hash ? `#${slugify(hash, { lower: true, strict: true })}` : ""
      }`
    );
    exit();
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h box-pad-v fx-start-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="fx-centered fx-col fx-start-h fx-start-v slide-up"
        style={{ width: "min(100%, 650px)" }}
      >
        <div className="if fx-scattered fit-container pointer sw-search-box sc-s-18">
          <div className="fx-centered">
            <div className="search"></div>
            <input
              type="text"
              className="if if-no-border ifs-full"
              placeholder="Search"
              onChange={handleOnChange}
              autoFocus
            />
          </div>
          <div
            style={{
              border: "1px solid var(--gray)",
              borderRadius: "5px",
              padding: ".25rem .5rem",
            }}
          >
            <p className="p-medium">/</p>
          </div>
        </div>
        {results.length > 0 && (
          <div className="fit-container box-pad-h-s box-pad-v-s sc-s-18 fx-centered fx-col fx-start-h">
            {results.map((res, index) => {
              return (
                <div
                  className="sc-s-18 option box-pad-h-s box-pad-v-s fit-container pointer"
                  key={index}
                  onClick={() => handleRedirect(res.key, res.value)}
                >
                  <div className="fx-centered fx-start-h" style={{ gap: 0 }}>
                    <p className="p-maj">{res.key.replaceAll("-", " ")}</p>
                    {res.full_tail && res.key !== res.full_tail && (
                      <p className="c1-c"> {` > ${res.full_tail}`}</p>
                    )}
                  </div>
                  <p className="gray-c">...</p>
                  <p className="gray-c">{res.context}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function searchSmartWidgetDocs(docs, keyword) {
  const results = [];

  for (const key in docs) {
    const { content, subtitles } = docs[key];

    // Search in markdown content
    const contentIndex = content.toLowerCase().indexOf(keyword.toLowerCase());
    if (contentIndex !== -1) {
      const headerMatch = extractNearestMarkdownHeader(content, contentIndex);
      const context = extractContextSnippet(content, contentIndex, 50);
      if (headerMatch) {
        results.push({
          key,
          value: headerMatch,
          full_tail: headerMatch,
          context,
        });
      }
    }

    // Search in titles and subtitles
    const titleMatches = deepSearchTitles(subtitles, keyword, content);
    titleMatches.forEach(({ value, full_tail, context }) => {
      results.push({
        key,
        value,
        full_tail,
        context,
      });
    });
  }

  return results;
}

function deepSearchTitles(subtitles, keyword, content, parentPath = "") {
  const matches = [];

  for (const subtitle of subtitles) {
    const currentPath = parentPath
      ? `${parentPath} > ${subtitle.title}`
      : subtitle.title;

    if (subtitle.title.toLowerCase().includes(keyword.toLowerCase())) {
      matches.push({
        value: subtitle.title,
        full_tail: currentPath,
        context: extractContextSnippet(
          content,
          content.toLowerCase().indexOf(keyword.toLowerCase()),
          50
        ),
      });
    }

    if (subtitle.subtitles?.length) {
      for (const sub of subtitle.subtitles) {
        const subPath = `${currentPath} > ${sub.title}`;
        if (sub.title.toLowerCase().includes(keyword.toLowerCase())) {
          matches.push({
            value: sub.title,
            full_tail: subPath,
            context: extractContextSnippet(
              content,
              content.toLowerCase().indexOf(keyword.toLowerCase()),
              50
            ),
          });
        }
      }
    }
  }

  return matches;
}

function extractNearestMarkdownHeader(content, index) {
  const before = content.slice(0, index);
  const lines = before.split("\n").reverse();

  for (const line of lines) {
    const match = line.match(/^#{1,6} (.+)$/);
    if (match) return match[1];
  }

  return null;
}

function extractContextSnippet(content, index, length = 50) {
  const start = Math.max(index - length / 2, 0);
  const end = Math.min(index + length / 2, content.length);
  return content.slice(start, end).replace(/\n/g, " ").trim();
}
