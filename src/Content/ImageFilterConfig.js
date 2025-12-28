export const IMAGE_FILTERS = {
  none: "none",
  warmGlow: "brightness(1.05) contrast(1.05) saturate(1.15) sepia(0.1)",
  coolFade: "brightness(1.05) contrast(0.95) saturate(0.9) hue-rotate(190deg)",
  vintage: "sepia(0.35) contrast(0.9) saturate(0.85)",
  vividPop: "contrast(1.25) saturate(1.5)",
  matte: "contrast(0.85) brightness(1.05) saturate(0.9)",
  sunset: "brightness(1.1) saturate(1.3) sepia(0.2)",
  noir: "grayscale(1) contrast(1.2)",
  softSkin: "brightness(1.05) contrast(0.95) saturate(0.85)",
  filmGrain: "contrast(1.1) brightness(0.98) saturate(0.9)",
};

export const imageFiltersList = [
  {
    display_name: "Original",
    value: "none",
  },
  {
    display_name: "Warm Glow",
    value: "warmGlow",
  },
  {
    display_name: "Cool Fade",
    value: "coolFade",
  },
  {
    display_name: "Vintage",
    value: "vintage",
  },
  {
    display_name: "Vivid Pop",
    value: "vividPop",
  },
  {
    display_name: "Matte",
    value: "matte",
  },
  {
    display_name: "Sunset",
    value: "sunset",
  },
  {
    display_name: "Noir",
    value: "noir",
  },
  {
    display_name: "Soft Skin",
    value: "softSkin",
  },
  {
    display_name: "Film Grain",
    value: "filmGrain",
  },
];
