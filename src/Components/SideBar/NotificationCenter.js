import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import { setToast } from "@/Store/Slides/Publishers";
import { SidebarNavItem } from "./SidebarNavItem";
import useNotifications from "@/Hooks/useNotifications";

export default function NotificationCenter({
  icon = false,
  mobile = false,
  dismiss = false,
  isCurrent = false,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { newNotifications } = useNotifications();

  useEffect(() => {
    if (newNotifications.length > 0) {
      const createdAt = newNotifications[0].created_at;
      const current = Math.floor(Date.now() / 1000);
      if (current - createdAt < 10) {
        dispatch(
          setToast({
            type: 1,
            desc: t("AtbtAF9"),
          }),
        );
      }
    }
  }, [newNotifications]);

  return (
    <SidebarNavItem
      className={
        icon
          ? "round-icon"
          : `pointer fit-container fx-scattered  box-pad-h-s box-pad-v-s  ${
              isCurrent ? "active-link" : "inactive-link"
            }`
      }
      style={{ position: "relative" }}
      onClick={() => {
        customHistory("/notifications");
        dismiss && dismiss();
      }}
    >
      <div className="fx-centered">
        {!isCurrent && <div className="ringbell-24"></div>}
        {isCurrent && <div className="ringbell-bold-24"></div>}
        {!icon && (
          <div className={`link-label ${mobile ? "p-big" : ""}`}>
            {t("ASSFfFZ")}
          </div>
        )}
      </div>
      {newNotifications.length !== 0 && (
        <div
          className="fx-centered p-bold link-label"
          style={{
            minWidth: "30px",
            minHeight: "30px",
            borderRadius: "50%",
            backgroundColor: "var(--c1)",
            fontSize: "14px",
          }}
        >
          {newNotifications.length > 99
            ? `+99`
            : newNotifications.length >= 10
              ? `${newNotifications.length}`
              : `0${newNotifications.length}`}
        </div>
      )}
    </SidebarNavItem>
  );
}
