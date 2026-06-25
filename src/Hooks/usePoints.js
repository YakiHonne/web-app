import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "@/Helpers/HTTP_Client";
import { setToast } from "@/Store/Slides/Publishers";
import { updateYakiChestStats } from "@/Helpers/Controlers";
import {
  getPointsConfig,
  getSubscriptionEligibility,
  redeemSubscriptionWithPoints,
} from "@/Endpoints/Points";

export default function usePoints() {
  const dispatch = useDispatch();
  const [config, setConfig] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [redeemingPlan, setRedeemingPlan] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await getPointsConfig();
      setConfig(data);
    } catch {
      setConfig(null);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/api/v1/yaki-chest/stats");
      updateYakiChestStats(data.user_stats);
    } catch {}
  }, []);

  const fetchEligibility = useCallback(async () => {
    setLoadingEligibility(true);
    try {
      const data = await getSubscriptionEligibility();
      setEligibility(data?.eligibility || null);
    } catch {
      setEligibility(null);
    } finally {
      setLoadingEligibility(false);
    }
  }, []);

  const redeemSubscription = useCallback(async (plan, onSuccess) => {
    setRedeemingPlan(plan);
    try {
      await redeemSubscriptionWithPoints({ plan });
      dispatch(setToast({ type: 1, desc: "Subscription redeemed with points." }));
      await refreshBalance();
      await fetchEligibility();
      if (onSuccess) await onSuccess();
    } catch (e) {
      dispatch(setToast({ type: 2, desc: e?.response?.data?.message || "Failed to redeem subscription." }));
    } finally {
      setRedeemingPlan(null);
    }
  }, [dispatch, refreshBalance, fetchEligibility]);

  return {
    config,
    fetchConfig,
    eligibility,
    loadingEligibility,
    fetchEligibility,
    redeemingPlan,
    redeemSubscription,
    refreshBalance,
  };
}
