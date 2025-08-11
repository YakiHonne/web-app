import React, { Fragment, useEffect, useState } from "react";
import { isImageUrl } from "@/Helpers/ClientHelpers";
import LinkPreview from "@/Components/LinkPreview";
import IMGElement from "@/Components/IMGElement";

export default function LinkInspector({ el }) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkURL, setCheckUrl] = useState(false);
  useEffect(() => {
    isImageUrl(el).then((res) => {
      setIsLoading(true);
      setCheckUrl(res);
    });
  }, []);

  if (!isLoading)
    return (
      <Fragment>
        <LinkPreview url={el} />{" "}
      </Fragment>
    );
  if (checkURL) {
    if (checkURL.type === "image") {
      return <IMGElement src={el} />;
    } else if (checkURL.type === "video") {
      return (
        <video
          controls={true}
          autoPlay={false}
          name="media"
          width={"100%"}
          className="sc-s-18"
          style={{ margin: ".5rem auto", aspectRatio: "16/9" }}
        >
          <source src={el} type="video/mp4" />
        </video>
      );
    }
  } else if (
    el.includes(".mp3") ||
    el.includes(".ogg") ||
    el.includes(".wav")
  ) {
    return (
      <audio
        controls
        className="fit-container"
        style={{ margin: ".5rem auto", minWidth: "300px" }}
      >
        <source src={el} type="audio/ogg" />
        <source src={el} type="audio/mpeg" />
        <source src={el} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    );
  } else {
    return (
      <Fragment>
        <LinkPreview url={el} />{" "}
      </Fragment>
    );
  }
}
