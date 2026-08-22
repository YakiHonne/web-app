import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import Spinner from "@/Components/Spinner";
import ProgressBar from "@/Components/ProgressBar";
import useAccess from "@/Hooks/useAccess";
import { InitEvent } from "@/Helpers/Controlers";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { setUserBlossomServers } from "@/Store/Slides/UserData";
import { customHistory } from "@/Helpers/History";
import { YAKI_BLOSSOM, PLAN_QUOTAS, formatBytes } from "@/Content/Blossom";

export default function YakiBlossomCard({ used, isLoading }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userBlossomServers = useSelector((state) => state.userBlossomServers);
  const { plan, inTrial, isFree } = useAccess();
  const [isAdding, setIsAdding] = useState(false);

  const isListed = userBlossomServers.includes(YAKI_BLOSSOM);

  const quota = useMemo(() => {
    if (inTrial) return PLAN_QUOTAS.trial;
    if (isFree) return PLAN_QUOTAS.free;
    return PLAN_QUOTAS[plan] ?? PLAN_QUOTAS.free;
  }, [plan, inTrial, isFree]);

  const consumed = used || 0;
  const percentage = Math.min(100, (consumed / quota) * 100);
  const isFull = consumed >= quota;

  const hostname = useMemo(() => {
    try {
      return new URL(YAKI_BLOSSOM).hostname;
    } catch {
      return YAKI_BLOSSOM;
    }
  }, []);

  const handleAddToList = async () => {
    if (isAdding || isListed) return;
    setIsAdding(true);
    try {
      const updated = [...new Set([...userBlossomServers, YAKI_BLOSSOM])];
      const eventInitEx = await InitEvent(
        10063,
        "",
        updated.map((server) => ["server", server]),
      );
      if (!eventInitEx) {
        setIsAdding(false);
        return;
      }
      dispatch(setToPublish({ eventInitEx, allRelays: [] }));
      dispatch(setUserBlossomServers(updated));
    } catch (err) {
      dispatch(setToast({ type: 2, desc: t("AiJqgM8") }));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="yaki-username-border fit-container">
      <div className="yaki-username-border-spinner" />
      <div className="yaki-username-border-content">
        <div
          className="fit-container"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            padding: "22px 20px",
          }}
        >
          <div className="fit-container fx-scattered" style={{ gap: "16px" }}>
            <div
              className="fx-centered fx-start-h"
              style={{ columnGap: "10px", minWidth: 0 }}
            >
              <Icon name="crown" size={24} />
              <h4 className="p-one-line" style={{ margin: 0, fontSize: "var(--20)" }}>
                {hostname}
              </h4>
            </div>

            <div className="fx-centered" style={{ columnGap: "8px", flexShrink: 0 }}>
              {!isLoading && isFull && (
                <button
                  className="btn btn-normal btn-small"
                  onClick={() => customHistory("/subscription")}
                >
                  {t("AGo17y4")}
                </button>
              )}
              {!isLoading && !isListed && (
                <button
                  className="btn btn-gray btn-small fx-centered"
                  onClick={handleAddToList}
                  disabled={isAdding}
                >
                  {isAdding ? <Spinner size={14} /> : t("AZaUNnH")}
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <Spinner size={16} />
          ) : (
            <div
              className="fit-container"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <ProgressBar percentage={percentage} full />
              <div className="fx-centered fx-start-h" style={{ columnGap: "8px" }}>
                <span>
                  <span className="p-bold">{formatBytes(consumed)}</span>
                  <span className="gray-c">
                    {t("Am9W6Ml", { used: "", total: formatBytes(quota) })}
                  </span>
                </span>
                {isFull && (
                  <span className="sticker sticker-small sticker-red-side">
                    {t("AcMPKc8")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
