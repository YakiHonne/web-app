import React from "react";

export default function NumberShrink({ value }) {
  var SI_SYMBOL = ["", "k", "M", "B", "T"];
  const abbreviateNumber = (value) => {
    var tier = (Math.log10(Math.abs(value)) / 3) | 0;

    if (tier == 0) return value;

    var suffix = SI_SYMBOL[tier];
    var scale = Math.pow(10, tier * 3);
    var scaled = value / scale;
    return scaled.toFixed(1) + suffix;
  };
  return <>{abbreviateNumber(value)}</>;
}
