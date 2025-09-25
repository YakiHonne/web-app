import router from "next/router";

const scrollPositions = new Map();

export function customHistory(path, preserveScroll = true) {
  if (preserveScroll) {
    scrollPositions.set(router.asPath, window.scrollY);
  }
  router.push(path).then(() => {
    if (preserveScroll) {
      const savedScroll = scrollPositions.get(path);
      if (savedScroll !== undefined) {
        setTimeout(() => window.scrollTo(0, savedScroll), 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
  });
}

export function customBack() {
  router.back();

  const handleRouteChange = () => {
    const scrollY = scrollPositions.get(router.asPath) || 0;
    setTimeout(() => window.scrollTo(0, scrollY), 0);
    router.events.off("routeChangeComplete", handleRouteChange);
  };

  router.events.on("routeChangeComplete", handleRouteChange);
}
