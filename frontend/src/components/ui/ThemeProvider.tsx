"use client";
import { createContext, useContext } from "react";

interface ThemeCtx { theme: "light"; toggle: () => void; }

const Ctx = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={{ theme: "light", toggle: () => {} }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
