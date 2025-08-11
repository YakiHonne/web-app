import React, { useEffect, useState } from "react";
import axios from "axios";
export default function CheckNIP05({
  address = "",
  pubkey = "",
  smallSize = true,
  
}) {
  let addressParts = address.split("@");
  let [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await axios(
          `https://${addressParts[1]}/.well-known/nostr.json?name=${addressParts[0]}`
        );
        let { data } = res;
        if (data.names[addressParts[0]] == pubkey) {
          setIsChecked(true);
        }
      } catch (err) {}
    };
    fetchData();
  }, [address, pubkey]);
  if (!address) return;
  return (
    <div className="fx-centered">
      {!isChecked && (
        <div className={`gray-c ${smallSize ? "p-medium" : ""}`}>{address}</div>
      )}
      {isChecked && (
        <div className={`${smallSize ? "p-medium" : ""}`}>
          {address}
        </div>
      )}
      {isChecked && <div className="checkmark-c1"></div>}
    </div>
  );
}
