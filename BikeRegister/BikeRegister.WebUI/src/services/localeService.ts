const defaultRegions: Record<string, string> = {
  fi: "FI",
  en: "GB",
  sv: "SE",
  de: "DE",
  fr: "FR",
  es: "ES",
};

export function getFullLocale() {
  const raw = navigator.languages?.[0] ?? navigator.language;

  if (raw.includes("-")) {
    return raw;
  }

  const lang = raw.toLowerCase();
  const region = defaultRegions[lang];

  if (region) {
    return `${lang}-${region}`;
  }

  return `${lang}-${lang.toUpperCase()}`;
}