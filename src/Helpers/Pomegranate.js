import { finalizeEvent } from "nostr-tools";
import { argon2id } from "@noble/hashes/argon2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import {
  trustedKeyDeal,
  hexShard,
  hexPubShard,
} from "@fiatjaf/promenade-trusted-dealer";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { POMEGRANATE_CONFIG_KIND } from "@/Content/pomegrenate";

export const massageURL = (input) => {
  let url = input.trim();
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }
  return new URL(url).origin;
};

export const isValidServerURL = (input) => {
  try {
    massageURL(input);
    return true;
  } catch {
    return false;
  }
};

export const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export const openPopup = (url, name) => {
  const width = 600;
  const height = 700;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
  return window.open(
    url,
    name,
    `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
  );
};

export const awaitPopupMessage = (popup, expectedOrigin, extract) => {
  return new Promise((resolve, reject) => {
    const POPUP_TIMEOUT_MS = 5 * 60 * 1000;

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearInterval(closeMonitor);
      clearTimeout(timer);
    };

    const onMessage = (event) => {
      if (event.origin !== expectedOrigin || event.source !== popup) return;
      const value = extract(event.data);
      if (value === undefined) return;
      cleanup();
      popup.close();
      resolve(value);
    };

    const closeMonitor = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("POPUP_CLOSED"));
      }
    }, 300);

    const timer = setTimeout(() => {
      cleanup();
      popup.close();
      reject(new Error("Timed out waiting for Google sign-in"));
    }, POPUP_TIMEOUT_MS);

    window.addEventListener("message", onMessage);
  });
};

export const authenticateWithGoogle = async (central) => {
  const popup = openPopup(`${central}/login/google`, "PomegranateLogin");
  if (!popup) throw new Error("POPUP_BLOCKED");

  const raw = await awaitPopupMessage(popup, central, (data) => {
    if (data && typeof data === "object" && typeof data.token === "string") {
      return data.token;
    }
    return undefined;
  });

  let createdAt = null;
  let email = "";
  const parsed = JSON.parse(atob(raw));
  if (typeof parsed.created_at === "number")
    createdAt = parsed.created_at * 1000;
  if (Array.isArray(parsed.tags)) {
    const emailTag = parsed.tags.find(
      (tag) => Array.isArray(tag) && tag[0] === "email",
    );
    email = emailTag?.[1] ?? "";
  }
  if (!createdAt || Date.now() - createdAt > 24 * 60 * 60 * 1000) {
    throw new Error("Google sign-in token expired");
  }
  return { raw, email, createdAt };
};

export const getAccount = async (central, token) => {
  const res = await fetch(`${central}/account`, {
    headers: { Authorization: `Token ${token.raw}` },
  });
  if (res.status === 401)
    throw new Error("Google session expired, please sign in again");
  if (!res.ok) return null;
  const data = await res.json();
  return data?.pubkey ? data : null;
};

export const listProfiles = async (central, token) => {
  const res = await fetch(`${central}/profiles`, {
    headers: { Authorization: `Token ${token.raw}` },
  });
  if (!res.ok) throw new Error("Failed to load signing profiles");
  return await res.json();
};

export const createProfile = async (central, token, name) => {
  const res = await fetch(`${central}/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token.raw}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Signing profile creation failed");
  return await res.json();
};

export const getBunkerUrl = (central, profile) => {
  const relay = central.replace(/^http/, "ws");
  return `bunker://${profile.handler_pubkey}?relay=${encodeURIComponent(relay)}`;
};

export const resolveDefaultBunker = async (central, token) => {
  let profiles = await listProfiles(central, token);
  if (!profiles.find((p) => p.name === "default")) {
    await createProfile(central, token, "default");
    profiles = await listProfiles(central, token);
  }
  const profile = profiles.find((p) => p.name === "default") || profiles[0];
  if (!profile) throw new Error("No signing profile available");
  return getBunkerUrl(central, profile);
};

export const hashEmailForDiscovery = (email) =>
  bytesToHex(
    argon2id(email.trim().toLowerCase(), "pomegranate", {
      t: 1,
      m: 65536,
      p: 4,
      dkLen: 32,
    }),
  );

