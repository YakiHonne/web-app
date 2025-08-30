import React from "react";
import { swContent } from "./content";
import Link from "next/link";

const getPaths = (page) => {
  let currentPath = page;
  currentPath = currentPath.replace("/docs/sw/", "");
  const path = Object.keys(swContent);
  let index = path.indexOf(currentPath);
  let previousPath = index === 0 ? false : path[index - 1];
  let nextPath = index === path.length - 1 ? false : path[index + 1];

  let paths = {
    previousPath: {
      path: previousPath,
      title: previousPath ? previousPath.replace(/-/g, " ") : false,
    },
    nextPath: {
      path: nextPath,
      title: nextPath ? nextPath.replace(/-/g, " ") : false,
    },
  };
  return paths;
};

export default function Footer({ page }) {
  const paths = getPaths(page);
  return (
    <div
      className="fit-container fx-scattered box-pad-v box-marg-full"
      style={{ borderTop: "1px solid var(--pale-gray)" }}
    >
      {paths.previousPath.path && (
        <Link
          className="fx-centered fx-start-h fx-end-v fx-col"
          style={{ gap: "0px" }}
          href={`/docs/sw/${paths.previousPath.path}`}
        >
          <div className="fx-centered" style={{ gap: "20px" }}>
            <div className="arrow" style={{ rotate: "90deg" }}></div>
            <p className="p-maj p-big">{paths.previousPath.title}</p>
          </div>
          <p className="gray-c">Previous</p>
        </Link>
      )}
      {!paths.previousPath.path && (
        <div className="fx-centered fx-start-h"></div>
      )}
      {paths.nextPath.path && (
        <Link
          href={`/docs/sw/${paths.nextPath.path}`}
          className="fx-centered fx-start-h fx-start-v fx-col"
          style={{ gap: "0px" }}
        >
          <div className="fx-centered" style={{ gap: "20px" }}>
            <p className="p-maj p-big">{paths.nextPath.title}</p>
            <div className="arrow" style={{ rotate: "-90deg" }}></div>
          </div>
          <p className="gray-c">Next</p>
        </Link>
      )}
      {!paths.nextPath.path && <div className="fx-centered fx-start-h"></div>}
    </div>
  );
}
