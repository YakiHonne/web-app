import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setToast, setToPublish } from "../../Store/Slides/Publishers";
import { InitEvent } from "../../Helpers/Controlers";
import LoadingDots from "../../Components/LoadingDots";

export function AddBlossomServer({ exit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userBlossomServers = useSelector((state) => state.userBlossomServers);
  const [customServer, setCustomServer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addNewServer = async () => {
    if (!customServer) return;
    try {
      new URL(customServer);
      setIsLoading(true);
      const event = {
        kind: 10063,
        content: "",
        tags: [
          ...[...new Set([...userBlossomServers, customServer])].map((url) => [
            "server",
            url,
          ]),
        ],
      };
      const eventInitEx = await InitEvent(
        event.kind,
        event.content,
        event.tags
      );
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );
      setIsLoading(false);
      exit();
    } catch (_) {
      dispatch(
        setToast({
          type: 2,
          desc: t("A2l1JgC"),
        })
      );
      setIsLoading(false);
      return false;
    }
  };

  return (
    <div className=" fit-container">
      <div className="fx-centered fit-container slide-down">
        <input
          type="text"
          placeholder={t("A8PtjSa")}
          className="if ifs-full"
          style={{ height: "40px" }}
          value={customServer}
          onChange={(e) => setCustomServer(e.target.value)}
        />
        <button
          className="btn btn-normal"
          style={{ minWidth: "max-content" }}
          onClick={addNewServer}
          disabled={isLoading}
        >
          {isLoading ? <LoadingDots /> : t("ALyj7Li")}
        </button>
      </div>
    </div>
  );
}

export default AddBlossomServer;
