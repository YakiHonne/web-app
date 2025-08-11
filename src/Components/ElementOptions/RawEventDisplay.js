import React from "react";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { copyText } from "@/Helpers/Helpers";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import rehypeRaw from "rehype-raw";
import useUserProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "@/Components/UserProfilePic";
import { convertDate } from "@/Helpers/Encryptions";
import { eventKinds } from "@/Content/Extra";
export default function RawEventDisplay({ event, exit }) {
  const { isNip05Verified, userProfile } = useUserProfile(event.pubkey);
  const { t } = useTranslation();
  let eventString = `\`\`\`json 
  ${JSON.stringify(event, null, 2)}
  \`\`\``;
  const handleCopyelement = (id) => {
    const codeRef = document.getElementById(id);
    if (!codeRef) return;
    const codeText = codeRef.innerText;
    copyText(codeText, "Code is copied");
  };
  return (
    <div
      className="fixed-container box-pad-h fx-centered fx-col"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h-s box-pad-v-s bg-sp fx-centered fx-col sc-s-18 slide-up"
        style={{ width: "min(100%, 500px)", position: "relative" }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="fx-centered box-pad-v-s">
          <h4>{t("AyMRcJY")}</h4>
        </div>
        <div className="fit-container sc-s-18 bg-sp box-pad-h-m box-pad-v-m fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered fx-start-h">
            <p className="gray-c">{t("AY0XZEx")}</p>
            <UserProfilePic
              user_id={event.pubkey}
              size={16}
              img={userProfile?.picture}
            />
            <p>{userProfile.display_name || userProfile?.name}</p>
            {isNip05Verified && <div className="checkmark-c1"></div>}
          </div>
          <div className="fx-centered fx-start-h">
            <p className="gray-c">{t("AZxuurd")}</p>
            <p>{convertDate(event.created_at * 1000, true)}</p>
          </div>
          <div className="fx-centered fx-start-h">
            <p className="gray-c">{t("A6VczZW")}</p>
            <p className="p-maj">{eventKinds[event.kind]}</p>
          </div>
        </div>
        <div
          className="fit-container sc-s-18 bg-sp"
          style={{ width: "min(100%, 500px)" }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="fit-container md-content">
            <ReactMarkdown
              children={eventString}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeRef = nanoid();
                  return !inline ? (
                    <pre>
                      <div
                        className="sc-s-18 box-pad-v-s box-pad-h-m fit-container fx-scattered"
                        style={{
                          borderBottomRightRadius: 0,
                          borderBottomLeftRadius: 0,
                          position: "relative",
                          top: "0px",
                          position: "sticky",
                          border: "none",
                        }}
                      >
                        <p className="gray-c p-italic">
                          {match?.length > 0 ? match[1] : ""}
                        </p>
                        <div className="fx-centered">
                          <div
                            className="round-icon-small pointer"
                            onClick={() => {
                              handleCopyelement(codeRef);
                            }}
                          >
                            <div className="copy"></div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`hljs ${className} box-pad-h-m box-pad-v-m`}
                        style={{ paddingRight: "2rem" }}
                      >
                        <code
                          className={`hljs ${className}`}
                          {...props}
                          id={codeRef}
                          style={{ maxHeight: "50vh" }}
                        >
                          {children}
                        </code>
                      </div>
                    </pre>
                  ) : (
                    <code
                      className="inline-code"
                      {...props}
                      style={{ margin: "1rem 0" }}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
