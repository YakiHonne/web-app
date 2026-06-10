import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import {
  getSubscriptionStatus,
  cancelSubscription,
  resumeSubscription,
  changeSubscriptionPlan,
  cancelPendingChange,
} from "@/Endpoints/Subscription";

export default function useSubscription() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [changingPlan, setChangingPlan] = useState(null);
  const [cancellingChange, setCancellingChange] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getSubscriptionStatus();
      setStatus(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      dispatch(setToast({ type: 1, desc: "Subscription will end at the current period." }));
      await fetch();
    } catch (e) {
      dispatch(setToast({ type: 2, desc: e?.response?.data?.message || "Failed to cancel subscription." }));
    } finally {
      setCancelling(false);
    }
  }, [fetch, dispatch]);

  const resume = useCallback(async () => {
    setResuming(true);
    try {
      await resumeSubscription();
      dispatch(setToast({ type: 1, desc: "Subscription resumed successfully." }));
      await fetch();
    } catch (e) {
      dispatch(setToast({ type: 2, desc: e?.response?.data?.message || "Failed to resume subscription." }));
    } finally {
      setResuming(false);
    }
  }, [fetch, dispatch]);

  const changePlan = useCallback(async ({ new_plan, new_price_id }) => {
    setChangingPlan(new_plan);
    try {
      await changeSubscriptionPlan({ new_plan, new_price_id });
      dispatch(setToast({ type: 1, desc: "Plan change scheduled for next cycle." }));
      await fetch();
    } catch (e) {
      dispatch(setToast({ type: 2, desc: e?.response?.data?.message || "Failed to schedule plan change." }));
    } finally {
      setChangingPlan(null);
    }
  }, [fetch, dispatch]);

  const cancelChange = useCallback(async () => {
    setCancellingChange(true);
    try {
      await cancelPendingChange();
      dispatch(setToast({ type: 1, desc: "Pending plan change cancelled." }));
      await fetch();
    } catch (e) {
      dispatch(setToast({ type: 2, desc: e?.response?.data?.message || "Failed to cancel pending change." }));
    } finally {
      setCancellingChange(false);
    }
  }, [fetch, dispatch]);

  return {
    status,
    loading,
    error,
    fetch,
    cancel,
    cancelling,
    resume,
    resuming,
    changePlan,
    changingPlan,
    cancelChange,
    cancellingChange,
  };
}
