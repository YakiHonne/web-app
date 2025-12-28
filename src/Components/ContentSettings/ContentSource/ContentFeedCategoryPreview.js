import RelayImage from "@/Components/RelayImage";
import { getRelayMetadata } from "@/Helpers/utils/relayMetadataCache";

export default function ContentFeedCategoryPreview({ category, minimal = false }) {
  if (category.group === "cf") {
    return (
      <div className="fx-centered">
        {category.value === "top" && (
          <div>
            <div className="medal-24"></div>
          </div>
        )}
        {category.value === "widgets" && (
          <div>
            <div className="smart-widget-24"></div>
          </div>
        )}
        {category.value === "recent" && (
          <div>
            <div className="recent-24"></div>
          </div>
        )}
        {category.value === "recent_with_replies" && (
          <div>
            <div className="recent-wr-24"></div>
          </div>
        )}
        {category.value === "paid" && (
          <div>
            <div className="sats-24"></div>
          </div>
        )}
        {category.value === "network" && (
          <div>
            <div className="posts-24"></div>
          </div>
        )}
        {category.value === "global" && (
          <div>
            <div className="globe-24"></div>
          </div>
        )}
        <p className="p-maj p-one-line">{category.display_name}</p>
      </div>
    );
  }
  if (category.group === "af") {
    let metadata = getRelayMetadata(category.value);
    return (
      <div className="fx-centered">
        <div style={{ position: "relative" }}>
          <RelayImage url={category.value} size={minimal ? 32 : 40} />
        </div>
        <div>
          <p className="p-one-line">{category.display_name}</p>
          {!minimal && (
            <p className="gray-c p-one-line p-medium">
              {metadata?.description || metadata?.value}
            </p>
          )}
        </div>
      </div>
    );
  }
  if (category.group === "rsf") {
    return (
      <div className="fx-centered">
        <div
          style={{
            minWidth: minimal ? "32px" : "40px",
            minHeight: minimal ? "32px" : "40px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--white)",
            backgroundImage: `url(${category.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="fx-centered"
        >
          {!category.image && (
            <p
              className={`p-bold p-caps `}
              style={{ position: "relative", zIndex: 1 }}
            >
              {category.title.charAt(0)}
            </p>
          )}
        </div>
        <div>
          <p className="p-one-line">{category.title}</p>
          <p className="p-medium gray-c p-one-line">{category.title}</p>
        </div>
      </div>
    );
  }

  return null;
}
