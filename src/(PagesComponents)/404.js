import React, { useEffect } from "react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import { useRouter } from "next/router";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import { customHistory } from "@/Helpers/History";

export default function FourOFour() {
  const router = useRouter();
  const { nevent } = router.query;
  useEffect(() => {
    let trimmedNEvent = nevent?.trim().replaceAll("nostr:", "");
    if (trimmedNEvent) {
      const url = getLinkFromAddr(trimmedNEvent);
      if (url !== trimmedNEvent) {
        customHistory(url);
      } else {
        customHistory("/unsupported/" + nevent);
      }
    }
  }, [nevent]);

  if (!nevent) {
    return <PagePlaceholder page={"404"} />;
  }

  return <PagePlaceholder page={"404"} />;
}
