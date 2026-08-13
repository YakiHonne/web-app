import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Onboarding from "./index";
import useAccess from "@/Hooks/useAccess";

export default function OnboardingHost() {
  const userKeys = useSelector((state) => state.userKeys);
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const subscriptionLoaded = useSelector((state) => state.subscription?.loaded);
  const {
    isPaid,
    inTrial,
    trialUsed,
    onboarded,
    username,
    hasUsername,
    hasWallet,
    walletAddress,
    hasNip05,
    nip05Name,
  } = useAccess();

  const [visible, setVisible] = useState(false);
  const shownForRef = useRef(null);

  const isComplete = hasUsername && hasNip05 && hasWallet;

  useEffect(() => {
    const pub = userKeys?.pub;
    if (!pub || !isConnectedToYaki || !subscriptionLoaded) return;
    if (!isPaid || inTrial || !trialUsed) return;
    if (onboarded || isComplete) return;
    if (shownForRef.current === pub) return;

    shownForRef.current = pub;
    setVisible(true);
  }, [
    userKeys,
    isConnectedToYaki,
    subscriptionLoaded,
    isPaid,
    inTrial,
    trialUsed,
    onboarded,
    isComplete,
  ]);

  if (!visible) return null;

  return (
    <Onboarding
      pubkey={userKeys?.pub}
      username={username}
      hasUsername={hasUsername}
      hasWallet={hasWallet}
      walletAddress={walletAddress}
      hasNip05={hasNip05}
      nip05Name={nip05Name}
      onClose={() => setVisible(false)}
    />
  );
}
