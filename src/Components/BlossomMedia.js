import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import IMGElement from "@/Components/IMGElement";
import VideoLoader from "@/Components/VideoLoader";
import Spinner from "@/Components/Spinner";
import { getBlossomMediaType, resolveBlossomURI } from "@/Helpers/BlossomURI";

const AudioLoader = dynamic(() => import("@/Components/AudioLoader"), {
  ssr: false,
});

export default function BlossomMedia({ blob, pubkey }) {
  const [url, setUrl] = useState(undefined);
  const type = getBlossomMediaType(blob.ext);

  useEffect(() => {
    let cancelled = false;
    setUrl(undefined);
    resolveBlossomURI(blob).then((res) => {
      if (!cancelled) setUrl(res || null);
    });
    return () => {
      cancelled = true;
    };
  }, [blob.uri]);

  if (url === undefined)
    return (
      <span className="fit-container fx-centered box-pad-v-s">
        <Spinner />
      </span>
    );

  if (url === null || type === "file")
    return (
      <a
        style={{ wordBreak: "break-all", color: "var(--orange-main)" }}
        href={url || undefined}
        target="_blank"
        className="btn-text-gray"
        onClick={(e) => e.stopPropagation()}
      >
        {url || blob.uri}
      </a>
    );

  if (type === "image") return <IMGElement src={url} />;
  if (type === "video") return <VideoLoader pubkey={pubkey} src={url} />;
  return <AudioLoader audioSrc={url} />;
}
