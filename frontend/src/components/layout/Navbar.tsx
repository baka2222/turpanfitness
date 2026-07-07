"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import LeadModal from "@/components/ui/LeadModal";
import { useLang } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/types";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const pathname = usePathname();
  const { t, lang } = useLang();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    api.settings(lang).then(setSettings).catch(() => setSettings(null));
  }, [lang]);

  const LINKS = [
    { href: "/", label: t.nav.home },
    { href: "/zones", label: t.nav.about },
    { href: "/trainers", label: t.nav.trainers },
    { href: "/schedule", label: t.nav.schedule },
    { href: "/cards", label: t.nav.cards },
    { href: "/news", label: t.nav.news },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Pages that render a dark hero directly under the navbar
  const darkHero = pathname === "/" || /^\/zones\/[^/]+$/.test(pathname);
  const overDark = darkHero && !scrolled && !open;

  return (
    <>
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={
        overDark
          ? { background: "transparent" }
          : {
              background: "var(--nav-bg)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderBottom: "1px solid var(--border)",
            }
      }
    >
      <div className="container mx-auto flex items-center justify-between h-18" style={{ height: 76 }}>
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label="Turpan Fitness">
          {settings?.logo_url ? (
            <img src={settings.logo_url} style={{ height: 42, width: "auto" }} alt="Turpan Fitness" />
          ) : (
            <span className="font-display text-2xl font-semibold tracking-tight" style={{ color: overDark ? "#fff" : "var(--text)" }}>
              Turpan
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                style={{
                  color: active ? "var(--accent)" : overDark ? "rgba(255,255,255,0.78)" : "var(--text-muted)",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = overDark ? "#fff" : "var(--text)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = overDark ? "rgba(255,255,255,0.78)" : "var(--text-muted)"; }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-3">
          {settings?.phone && (
            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-2 text-sm transition-colors duration-200"
              style={{ color: overDark ? "rgba(255,255,255,0.6)" : "var(--text-faint)" }}
            >
              <Phone size={14} />
              <span>{settings.phone}</span>
            </a>
          )}

          <LanguageSwitcher />

          <button onClick={() => setLeadOpen(true)} className="btn btn-primary px-5 py-2.5 text-sm">
            {t.nav.cta}
          </button>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            className="p-2 transition-colors duration-200"
            style={{ color: overDark ? "#fff" : "var(--text)" }}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="lg:hidden px-6 pb-6 pt-2"
          style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
        >
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-4 py-3 text-base font-medium rounded-xl transition-colors"
                  style={active ? { color: "var(--accent)", background: "var(--accent-dim)" } : { color: "var(--text-muted)" }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            {settings?.phone && (
              <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2 px-4 py-3" style={{ color: "var(--text-muted)" }}>
                <Phone size={16} />
                <span>{settings.phone}</span>
              </a>
            )}
            <button onClick={() => setLeadOpen(true)} className="btn btn-primary w-full">
              {t.nav.cta}
            </button>
          </div>
        </div>
      )}
    </header>

      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} sourcePage="navbar" />
    </>
  );
}
