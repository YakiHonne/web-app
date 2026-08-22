const PRIVATE_IPV4 =
  /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/;

const isLocalHostname = (hostname) => {
  if (!hostname) return true;
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "::1" || host === "0.0.0.0") return true;
  if (PRIVATE_IPV4.test(host)) return true;
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd"))
    return true;
  return false;
};

const isInsecurePageContext = () =>
  typeof window !== "undefined" && window.location?.protocol === "http:";

export const relayConnectionFilter = (relayUrl) => {
  try {
    const url = new URL(relayUrl);
    if (url.protocol !== "wss:" && url.protocol !== "ws:") return false;
    const local = isLocalHostname(url.hostname);
    if (local) return isInsecurePageContext();
    if (url.protocol === "ws:") return isInsecurePageContext();
    return true;
  } catch (err) {
    return false;
  }
};

export default relayConnectionFilter;
