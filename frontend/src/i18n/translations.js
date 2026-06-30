import en from "./en.json";
import hi from "./hi.json";

export const translations = { en, hi };
export const supportedLanguages = ["en", "hi"];
export const defaultLanguage = "en";

export function getInitialLanguage() {
  if (typeof window === "undefined") return defaultLanguage;
  const stored = window.localStorage.getItem("rozgaarai-language");
  return supportedLanguages.includes(stored) ? stored : defaultLanguage;
}

export function translateOption(map, value, lang) {
  return translations[lang]?.[map]?.[value] || value;
}
