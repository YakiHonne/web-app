import React from "react";
import VideoComp from "@/Components/SmartWidget/VideoComp";
import ZapPollsComp from "@/Components/SmartWidget/ZapPollsComp";
import ImgComp from "@/Components/SmartWidget/ImgComp";
import ButtonComp from "@/Components/SmartWidget/ButtonComp";
import TextComp from "@/Components/SmartWidget/TextComp";

export default function PreviewContainer({ metadata, pubkey }) {
  
  return (
    <div className="fx-centered fx-col fit-container">
      <div
        className="fx-centered fit-container fx-start-h fx-start-v fx-stretch"
        style={{ gap: "16px" }}
      >
        {metadata?.left_side.length === 0 && (
          <div
            style={{ flex: metadata?.division?.split(":")[0] }}
            className="fx-centered fx-col"
          ></div>
        )}
        {metadata?.left_side.length > 0 && (
          <div
            style={{ flex: metadata?.division?.split(":")[0] }}
            className="fx-centered fx-col"
          >
            {metadata?.left_side?.map((comp, index) => {
              if (comp?.type === "video")
                return <VideoComp url={comp?.metadata?.url} key={index} />;

              if (comp?.type === "zap-poll")
                return (
                  <ZapPollsComp
                    nevent={comp?.metadata?.nevent}
                    event={
                      comp?.metadata?.content
                        ? JSON.parse(comp?.metadata?.content)
                        : null
                    }
                    content_text_color={comp?.metadata?.content_text_color}
                    options_text_color={comp?.metadata?.options_text_color}
                    options_background_color={
                      comp?.metadata?.options_background_color
                    }
                    options_foreground_color={
                      comp?.metadata?.options_foreground_color
                    }
                    key={index}
                  />
                );
              if (comp?.type === "image")
                return (
                  <ImgComp
                    url={comp?.metadata?.url}
                    aspectRatio={comp?.metadata?.aspect_ratio || "16:9"}
                    key={index}
                  />
                );
              if (comp?.type === "text")
                return (
                  <TextComp
                    content={comp?.metadata?.content}
                    size={comp?.metadata?.size}
                    weight={comp?.metadata?.weight}
                    textColor={comp?.metadata?.text_color}
                    key={index}
                  />
                );
              if (comp?.type === "button")
                return (
                  <ButtonComp
                    content={comp?.metadata?.content}
                    textColor={comp?.metadata?.text_color}
                    url={comp?.metadata?.url}
                    backgroundColor={comp?.metadata?.background_color}
                    type={comp?.metadata?.type}
                    key={index}
                    recipientPubkey={comp?.metadata?.pubkey || pubkey}
                  />
                );
            })}
          </div>
        )}
        {metadata?.layout === 2 && metadata?.right_side.length > 0 && (
          <div
            style={{ flex: metadata?.division?.split(":")[1] }}
            className="fx-centered fx-col"
          >
            {metadata?.right_side?.map((comp, index) => {
              if (comp?.type === "video")
                return <VideoComp url={comp?.metadata?.url} key={index} />;
              if (comp?.type === "image")
                return (
                  <ImgComp
                    url={comp?.metadata?.url}
                    aspectRatio={comp?.metadata?.aspect_ratio || "16:9"}
                    key={index}
                  />
                );
              if (comp?.type === "text")
                return (
                  <TextComp
                    content={comp?.metadata?.content}
                    size={comp?.metadata?.size}
                    weight={comp?.metadata?.weight}
                    textColor={comp?.metadata?.text_color}
                    key={index}
                  />
                );
              if (comp?.type === "button")
                return (
                  <ButtonComp
                    content={comp?.metadata?.content}
                    textColor={comp?.metadata?.text_color}
                    url={comp?.metadata?.url}
                    backgroundColor={comp?.metadata?.background_color}
                    type={comp?.metadata?.type}
                    key={index}
                    recipientPubkey={comp?.metadata?.pubkey || pubkey}
                  />
                );
            })}
          </div>
        )}
        {metadata?.layout === 2 && metadata?.right_side.length === 0 && (
          <div
            style={{ flex: metadata?.division?.split(":")[1] }}
            className="fx-centered fx-col"
          ></div>
        )}
      </div>
    </div>
  );
}
