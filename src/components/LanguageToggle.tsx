"use client";

import { useLanguage } from "@/lib/i18n/context";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      aria-label={
        language === "en" ? "Switch to Hindi" : "Switch to English"
      }
      className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-colors duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
    >
      {language === "en" ? "हिंदी" : "EN"}
    </button>
  );
}
