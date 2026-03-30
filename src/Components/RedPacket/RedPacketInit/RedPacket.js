import React, { useState } from "react";
import Icon from "@/Components/Icon";
import useLightningWallets from "@/Hooks/useLightningWallets";
import { RedPacketWindow } from "./RedPacketWindow";

export default function RedPacket({ receipient, onSuccess }) {
  const [showWindow, setShowWindow] = useState(false);
  const { selectedWallet } = useLightningWallets();
  return (
    <>
      <Icon
        name="gift"
        size={24}
        className={selectedWallet ? "" : "if-disabled"}
        onClick={() => (selectedWallet ? setShowWindow(true) : null)}
      />
      {showWindow && (
        <RedPacketWindow
          exit={() => setShowWindow(false)}
          receipient={receipient}
          onSuccess={(data) => {
            setShowWindow(false);
            onSuccess(data);
          }}
        />
      )}
    </>
  );
}
