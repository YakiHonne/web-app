const GALLERY_D_TAG =
  /^gallery-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const CONTENT_MARKER = "Open the original article";

export const isGallerySpamEvent = (event) => {
  try {
    if (!event || event.kind !== 30023) return false;
    if (typeof event.content !== "string") return false;
    if (!event.content.includes(CONTENT_MARKER)) return false;
    if (!Array.isArray(event.tags)) return false;
    const dTag = event.tags.find((tag) => tag[0] === "d")?.[1];
    return typeof dTag === "string" && GALLERY_D_TAG.test(dTag);
  } catch (err) {
    return false;
  }
};

export default isGallerySpamEvent;
