import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setToast } from "@/Store/Slides/Publishers";
import { openYakiConnectPrompt } from "@/Store/Slides/YakiChest";
import { getErrorStatus } from "@/Hooks/useQuotaGuard";

export const hasSigner = (userKeys) =>
  userKeys && (userKeys.ext || userKeys.sec || userKeys.bunker) ? true : false;

export default function useYakiGuard() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);

  const promptConnection = useCallback(() => {
    if (!hasSigner(userKeys)) {
      dispatch(setToast({ type: 2, desc: t("AIgTTfv") }));
      return;
    }
    dispatch(openYakiConnectPrompt());
  }, [dispatch, t, userKeys]);

  const requireYakiConnection = useCallback(() => {
    if (isConnectedToYaki) return true;
    promptConnection();
    return false;
  }, [isConnectedToYaki, promptConnection]);

  const handleAuthError = useCallback(
    (err) => {
      if (getErrorStatus(err) !== 401) return false;
      promptConnection();
      return true;
    },
    [promptConnection],
  );

  return { requireYakiConnection, handleAuthError, promptConnection };
}
