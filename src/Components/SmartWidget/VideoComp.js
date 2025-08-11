import React from "react";
import { getVideoFromURL } from "@/Helpers/Helpers";

export default function VideoComp({ url = "" }) {
  
  return <div className="fit-container">{getVideoFromURL(url)}</div>;
}
