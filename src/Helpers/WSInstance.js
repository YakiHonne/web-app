import { getParsedAuthor } from "./Encryptions";

const pendingRequests = new Map();

let socket = null;

function initWebSocket(url) {
  let attempts = 0;
  const maxAttempts = 5;
  function connect() {
    if (attempts >= maxAttempts) {
      console.error(
        `WebSocket failed to connect after ${maxAttempts} attempts. No more retries.`
      );
      return;
    }
    attempts++;
    const socket_ = new WebSocket(url);

    socket_.onopen = () => {
      console.log("WebSocket is connected");
      socket = socket_;
      attempts = 0;
    };

    socket_.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    socket_.onclose = () => {
      if (attempts < maxAttempts) {
        setTimeout(connect, 3000);
      } else {
        console.error(
          `WebSocket failed to connect after ${maxAttempts} attempts. No more retries.`
        );
      }
    };

    socket_.onmessage = (event) => {
      const ev = JSON.parse(event.data);
      const messageType = ev[0];
      const requestId = ev[1];
      if (messageType === "EOSE" && pendingRequests.has(requestId)) {
        const { resolve, responses } = pendingRequests.get(requestId);
        resolve(responses);
        pendingRequests.delete(requestId);
      } else {
        const response = ev[2];
        if (pendingRequests.has(requestId)) {
          const { responses } = pendingRequests.get(requestId);
          if (response) responses.push(response);
        }
      }
    };
  }

  connect();
}

if (typeof window !== "undefined") initWebSocket(process.env.NEXT_PUBLIC_CACHE_URL);

export const getMutualFollows = async (pubkey, user_pubkey) => {
  try {
    const requestId = `mutual_follows_${pubkey}_${user_pubkey}`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        { cache: ["mutual_follows", { pubkey, user_pubkey }] },
      ]),
      requestId
    );
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getUserFollowers = async (pubkey) => {
  try {
    const requestId = `user_followers_${pubkey}`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        { cache: ["user_followers", { pubkey, limit: 1000 }] },
      ]),
      requestId
    );
    if (data[0] === "error") return false;
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getUserStats = async (pubkey) => {
  try {
    const requestId = `user_profile_${pubkey}`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        { cache: ["user_profile", { pubkey }] },
      ]),
      requestId
    );

    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getPopularNotes = async (pubkey) => {
  try {
    const requestId = `user_profile_scored_content_${pubkey}`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        { cache: ["user_profile_scored_content", { pubkey, limit: 5 }] },
      ]),
      requestId
    );
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getHighlights = async (limit = 30, until = undefined) => {
  try {
    const requestId = `feed_9a500dccc084a138330a1d1b2be0d5e86394624325d25084d3eca164e7ea698a`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        {
          cache: [
            "feed",
            {
              pubkey:
                "9a500dccc084a138330a1d1b2be0d5e86394624325d25084d3eca164e7ea698a",
              limit,
              until,
            },
          ],
        },
      ]),
      requestId
    );
    return data.filter((event) => event.kind === 1);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getTrendingUsers24h = async () => {
  try {
    const requestId = `scored_users_24h`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        {
          cache: ["scored_users_24h", {}],
        },
      ]),
      requestId
    );

    return data
      .filter((event) => event.kind === 0)
      .map((user) => getParsedAuthor(user));
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getTrendingNotes1h = async () => {
  try {
    const requestId = `scored_1h`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        {
          cache: ["scored", { selector: "trending_1h" }],
        },
      ]),
      requestId
    );
    return data.filter((event) => event.kind === 1);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getNotesByTag = async (tag) => {
  try {
    const requestId = `notes_by_tag`;
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        {
          cache: ["search", { query: tag, limit: 10 }],
        },
      ]),
      requestId
    );
    return data.filter((event) => event.kind === 1);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getTrending = async (limit = 30, until = undefined) => {
  try {
    const requestId = `explore`;
    let requestOptions = until
      ? {
          timeframe: "trending",
          scope: "global",
          limit,
          until,
          created_after: Math.floor(Date.now() / 1000) - 86400,
        }
      : {
          timeframe: "trending",
          scope: "global",
          limit,
          created_after: Math.floor(Date.now() / 1000) - 86400,
        };
    const data = await requestData(
      JSON.stringify([
        "REQ",
        requestId,
        {
          cache: [
            "explore",
            {
              ...requestOptions,
            },
          ],
        },
      ]),
      requestId
    );

    let score =
      JSON.parse(data.find((event) => event.kind === 10000113).content)?.since -
      1;

    return { data: data.filter((event) => event.kind === 1), score };
  } catch (err) {
    console.log(err);
    return [];
  }
};

const requestData = (message, requestId) => {
  return new Promise((resolve, reject) => {
    const responses = [];

    pendingRequests.set(requestId, { resolve, responses });

    if (socket) {
      socket.send(message);

      socket.onerror = (error) => {
        console.log(error);
        reject(error);
      };
    }
  });
};
