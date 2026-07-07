"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/translations";
import { getTranslations, type Translations } from "@/lib/translations";

const LANGS: Lang[] = ["ru", "en", "kg"];
const STORAGE_KEY = "tf-lang";
const COOKIE_KEY = "tf-lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  langs: Lang[];
}

const Ctx = createContext<LangCtx>({
  lang: "ru",
  setLang: () => {},
  t: getTranslations("ru"),
  langs: LANGS,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  const router = useRouter();

  useEffect(() => {
    let storedRaw = (localStorage.getItem(STORAGE_KEY) as string | null) ??
      (document.cookie.match(/tf-lang=([^;]+)/)?.[1] as string | null) ??
      "ru";
    if (storedRaw === "ky") storedRaw = "kg"; // normalize old value
    const stored = storedRaw as Lang;
    if (LANGS.includes(stored)) setLangState(stored);
  }, []);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      localStorage.setItem(STORAGE_KEY, l);
      // Write cookie so server components can read it
      document.cookie = `${COOKIE_KEY}=${l}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [router]
  );

  return (
    <Ctx.Provider value={{ lang, setLang, t: getTranslations(lang), langs: LANGS }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang() {
  return useContext(Ctx);
}
