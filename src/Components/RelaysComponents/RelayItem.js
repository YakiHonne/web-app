import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RelayImage from "@/Components/RelayImage";
import { getRelayMetadata } from "@/Helpers/utils";
import { saveRelayMetadata } from "@/Helpers/Controlers";

export default function RelayItem({
  item,
  removeRelay,
  index,
  allowDrag = false,
}) {
  const { t } = useTranslation();
  let [metadata, setMetadata] = useState(getRelayMetadata(item.id));

  useEffect(() => {
    const fetchData = async () => {
      let metadata = await saveRelayMetadata([item.id]);
      setMetadata(metadata[0]);
    };
    if (!metadata) {
      fetchData();
    }
  }, []);

  return (
    <div
      className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
      style={{ overflow: "visible", cursor: allowDrag ? "grab" : "default" }}
    >
      <div className="fx-centered">
        <RelayImage url={item.id} size={32} />
        <div>
          <p className="p-maj">{item.id}</p>
          <p className="gray-c p-one-line p-medium">
            {metadata?.description || item.id}
          </p>
        </div>
      </div>
      <div className="fx-centered">
        {removeRelay && (
          <div
            className="round-icon-small round-icon-tooltip"
            data-tooltip={t("Almq94P")}
            style={{ cursor: "pointer" }}
            onClick={() => removeRelay(index)}
          >
            <div className="trash"></div>
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
