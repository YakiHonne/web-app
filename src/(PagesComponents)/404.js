import React, { useEffect } from "react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import Spinner from "@/Components/Spinner";
import { useRouter } from "next/router";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import { customHistory } from "@/Helpers/History";

export default function FourOFour() {
  const router = useRouter();
  const { nevent } = router.query;
  const isRedirecting = router.isReady && !!nevent?.trim();

  useEffect(() => {
    if (!router.isReady) return;
    let trimmedNEvent = nevent?.trim().replaceAll("nostr:", "");
    if (trimmedNEvent) {
      const url = getLinkFromAddr(trimmedNEvent);
      if (url !== trimmedNEvent) {
        customHistory(url);
      } else {
        customHistory("/unsupported/" + nevent);
      }
    }
  }, [nevent, router.isReady]);

  if (!router.isReady || isRedirecting) {
    return (
      <div
        className="fx-centered fit-container"
        style={{ height: "60vh" }}
      >
        <Spinner size={32} />
      </div>
    );
  }

  return <PagePlaceholder page={"404"} />;
}
