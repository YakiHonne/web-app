import { useCallback, useEffect, useRef, useState } from "react";
import {
  AVAILABILITY_CHECKS,
  validateUsername,
} from "@/Endpoints/Account";
import { getErrorReason, getErrorStatus } from "@/Hooks/useQuotaGuard";

const DEBOUNCE_MS = 500;

export default function useNameClaim({ kind, initial = "", enabled = true }) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState("idle");
  const [reason, setReason] = useState("");
  const [isActive, setIsActive] = useState(true);

  const requestRef = useRef(0);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const reset = useCallback((next = "") => {
    setValue(next);
    setState("idle");
    setReason("");
  }, []);

  const runCheck = useCallback(
    async (current) => {
      const token = ++requestRef.current;

      if (!current) {
        setState("idle");
        setReason("");
        return;
      }

      const invalid = validateUsername(current);
      if (invalid) {
        setState("invalid");
        setReason(invalid);
        return;
      }

      setState("checking");
      setReason("");

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await AVAILABILITY_CHECKS[kind](current, {
          signal: controller.signal,
        });
        if (token !== requestRef.current || controller.signal.aborted) return;

        if (data?.available) {
          setState("available");
          setReason("");
          return;
        }
        if (data?.owned) {
          setState("owned");
          setReason(data?.reason || "");
          setIsActive(data?.is_active !== false);
          return;
        }
        setState("taken");
        setReason(data?.reason || "");
      } catch (err) {
        if (controller.signal.aborted) return;
        if (token !== requestRef.current) return;
        if (getErrorStatus(err) === 403 && getErrorReason(err) === "trial") {
          setState("trial");
          return;
        }
        setState("error");
        setReason("");
      }
    },
    [kind],
  );

  useEffect(() => {
    if (!enabled) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runCheck(value), DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [value, runCheck, enabled]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onChange = useCallback((raw) => {
    setValue((raw || "").toLowerCase().replace(/\s+/g, ""));
  }, []);

  return {
    value,
    state,
    reason,
    isActive,
    onChange,
    reset,
    claimable: state === "available" || (state === "owned" && !isActive),
  };
}
