import React, { useEffect } from "react";

export default function YMARedirection() {
  useEffect(() => {
    if (
      window.navigator.userAgent.toLocaleLowerCase().indexOf("iphone") !== -1 ||
      window.navigator.userAgent.toLocaleLowerCase().indexOf("ipad") !== -1 ||
      window.navigator.userAgent.toLocaleLowerCase().indexOf("mac os") !== -1
    )
      window.location.replace(
        "https://apps.apple.com/mo/app/yakihonne/id6472556189?l=en-GB"
      );
    if (
      window.navigator.userAgent.toLocaleLowerCase().indexOf("android") !== -1
    )
      window.location.replace(
        "https://play.google.com/store/apps/details?id=com.yakihonne.yakihonne&hl=en&gl=US&pli=1"
      );
    if (
      window.navigator.userAgent.toLocaleLowerCase().indexOf("windows") !== -1
    )
      window.location.replace(
        "https://apps.apple.com/mo/app/yakihonne/id6472556189?l=en-GB"
      );
  }, []);
  return null;
}
