export function extractFirstImage(text) {
  if (!text || typeof text !== "string") {
    return null;
  }
  const patterns = [
    /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)(\?[^\s<>"']*)?/gi,
    /https?:\/\/[^\s<>"']*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)[^\s<>"']*/gi,
    /!\[[^\]]*\]\(([^)]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)[^)]*)\)/gi,
    /<img[^>]+src\s*=\s*["']([^"']+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)[^"']*)["'][^>]*>/gi,
    /https?:\/\/[^\s<>"']+/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        let url = match;

        if (match.startsWith("![")) {
          const markdownMatch = match.match(/!\[[^\]]*\]\(([^)]+)\)/);
          if (markdownMatch) {
            url = markdownMatch[1];
          }
        }

        if (match.includes("<img")) {
          const imgMatch = match.match(/src\s*=\s*["']([^"']+)["']/i);
          if (imgMatch) {
            url = imgMatch[1];
          }
        }

        url = url.trim();

        if (isValidImageUrl(url)) {
          return url;
        }
      }
    }
  }

  return null;
}

function isValidImageUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  if (!url.match(/^https?:\/\//i)) {
    return false;
  }

  const imageExtensions =
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)(\?[^\s]*)?$/i;
  if (url.match(imageExtensions)) {
    return true;
  }

  const imageHosts = [
    "imgur.com",
    "i.imgur.com",
    "cdn.discordapp.com",
    "media.discordapp.net",
    "pbs.twimg.com",
    "abs.twimg.com",
    "ton.twimg.com",
    "github.com",
    "githubusercontent.com",
    "googleusercontent.com",
    "cloudinary.com",
    "amazonaws.com",
    "cloudfront.net",
    "unsplash.com",
    "pixabay.com",
    "pexels.com",
  ];

  const hostname = new URL(url).hostname.toLowerCase();
  if (imageHosts.some((host) => hostname.includes(host))) {
    return true;
  }

  const imageKeywords = [
    "image",
    "img",
    "photo",
    "picture",
    "pic",
    "avatar",
    "thumbnail",
    "media",
  ];
  if (imageKeywords.some((keyword) => url.toLowerCase().includes(keyword))) {
    return true;
  }

  return false;
}

export default extractFirstImage;
