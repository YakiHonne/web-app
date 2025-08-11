/**
 * Extracts the first image URL from a given string
 * @param {string} text - The text to search for image URLs
 * @returns {string|null} - The first image URL found, or null if none found
 */
export function extractFirstImage(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Common image file extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)(\?[^\s]*)?/i;
  
  // Regex patterns to match different types of image URLs
  const patterns = [
    // Direct HTTP/HTTPS image URLs
    /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)(\?[^\s<>"']*)?/gi,
    
    // URLs that might be images (with image extensions in query params or paths)
    /https?:\/\/[^\s<>"']*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)[^\s<>"']*/gi,
    
    // Markdown image syntax: ![alt](url)
    /!\[[^\]]*\]\(([^)]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)[^)]*)\)/gi,
    
    // HTML img tag src
    /<img[^>]+src\s*=\s*["']([^"']+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)[^"']*)["'][^>]*>/gi,
    
    // Generic URLs that might contain images (broader match)
    /https?:\/\/[^\s<>"']+/gi
  ];

  // Try each pattern in order of specificity
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        let url = match;
        
        // Extract URL from markdown syntax
        if (match.startsWith('![')) {
          const markdownMatch = match.match(/!\[[^\]]*\]\(([^)]+)\)/);
          if (markdownMatch) {
            url = markdownMatch[1];
          }
        }
        
        // Extract URL from HTML img tag
        if (match.includes('<img')) {
          const imgMatch = match.match(/src\s*=\s*["']([^"']+)["']/i);
          if (imgMatch) {
            url = imgMatch[1];
          }
        }
        
        // Clean up the URL
        url = url.trim();
        
        // Validate that it's a proper URL and likely an image
        if (isValidImageUrl(url)) {
          return url;
        }
      }
    }
  }

  return null;
}

/**
 * Validates if a URL is likely to be an image
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is likely an image
 */
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Must start with http or https
  if (!url.match(/^https?:\/\//i)) {
    return false;
  }

  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif)(\?[^\s]*)?$/i;
  if (url.match(imageExtensions)) {
    return true;
  }

  // Check for common image hosting domains
  const imageHosts = [
    'imgur.com',
    'i.imgur.com',
    'cdn.discordapp.com',
    'media.discordapp.net',
    'pbs.twimg.com',
    'abs.twimg.com',
    'ton.twimg.com',
    'github.com',
    'githubusercontent.com',
    'googleusercontent.com',
    'cloudinary.com',
    'amazonaws.com',
    'cloudfront.net',
    'unsplash.com',
    'pixabay.com',
    'pexels.com'
  ];

  const hostname = new URL(url).hostname.toLowerCase();
  if (imageHosts.some(host => hostname.includes(host))) {
    return true;
  }

  // Check if URL contains image-related keywords
  const imageKeywords = ['image', 'img', 'photo', 'picture', 'pic', 'avatar', 'thumbnail', 'media'];
  if (imageKeywords.some(keyword => url.toLowerCase().includes(keyword))) {
    return true;
  }

  return false;
}

export default extractFirstImage;
