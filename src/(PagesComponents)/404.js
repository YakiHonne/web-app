import React, { useEffect } from "react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import { useRouter } from "next/router";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import { customHistory } from "@/Helpers/History";

export default function FourOFour() {
  const router = useRouter();
  const { nevent } = router.query;
  useEffect(() => {
    if (nevent) {
      const url = getLinkFromAddr(nevent);
      if (url !== nevent) {
        customHistory(url);
      }
    }
  }, [nevent]);

  if (!nevent) {
    return <PagePlaceholder page={"404"} />;
  }

  return <PagePlaceholder page={"404"} />;
}
