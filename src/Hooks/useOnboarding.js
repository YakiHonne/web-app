import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/Helpers/HTTP_Client";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { setWallets } from "@/Store/Slides/UserData";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { downloadAsFile } from "@/Helpers/Encryptions";
import { useTranslation } from "react-i18next";
import { setSubscriptionStatus } from "@/Store/Slides/Subscription";
import {
  AVAILABILITY_CHECKS,
  claimNip05,
  claimUsername,
  createWallet,
  markOnboarded,
  normalizeToUsername,
  validateUsername,
} from "@/Endpoints/Account";
import useQuotaGuard, { getErrorReason, getErrorStatus } from "@/Hooks/useQuotaGuard";
import useAccess from "@/Hooks/useAccess";
import { openUpgradeSheet } from "@/Store/Slides/Upgrade";

const DEBOUNCE_MS = 500;

const initialField = { state: "idle", message: "" };

export default function useOnboarding({
  pubkey,
  hasUsername,
  hasWallet,
  walletAddress,
  hasNip05,
  nip05Name,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { handleAccessError } = useQuotaGuard();
  const { inTrial } = useAccess();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const userRelays = useSelector((state) => state.userRelays);

  const [detached, setDetached] = useState({
    username: false,
    nip05: !!nip05Name,
    wallet: false,
  });
  const detachedRef = useRef(detached);
  detachedRef.current = detached;
  const prefill = normalizeToUsername(
    userMetadata?.display_name || userMetadata?.name || "",
  );
  const [values, setValues] = useState({
    username: prefill,
    nip05: nip05Name || prefill,
    wallet: prefill,
  });
  const [fields, setFields] = useState({
    username: initialField,
    nip05: initialField,
    wallet: initialField,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [publishConsent, setPublishConsent] = useState(true);

  const hasExistingMetadata = !!(userMetadata?.nip05 || userMetadata?.lud16);

  const requestRef = useRef(0);
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const prefilledRef = useRef(!!prefill);

  useEffect(() => {
    if (prefilledRef.current || !prefill) return;
    prefilledRef.current = true;
    setValues((prev) => {
      const next = { ...prev };
      const current = detachedRef.current;
      ["username", "nip05", "wallet"].forEach((key) => {
        if (!prev[key] && !current[key]) next[key] = prefill;
      });
      return next;
    });
  }, [prefill]);

  const targets = useMemo(() => {
    const list = [];
    if (!hasUsername) list.push("username");
    if (!hasNip05) list.push("nip05");
    if (!hasWallet) list.push("wallet");
    return list;
  }, [hasUsername, hasNip05, hasWallet]);

  const setValue = useCallback((key, raw) => {
    const value = (raw || "").toLowerCase().replace(/\s+/g, "");
    const current = detachedRef.current;
    const isDetached = !!current[key];

    setValues((prev) => {
      if (isDetached) return { ...prev, [key]: value };
      const next = { ...prev, [key]: value };
      ["username", "nip05", "wallet"].forEach((other) => {
        if (other !== key && !current[other]) next[other] = value;
      });
      return next;
    });
  }, []);

  const runChecks = useCallback(
    async (current) => {
      const token = ++requestRef.current;
      const pending = targets.filter((key) => !!current[key]);

      if (pending.length === 0) {
        setFields({
          username: initialField,
          nip05: initialField,
          wallet: initialField,
        });
        return;
      }

      setFields((prev) => {
        const next = { ...prev };
        pending.forEach((key) => {
          next[key] = { state: "checking", message: "" };
        });
        return next;
      });

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const results = await Promise.all(
        pending.map(async (key) => {
          const value = current[key];
          const invalid = validateUsername(value);
          if (invalid) return [key, { state: "invalid", reason: invalid }];

          try {
            const data = await AVAILABILITY_CHECKS[key](value, {
              signal: controller.signal,
            });
            if (data?.available) return [key, { state: "available" }];
            if (data?.owned)
              return [
                key,
                {
                  state: "owned",
                  reason: data?.reason || "",
                  isActive: data?.is_active !== false,
                },
              ];
            return [key, { state: "taken", reason: data?.reason || "" }];
          } catch (err) {
            if (controller.signal.aborted) return [key, null];
            if (getErrorStatus(err) === 403 && getErrorReason(err) === "trial") {
              return [key, { state: "trial" }];
            }
            return [key, { state: "error" }];
          }
        }),
      );

      if (token !== requestRef.current || controller.signal.aborted) return;

      const settled = results.filter(([, result]) => !!result);

      setFields((prev) => {
        const next = { ...prev };
        settled.forEach(([key, result]) => {
          next[key] = { ...result, message: "" };
        });
        return next;
      });

      const unavailable = settled
        .filter(([, result]) => result.state === "taken")
        .map(([key]) => key);

      if (unavailable.length > 0) {
        setDetached((prev) => {
          const next = { ...prev };
          unavailable.forEach((key) => {
            next[key] = true;
          });
          return next;
        });
      }
    },
    [targets],
  );

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runChecks(values), DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [values, runChecks]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const publishMetadata = useCallback(
    ({ nip05, wallet, walletAddress: createdAddress }) => {
      const nip05Address = nip05 ? `${nip05}@yakihonne.com` : "";
      const lud16Address =
        createdAddress || (wallet ? `${wallet}@wallet.yakihonne.com` : "");

      const content = { ...(userMetadata || {}) };
      if (nip05Address) content.nip05 = nip05Address;
      if (lud16Address) content.lud16 = lud16Address;

      if (
        content.nip05 === userMetadata?.nip05 &&
        content.lud16 === userMetadata?.lud16
      )
        return;

      dispatch(
        setToPublish({
          userKeys,
          kind: 0,
          content: JSON.stringify(content),
          tags: [],
          allRelays: userRelays,
        }),
      );
    },
    [dispatch, userKeys, userMetadata, userRelays],
  );

  const persistCreatedWallet = useCallback(
    (data) => {
      const toSave = [
        "Important: Store this information securely. If you lose it, recovery may not be possible. Keep it private and protected at all times",
        "---",
        `Address: ${data.lightningAddress}`,
        `NWC secret: ${data.connectionSecret}`,
      ];
      downloadAsFile(
        toSave.join("\n"),
        "text/plain",
        `${data.lightningAddress}-NWC.txt`,
        t("AIzBCBb"),
        false,
      );

      const nwcNode = {
        id: Date.now(),
        kind: 3,
        entitle: data.lightningAddress,
        active: true,
        data: data.connectionSecret,
      };

      try {
        const oldVersion = getWallets();
        if (oldVersion && oldVersion.length > 0) {
          const updated = oldVersion.map((item) => ({
            ...item,
            active: false,
          }));
          updated.push(nwcNode);
          updateWallets(updated);
        } else {
          updateWallets([nwcNode]);
        }
      } catch {
        updateWallets([nwcNode]);
      }

      dispatch(setWallets(getWallets()));
    },
    [dispatch, t],
  );

  const refreshAccount = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/api/v1/subscription-status");
      dispatch(setSubscriptionStatus(data));
      return data;
    } catch {
      return null;
    }
  }, [dispatch]);

  const canSubmit =
    targets.every((key) =>
      ["available", "owned"].includes(fields[key]?.state),
    ) && !submitting;

  const submit = useCallback(async () => {
    if (!canSubmit) return false;

    if (inTrial) {
      dispatch(openUpgradeSheet({ context: "onboarding", reason: "trial" }));
      return false;
    }

    setSubmitting(true);

    const failures = {};
    let trialBlocked = false;
    let createdWalletAddress = "";

    const attempt = async (key, fn) => {
      try {
        const result = await fn();
        if (key === "wallet" && result?.lightningAddress) {
          createdWalletAddress = result.lightningAddress;
          persistCreatedWallet(result);
        }
        return true;
      } catch (err) {
        const status = getErrorStatus(err);
        const reason = getErrorReason(err);
        if (status === 403 && reason === "trial") {
          trialBlocked = true;
          handleAccessError(err, "onboarding");
          return false;
        }
        if (status === 409 && reason === "already_set") return true;

        const message =
          err?.response?.data?.message || err?.response?.data?.error || "";

        if (status === 409) {
          failures[key] = { state: "taken", reason: message || reason || "" };
          return false;
        }
        if (handleAccessError(err, "onboarding")) return false;
        failures[key] = { state: "error", reason: message };
        return false;
      }
    };

    const isOwned = (key) => fields[key]?.state === "owned";

    if (targets.includes("username") && !isOwned("username")) {
      await attempt("username", () => claimUsername(values.username));
    }
    const nip05NeedsClaim =
      targets.includes("nip05") &&
      (!isOwned("nip05") || fields.nip05?.isActive === false);

    if (!trialBlocked && nip05NeedsClaim) {
      await attempt("nip05", () => claimNip05({ name: values.nip05, pubkey }));
    }
    if (!trialBlocked && targets.includes("wallet") && !isOwned("wallet")) {
      await attempt("wallet", () => createWallet(values.wallet));
    }

    if (Object.keys(failures).length > 0) {
      setFields((prev) => {
        const next = { ...prev };
        Object.entries(failures).forEach(([key, result]) => {
          next[key] = { ...result, message: "" };
          if (key !== "username") {
            setDetached((d) => ({ ...d, [key]: true }));
          }
        });
        return next;
      });
      setSubmitting(false);
      return false;
    }

    setSubmitting(false);

    if (trialBlocked) return false;

    if (!hasExistingMetadata || publishConsent) {
      publishMetadata({
        nip05: hasNip05 ? nip05Name : values.nip05,
        wallet: hasWallet ? walletAddress : values.wallet,
        walletAddress: createdWalletAddress,
      });
    }

    await refreshAccount();
    setDone(true);
    return true;
  }, [
    canSubmit,
    inTrial,
    dispatch,
    values,
    fields,
    targets,
    pubkey,
    hasNip05,
    nip05Name,
    hasWallet,
    walletAddress,
    hasExistingMetadata,
    publishConsent,
    persistCreatedWallet,
    publishMetadata,
    handleAccessError,
    refreshAccount,
  ]);

  const skip = useCallback(async () => {
    try {
      await markOnboarded();
    } catch {
      dispatch(setToast({ type: 3, desc: "Could not save your progress." }));
    }
    await refreshAccount();
  }, [dispatch, refreshAccount]);

  return {
    values,
    fields,
    detached,
    targets,
    hasWallet,
    walletAddress,
    setValue,
    canSubmit,
    submitting,
    done,
    hasExistingMetadata,
    publishConsent,
    setPublishConsent,
    submit,
    skip,
  };
}
