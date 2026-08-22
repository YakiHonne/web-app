import { useSelector } from "react-redux";

export const getAccessFromStatus = (status) => {
  const plan = status?.plan || "free";
  const active = !!status?.active;
  const inTrial = !!status?.in_trial;
  const isPaid = ["basic", "premium"].includes(plan) && active;

  const wallets = Array.isArray(status?.wallets) ? status.wallets : [];
  const nip05 = status?.nip05 || null;

  return {
    plan,
    active,
    inTrial,
    trialUsed: !!status?.trial_used,
    username: status?.username || "",
    hasUsername: !!status?.username,
    onboarded: !!status?.onboarded,
    wallets,
    walletAddress: wallets[0] || "",
    hasWallet: wallets.length > 0,
    nip05,
    nip05Name: nip05?.name || "",
    hasNip05: !!nip05?.name && !!nip05?.is_active,
    isFree: !isPaid,
    isBasic: plan === "basic" && active && !inTrial,
    isPremium: plan === "premium" && active,
    isPaid,
    canUseAI: isPaid,
  };
};

export default function useAccess() {
  const status = useSelector((state) => state.subscription?.status);
  return getAccessFromStatus(status);
}
