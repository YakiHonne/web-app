import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function CheckNOSTRClient({ client }) {
  const nostrClients = useSelector((state) => state.nostrClients);
  const [clientData, setClientData] = useState({ name: client, url: "" });

  useEffect(() => {
    try {
      if (!client || client.split(":").length < 1) return;
      let pubkey = client.split(":")[1];
      let tempClient = nostrClients.find((item) => item.pubkey === pubkey);

      if (tempClient && tempClient.content) {
        let url = tempClient.tags.find((tag) => tag[0] === "r");
        setClientData({
          name: JSON.parse(tempClient.content)?.display_name,
          url: url ? url[1] : "",
        });
        return;
      }
      if (tempClient && !tempClient.content) {
        setClientData({
          name: pubkey?.substring(0, 10),
          url: "",
        });
        return;
      }
      setClientData({
        name: client,
        url: "",
      });
    } catch (err) {
      console.log(err);
    }
  }, [nostrClients]);

  if (!client) return <>N/A</>;
  if (client.split(":").length < 1) return client;
  return (
    <>
      {clientData.url && (
        <a
          style={{ color: "var(--orange-main)" }}
          target={"_blank"}
          href={clientData.url}
        >
          {clientData.name}
        </a>
      )}
      {!clientData.url && <>{clientData.name}</>}
    </>
  );
}
