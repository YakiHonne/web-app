import RelayImage from "@/Components/RelayImage";
import { getRelayMetadata } from "@/Helpers/utils/relayMetadataCache";
import Icon from "@/Components/Icon";

export default function ContentFeedCategoryPreview({
  category,
  minimal = false,
}) {
  if (category.group === "cf") {
    return (
      <div className="fx-centered">
        {category.value === "top" && (
          <div>
            <Icon name="podium" size={24} />
          </div>
        )}
        {category.value === "widgets" && (
          <div>
            <Icon name="smart-widget" size={24} />
          </div>
        )}
        {category.value === "recent" && (
          <div>
            <Icon name="recent" size={24} />
          </div>
        )}
        {category.value === "recent_with_replies" && (
          <div>
            <Icon name="recent-wr" size={24} />
          </div>
        )}
        {category.value === "paid" && (
          <div>
            <Icon name="sats" size={24} />
          </div>
        )}
        {category.value === "network" && (
          <div>
            <Icon name="workflow" size={24} />
          </div>
        )}
        {category.value === "global" && (
          <div>
            <Icon name="globe" size={24} />
          </div>
        )}
        {category.value === "trending" && (
          <div>
            <Icon name="trending-up" size={24} />
          </div>
        )}
        <p className="p-maj p-one-line">{category.display_name}</p>
      </div>
    );
  }
  if (category.group === "af") {
    let metadata = getRelayMetadata(category.value);
    if (minimal) {
      return (
        <div className="fx-centered" style={{ gap: "6px" }}>
          <RelayImage url={category.value} size={20} />
          <p className="p-maj p-one-line">{category.display_name}</p>
        </div>
      );
    }
    return (
      <div className="fx-centered">
        <div style={{ position: "relative" }}>
          <RelayImage url={category.value} size={40} />
        </div>
        <div>
          <p className="p-one-line">{category.display_name}</p>
          <p className="gray-c p-one-line p-medium">
            {metadata?.description || metadata?.value}
          </p>
        </div>
      </div>
    );
  }
  if (category.group === "rsf") {
    if (minimal) {
      return (
        <div className="fx-centered" style={{ gap: "6px" }}>
          <div
            style={{
              minWidth: "20px",
              minHeight: "20px",
              borderRadius: "var(--border-r-50)",
              backgroundColor: "var(--white)",
              backgroundImage: `url(${category.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              flexShrink: 0,
            }}
            className="fx-centered"
          >
            {!category.image && (
              <p className="p-bold p-caps" style={{ fontSize: "10px" }}>
                {category.title.charAt(0)}
              </p>
            )}
          </div>
          <p className="p-maj p-one-line">{category.title}</p>
        </div>
      );
    }
    return (
      <div className="fx-centered">
        <div
          style={{
            minWidth: "40px",
            minHeight: "40px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--white)",
            backgroundImage: `url(${category.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="fx-centered"
        >
          {!category.image && (
            <p className="p-bold p-caps" style={{ position: "relative", zIndex: 1 }}>
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
  if (category.group === "pf") {
    if (minimal) {
      return (
        <div className="fx-centered" style={{ gap: "6px" }}>
          <div
            style={{
              minWidth: "20px",
              minHeight: "20px",
              borderRadius: "var(--border-r-50)",
              backgroundColor: "var(--white)",
              backgroundImage: `url(${category.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              flexShrink: 0,
            }}
            className="fx-centered"
          >
            {!category.image && (
              <p className="p-bold p-caps" style={{ fontSize: "10px" }}>
                {category.title.charAt(0)}
              </p>
            )}
          </div>
          <p className="p-maj p-one-line">{category.title}</p>
        </div>
      );
    }
    return (
      <div className="fx-centered">
        <div
          style={{
            minWidth: "40px",
            minHeight: "40px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--white)",
            backgroundImage: `url(${category.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="fx-centered"
        >
          {!category.image && (
            <p className="p-bold p-caps" style={{ position: "relative", zIndex: 1 }}>
              {category.title.charAt(0)}
            </p>
          )}
        </div>
        <div>
          <p className="p-one-line">{category.title}</p>
          <p className="p-medium gray-c p-one-line">{category.description}</p>
        </div>
      </div>
    );
  }

  return null;
}
