const translationServices = [
  {
    display_name: "DeepL",
    value: "dl",
  },
  {
    display_name: "LibreTranslate",
    value: "lt",
  },
  {
    display_name: "Nostr.wine",
    value: "nw",
  },
];
const translationServicesEndpoints = {
  dl: {
    free: "https://api-free.deepl.com/v2/translate",
    pro: "https://api.deepl.com/v2/translate",
    plans: true,
    url: "https://deepl.com",
  },
  lt: {
    free: "https://translator.yakihonne.com/translate",
    pro: "https://libretranslate.com/translate",
    plans: true,
    url: "https://libretranslate.com",
  },
  nw: {
    free: "",
    pro: "https://translate.nostr.wine/translate",
    plans: false,
    url: "https://nostr.wine/",
  },
};

export { translationServices, translationServicesEndpoints };
