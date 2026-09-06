import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setToast } from "@/Store/Slides/Publishers";
import { openUpgradeSheet } from "@/Store/Slides/Upgrade";
import { openYakiConnectPrompt } from "@/Store/Slides/YakiChest";
import useAccess from "@/Hooks/useAccess";
import { hasSigner } from "@/Hooks/useYakiGuard";

export const getErrorReason = (err) =>
  err?.reason ||
  err?.response?.data?.reason ||
  err?.data?.reason ||
  null;

export const getErrorStatus = (err) =>
  err?.status || err?.response?.status || null;

export default function useQuotaGuard() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isPremium } = useAccess();
  const userKeys = useSelector((state) => state.userKeys);

  const handleAccessError = useCallback(
    (err, context) => {
      const status = getErrorStatus(err);
      const reason = getErrorReason(err);

      if (status === 401) {
        if (!hasSigner(userKeys)) {
          dispatch(setToast({ type: 2, desc: t("AIgTTfv") }));
          return true;
        }
        dispatch(openYakiConnectPrompt());
        return true;
      }

      if (status !== 403 && status !== 429) return false;

      if (isPremium && reason === "quota_exceeded") {
        dispatch(
          setToast({
            type: 2,
            desc:
              err?.response?.data?.message || err?.message || t("Alec9a8"),
          }),
        );
        return true;
      }

      dispatch(openUpgradeSheet({ context, reason }));
      return true;
    },
    [dispatch, isPremium, t, userKeys],
  );

  const handleTranslateError = useCallback(
    (res) => {
      if ([401, 403, 429].includes(res?.status)) {
        handleAccessError(
          { status: res.status, reason: res.reason, message: res.res },
          "translation",
        );
        return true;
      }
      dispatch(
        setToast({
          type: 2,
          desc: typeof res?.res === "string" && res.res ? res.res : t("AZ5VQXL"),
        }),
      );
      return true;
    },
    [dispatch, handleAccessError, t],
  );

  return { handleAccessError, handleTranslateError };
}
