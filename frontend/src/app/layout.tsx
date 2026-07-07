import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Turpan Fitness — Фитнес-клуб бизнес-класса",
  description:
    "Премиальный фитнес-клуб Turpan Fitness: тренажёрный зал, бассейн 25м, групповые программы, профессиональные тренеры. Оборудование Technogym.",
  openGraph: {
    title: "Turpan Fitness",
    description: "Премиальный фитнес-клуб бизнес-класса",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh flex flex-col antialiased" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <ThemeProvider>
          <LanguageProvider>
            {/* overflow-x clip at wrapper level — required for iOS Safari where html/body overflow-x:hidden is ignored */}
            <div style={{ overflowX: "clip", maxWidth: "100%" }}>
              {children}
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
