"use client";
import { useLang } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/translations";

const LABELS: Record<Lang, string> = { ru: "RU", en: "EN", kg: "KG" };

export default function LanguageSwitcher() {
  const { lang, setLang, langs } = useLang();

  return (
    <div
      className="flex items-center rounded-full p-0.5 gap-px"
      style={{ border: "1px solid var(--border)", background: "var(--surface-el)" }}
    >
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150"
          style={
            lang === l
              ? {
                  background: "var(--accent)",
                  color: "#fff",
                }
              : {
                  color: "var(--text-faint)",
                  background: "transparent",
                }
          }
          aria-pressed={lang === l}
          aria-label={`Switch language to ${l}`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
