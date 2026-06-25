import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { getRedeemCodes, requestRedeemCode, redeemCode } from "@/Endpoints/Points";

export default function useRedeemCodes() {
  const dispatch = useDispatch();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getRedeemCodes();
      setCodes(data.codes || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestCode = useCallback(async (onSuccess) => {
    setRequesting(true);
    try {
      await requestRedeemCode();
      dispatch(setToast({ type: 1, desc: "Code requested successfully." }));
      await fetch();
      if (onSuccess) await onSuccess();
    } catch (e) {
      dispatch(setToast({ type: 2, desc: e?.response?.data?.message || "Failed to request a code." }));
    } finally {
      setRequesting(false);
    }
  }, [dispatch, fetch]);

  const redeem = useCallback(async ({ code, lightning_address }, onSuccess) => {
    setRedeeming(true);
    try {
      await redeemCode({ code, lightning_address });
      dispatch(setToast({ type: 1, desc: "Code redeemed successfully." }));
      await fetch();
      if (onSuccess) await onSuccess();
      return true;
    } catch (e) {
      dispatch(setToast({ type: 2, desc: e?.response?.data?.message || "Failed to redeem code." }));
      return false;
    } finally {
      setRedeeming(false);
    }
  }, [dispatch, fetch]);

  return { codes, loading, error, fetch, requesting, requestCode, redeeming, redeem };
}
