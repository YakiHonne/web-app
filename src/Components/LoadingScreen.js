import React from "react";
import Spinner from "@/Components/Spinner";
import Overlay from "@/Components/Overlay";

export default function LoadingScreen({ onClick = () => null }) {
  return (
    <Overlay exit={onClick}>
      <div className="fx-centered" style={{ padding: "2rem" }}>
        <Spinner size={32} />
      </div>
    </Overlay>
  );
}