export const findAllExistingSetups = async (email) => {
  try {
    const m = hashEmailForDiscovery(email);
    const events = await ndkInstance.fetchEvents(
      {
        kinds: [POMEGRANATE_CONFIG_KIND],
        "#m": [m],
      },
      { closeOnEose: true, groupable: false },
    );
    const sorted = [...events].sort((a, b) => b.created_at - a.created_at);
    const setups = [];
    for (const found of sorted) {
      const central = found.tags.find((tag) => tag[0] === "central")?.[1];
      if (!central) continue;
      const massaged = massageURL(central);
      if (setups.some((setup) => setup.central === massaged)) continue;
      const operators = found.tags
        .filter((tag) => tag[0] === "operator" && tag[1])
        .map((tag) => tag[1]);
      const threshold = Number(
        found.tags.find((tag) => tag[0] === "threshold")?.[1],
      );
      setups.push({
        pubkey: found.pubkey,
        central: massaged,
        operators,
        threshold: Number.isFinite(threshold) ? threshold : null,
        created_at: found.created_at,
      });
    }
    return setups;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const findExistingSetup = async (email) => {
  const setups = await findAllExistingSetups(email);
  return setups[0] || null;
};

export const findSetupOnOtherCentral = async (email, targetCentral) => {
  const setups = await findAllExistingSetups(email);
  const target = targetCentral ? massageURL(targetCentral) : "";
  return setups.find((setup) => setup.central !== target) || null;
};

export const publishConfigEvent = async ({
  email,
  central,
  operators,
  threshold,
  secretKey,
}) => {
  try {
    const event = finalizeEvent(
      {
        kind: POMEGRANATE_CONFIG_KIND,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["m", hashEmailForDiscovery(email)],
          ["central", central],
          ...operators.map((operator) => ["operator", operator]),
          ["threshold", String(threshold)],
        ],
        content: "",
      },
      secretKey,
    );
    const ndkEvent = new NDKEvent(ndkInstance, event);
    await ndkEvent.publish();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const createPomegranateAccount = async (
  central,
  token,
  operators,
  threshold,
  secretKey,
) => {
  const session = crypto.randomUUID();
  const masterSk = BigInt("0x" + bytesToHex(secretKey));
  const { shards } = trustedKeyDeal(masterSk, threshold, operators.length);

  const regEvent = finalizeEvent(
    {
      kind: 20445,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["threshold", String(threshold)],
        ...operators.map((op, i) => [
          "operator",
          op,
          hexPubShard(shards[i].pubShard),
        ]),
      ],
      content: "",
    },
    secretKey,
  );

  const regRes = await fetch(`${central}/register`, {
    method: "POST",
    body: JSON.stringify(regEvent),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token.raw}`,
      "X-Pomegranate-Session": session,
    },
  });
  if (!regRes.ok) throw new Error("Central server registration failed");

  const utf8 = new TextEncoder();
  const results = await Promise.all(
    operators.map(async (operator, i) => {
      const event = finalizeEvent(
        {
          kind: 20444,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["central", central],
            ["email", token.email],
          ],
          content: hexShard(shards[i]),
        },
        secretKey,
      );
      const opToken = bytesToHex(sha256(utf8.encode(`${session}:${operator}`)));
      try {
        const res = await fetch(`${operator}/po/register`, {
          method: "POST",
          body: JSON.stringify(event),
          headers: {
            "Content-Type": "application/json",
            "X-Pomegranate-Operator-Token": opToken,
          },
        });
        return res.ok ? null : operator;
      } catch {
        return operator;
      }
    }),
  );

  const failed = results.filter(Boolean);
  if (operators.length - failed.length < threshold) {
    throw new Error(
      `Could not register with enough operators (${operators.length - failed.length}/${threshold}). Please try again.`,
    );
  }
};

export const deleteAccount = async (central, token) => {
  try {
    const res = await fetch(`${central}/account`, {
      method: "DELETE",
      headers: { Authorization: `Token ${token.raw}` },
    });
    return res.ok;
  } catch {
    return false;
  }
};
