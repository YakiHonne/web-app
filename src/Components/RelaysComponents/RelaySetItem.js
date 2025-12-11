import { useTranslation } from "react-i18next";
import useRelaysSet from "@/Hooks/useRelaysSet";
import { getParsedRelaySet } from "@/Helpers/Encryptions";
import { useState } from "react";

export default function RelaySetItem({
  item,
  removeRelaySet,
  removeRelaySetConfirmation,
  index,
  allowDrag = false,
  seeDetails,
}) {
  const { t } = useTranslation();
  const { userRelaysSet } = useRelaysSet();
  const [initiateDeletion, setInitiateDeletion] = useState(false);
  const metadata = getParsedRelaySet(userRelaysSet[item.id]);

  if (!metadata) {
    return (
      <div
        className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
        style={{ overflow: "visible", cursor: "grab" }}
      >
        <p className="italic-p gray-c">Details not found</p>
      </div>
    );
  }
  return (
    <div
      className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
      style={{ overflow: "visible", cursor: allowDrag ? "grab" : "default" }}
    >
      <div className="fx-centered">
        <div
          style={{
            minWidth: "30px",
            minHeight: "30px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--white)",
            backgroundImage: `url(${metadata.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="fx-centered"
        >
          {!metadata.image && (
            <p
              className={`p-bold p-caps `}
              style={{ position: "relative", zIndex: 1 }}
            >
              {metadata.title.charAt(0)}
            </p>
          )}
        </div>
        <div>
          <p className="p-one-line">{metadata.title}</p>
          <p className="p-medium gray-c p-one-line">{metadata.title}</p>
        </div>
      </div>
      <div className="fx-centered">
        <div
          className="pointer sticker sticker-normal sticker-gray-black fx-centered"
          style={{ minWidth: "max-content", gap: "3px" }}
          onClick={() => (seeDetails ? seeDetails(metadata) : null)}
        >
          {metadata.relays.length}{" "}
          {metadata.relays.length === 1 ? "relay" : "relays"}{" "}
          <div className="arrow-12"></div>
        </div>
        {!initiateDeletion && (
          <div
            className="round-icon-small round-icon-tooltip"
            data-tooltip={t("Almq94P")}
            style={{ cursor: "pointer" }}
            onClick={() =>
              !removeRelaySetConfirmation
                ? removeRelaySet(index)
                : setInitiateDeletion(true)
            }
          >
            <div className="trash"></div>
          </div>
        )}
        {initiateDeletion && (
          <div className="fx-centered">
            <button
              className="btn btn-normal btn-gst-red btn-small"
              onClick={() => setInitiateDeletion(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-normal btn-red btn-small"
              onClick={() => removeRelaySet(index)}
            >
              Delete
            </button>
          </div>
        )}
        {allowDrag && (
          <div
            className="drag-el"
            style={{ minWidth: "16px", aspectRatio: "1/1" }}
          ></div>
        )}
      </div>
    </div>
  );
}
