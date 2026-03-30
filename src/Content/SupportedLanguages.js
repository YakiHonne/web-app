import Icon from "@/Components/Icon";

const supportedLanguageKeys = [
  "en",
  "zh",
  "fr",
  "es",
  "it",
  "pt",
  "th",
  "ja",
  "ar",
  "ru",
  "hi",
];
const supportedLanguage = [
  {
    display_name: "English",
    value: "en",
    left_el: <Icon name="flag-en" isColored />,
    disabled: false,
  },
  {
    display_name: "中文",
    value: "zh",
    left_el: <Icon name="flag-zh" isColored />,
    disabled: false,
  },
  {
    display_name: "العربية",
    value: "ar",
    left_el: <Icon name="flag-ar" isColored />,
    disabled: false,
  },
  {
    display_name: "Español",
    value: "es",
    left_el: <Icon name="flag-es" isColored />,
    disabled: false,
  },
  {
    display_name: "Português",
    value: "pt",
    left_el: <Icon name="flag-pt" isColored />,
    disabled: false,
  },
  {
    display_name: "Italiano",
    value: "it",
    left_el: <Icon name="flag-it" isColored />,
    disabled: false,
  },
  {
    display_name: "Français",
    value: "fr",
    left_el: <Icon name="flag-fr" isColored />,
    disabled: false,
  },
  {
    display_name: "ไทย",
    value: "th",
    left_el: <Icon name="flag-th" isColored />,
    disabled: false,
  },
  {
    display_name: "日本語",
    value: "ja",
    left_el: <Icon name="flag-ja" isColored />,
    disabled: false,
  },
  {
    display_name: "भारतीय",
    value: "hi",
    left_el: <Icon name="flag-hi" isColored />,
    disabled: false,
  },
  {
    display_name: "Русский",
    value: "ru",
    left_el: <Icon name="flag-ru" isColored />,
    disabled: false,
  },
];
export { supportedLanguage, supportedLanguageKeys };
