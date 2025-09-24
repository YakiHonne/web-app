import RelayImage from "@/Components/RelayImage";
import { getRelayMetadata } from "@/Helpers/utils";

export default function CFCategoryPreview({ category, minimal = false }) {
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
    let metadata = getRelayMetadata(category.value)
    return (
      <div className="fx-centered">
        <div style={{ position: "relative" }}>
          <RelayImage url={category.value} size={minimal ? 28 : 32} />
        </div>
        <div>
          <p className="p-one-line">{category.display_name}</p>
          {!minimal && <p className="gray-c p-one-line p-medium">{metadata?.description || metadata.value}</p>}
        </div>
      </div>
    );
  }

  return null;
}
