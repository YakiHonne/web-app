import { nip19 } from "nostr-tools";

export const MAX_PARAM_LENGTH = 1000;

export function safeDecode(param) {
  if (typeof param !== "string" || !param) return null;
  if (param.length > MAX_PARAM_LENGTH) return null;
  try {
    return nip19.decode(param);
  } catch {
    return null;
  }
}
