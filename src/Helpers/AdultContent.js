const ADULT_HOSTS = [
  "pornhub.com",
  "phncdn.com",
  "xvideos.com",
  "xhamster.com",
  "xhcdn.com",
  "xnxx.com",
  "redtube.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "eporner.com",
  "erome.com",
  "motherless.com",
  "camwhores.tv",
  "x-video.tube",
  "viralxxxporn.com",
  "videosfree.duckdns.org",
  "fapello.com",
  "coomer.party",
  "coomer.su",
  "kemono.party",
  "kemono.su",
  "thothub.lol",
  "leakedzone.com",
  "nudogram.com",
  "babepedia.com",
  "celebsgirls.com",
  "pimpbunny.com",
  "epawg.com",
  "i-model.org",
  "influencersgonewild.com",
  "nudostar.com",
  "sxyprn.com",
  "onlyfans.com",
  "fansly.com",
  "manyvids.com",
  "chaturbate.com",
  "stripchat.com",
  "bongacams.com",
  "myfreecams.com",
  "cam4.com",
  "livejasmin.com",
];

const hostMatches = (hostname) => {
  const host = String(hostname).toLowerCase().replace(/^www\./, "");
  return ADULT_HOSTS.some(
    (adult) => host === adult || host.endsWith(`.${adult}`),
  );
};

const URL_PATTERN = /https?:\/\/[^\s)\]"'<>]+/g;

export const hasAdultUrls = (event) => {
  try {
    if (!event || typeof event.content !== "string") return false;
    const urls = event.content.match(URL_PATTERN);
    if (!urls) return false;
    for (const raw of urls) {
      try {
        if (hostMatches(new URL(raw).hostname)) return true;
      } catch (err) {
        continue;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const isSelfDeclaredSensitive = (event) => {
  try {
    if (!event || !Array.isArray(event.tags)) return false;
    return event.tags.some(
      (tag) =>
        tag[0] === "content-warning" ||
        (tag[0] === "L" && tag[1] === "content-warning") ||
        (tag[0] === "l" && tag[1] === "content-warning"),
    );
  } catch (err) {
    return false;
  }
};

export default hasAdultUrls;
