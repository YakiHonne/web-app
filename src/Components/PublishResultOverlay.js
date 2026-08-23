import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { nip19 } from "nostr-tools";
import Overlay from "@/Components/Overlay";
import Icon from "@/Components/Icon";

export const encodeEventAddress = (event) => {
  if (!event?.id) return "";
  try {
    const isAddressable = event.kind >= 30000 && event.kind < 40000;
    if (isAddressable) {
      const identifier = (event.tags || []).find((tag) => tag[0] === "d")?.[1];
      if (identifier) {
        return nip19.naddrEncode({
          identifier,
          pubkey: event.pubkey,
          kind: event.kind,
        });
      }
    }
    return nip19.neventEncode({ id: event.id, author: event.pubkey });
  } catch (err) {
    return "";
  }
};

const truncate = (text, max) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

function AuthorRow({ author }) {
  const { t } = useTranslation();

  return (
    <div className="fx-centered fx-start-h" style={{ columnGap: "12px" }}>
      <div
        style={{
          backgroundImage: `url(${author?.picture || ""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "var(--pale-gray)",
          borderRadius: "50%",
          width: 44,
          height: 44,
          flexShrink: 0,
        }}
      />
      <div className="fx-col fx-start-v" style={{ gap: "6px", minWidth: 0 }}>
        <p className="p-bold p-one-line" style={{ lineHeight: 1.2 }}>
          {author?.display_name || author?.name}
        </p>
        <p className="gray-c p-one-line" style={{ lineHeight: 1.2 }}>
          {author?.name ? `@${author.name} · ` : ""}
          {t("AoYTVKa")}
        </p>
      </div>
    </div>
  );
}

function SuccessHeader({ title, description }) {
  return (
    <div
      className="fit-container fx-centered fx-col"
      style={{ gap: ".75rem", marginTop: "2rem", marginBottom: "1rem" }}
    >
      <div
        className="fx-centered"
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: "var(--green-side)",
          color: "var(--green-main)",
          flexShrink: 0,
        }}
      >
        <Icon name="check" size={30} v={2} isColored />
      </div>
      <h3 className="p-centered" style={{ margin: 0, marginTop: ".5rem" }}>
        {title}
      </h3>
      <p
        className="gray-c p-centered"
        style={{ margin: 0, marginTop: ".25rem", fontSize: "1rem" }}
      >
        {description}
      </p>
    </div>
  );
}

export default function PublishResultOverlay({
  event,
  kind,
  article,
  isPaid = false,
  exit,
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const address = encodeEventAddress(event);
  const isArticle = kind === "article";

  const closeAndGoToProfile = () => {
    exit();
    const pubkey = event?.pubkey || userKeys?.pub;
    if (!pubkey) return;
    router.push({
      pathname: `/profile/${nip19.nprofileEncode({ pubkey })}`,
      query: { contentType: isArticle ? "articles" : "notes" },
    });
  };

  const openContent = () => {
    if (!address) return;
    exit();
    router.push(`/${address}`);
  };

  return (
    <Overlay width={520} exit={closeAndGoToProfile}>
      <div
        className="fx-col box-pad-h box-pad-v fit-container"
        style={{ gap: "1.75rem", position: "relative", paddingBottom: "2rem" }}
      >
        <div
          className="close"
          style={{ position: "absolute", top: "16px", right: "16px", zIndex: 1 }}
          onClick={closeAndGoToProfile}
        >
          <div />
        </div>

        <SuccessHeader
          title={isArticle ? t("AvTPwUZ") : t("A6KEotT")}
          description={isArticle ? t("AQN4FsD") : t("AVUGMNp")}
        />

        {isArticle ? (
          <div
            className="fit-container round-corner-m border-all fx-col"
            style={{ gap: 0, overflow: "hidden" }}
          >
            {article?.image && (
              <div
                className="fit-container"
                style={{
                  height: "150px",
                  backgroundImage: `url(${article.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "var(--pale-gray)",
                  position: "relative",
                }}
              >
                {article?.readTime > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(0,0,0,.6)",
                      backdropFilter: "blur(4px)",
                      color: "#ffffff",
                      fontSize: "var(--12)",
                      fontWeight: 600,
                    }}
                  >
                    {t("ATHyk8J", { count: article.readTime })}
                  </div>
                )}
              </div>
            )}
            <div className="fx-col box-pad-h box-pad-v-m" style={{ gap: "1rem" }}>
              <p className="p-bold" style={{ margin: 0, fontSize: "1.15rem" }}>
                {article?.title || t("AXRiMH0")}
              </p>
              {article?.summary && (
                <p className="gray-c" style={{ margin: 0 }}>
                  {truncate(article.summary, 220)}
                </p>
              )}
              <div style={{ paddingTop: ".75rem" }}>
                <AuthorRow author={userMetadata} />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="fit-container round-corner-m border-all box-pad-h box-pad-v-m fx-col"
            style={{ gap: "1rem", position: "relative" }}
          >
            {isPaid && (
              <div
                className="sticker sticker-paid"
                style={{ position: "absolute", top: "16px", right: "16px" }}
              >
                {t("AAg9D6c")}
              </div>
            )}
            <div style={{ paddingRight: isPaid ? "60px" : 0 }}>
              <AuthorRow author={userMetadata} />
            </div>
            <p
              className="p-n-lines"
              style={{
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                "--lines": 6,
                maskImage:
                  "linear-gradient(to bottom, #000 55%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 55%, transparent 100%)",
              }}
            >
              {event?.content || ""}
            </p>
          </div>
        )}

        <div
          className="fit-container fx-centered"
          style={{ columnGap: "12px", marginTop: ".75rem" }}
        >
          <button
            className="btn btn-normal btn-full"
            disabled={!address}
            onClick={openContent}
          >
            {t("AGIzqZe")}
          </button>
          <button
            className="btn btn-gst btn-full"
            onClick={closeAndGoToProfile}
          >
            {t("AReFNns")}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
