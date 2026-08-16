const OPTIONAL_CENTRAL_URL = "https://auth.yakihonne.com";
const CENTRAL_URL = "https://auth.njump.me";
const OPERATOR_URLS = [
    "https://po.jumble.social",
    "https://po.coracle.social",
    "https://po.njump.me",
    "https://po.f7z.io",
    "https://po.nostrver.se",
    "https://po.yakihonne.com"
];

// Operators pre-selected when a new account is created. The rest of
// OPERATOR_URLS stays available as suggestions in the advanced menu.
const DEFAULT_OPERATOR_URLS = [
    "https://po.yakihonne.com",
    "https://po.jumble.social",
    "https://po.njump.me",
];

const CENTRALS = [
    { url: CENTRAL_URL, kind: "default" },
    { url: OPTIONAL_CENTRAL_URL, kind: "suggested" },
];

// Kind of the discovery/configuration event published after a successful
// setup, so other clients can find which central holds this email's account.
const POMEGRANATE_CONFIG_KIND = 16440;

export {
    CENTRAL_URL,
    OPTIONAL_CENTRAL_URL,
    OPERATOR_URLS,
    DEFAULT_OPERATOR_URLS,
    CENTRALS,
    POMEGRANATE_CONFIG_KIND,
};
