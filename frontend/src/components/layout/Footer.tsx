"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { SiteSettings, SocialMedia } from "@/types";

/* ── Social media icons ──────────────────────────────── */
function SocialIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case "instagram":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" strokeWidth="0" />
        </svg>
      );
    case "youtube":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
      );
    case "telegram":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.146.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.243-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
        </svg>
      );
    case "facebook":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.29 8.29 0 004.84 1.54V6.78a4.85 4.85 0 01-1.07-.09z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}

const FALLBACK_SOCIALS: { type: string; href: string; label: string }[] = [
  { type: "instagram", href: "https://instagram.com", label: "Instagram" },
  { type: "youtube", href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  const { t, lang } = useLang();
  const [socialLinks, setSocialLinks] = useState<SocialMedia[] | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    api.socialMedia(lang).then(setSocialLinks).catch(() => setSocialLinks([]));
    api.settings(lang).then(setSettings).catch(() => {});
  }, [lang]);

  const address = settings?.address ?? "нет данных";
  const hours = settings?.work_hours ?? "нет данных";
  const phone = settings?.phone ?? "нет данных";
  const sanitizedPhone = phone !== "нет данных" ? phone.replace(/[^0-9+]/g, "") : "";

  const NAV = [
    { href: "/zones", label: t.nav.about },
    { href: "/trainers", label: t.nav.trainers },
    { href: "/schedule", label: t.nav.schedule },
    { href: "/cards", label: t.nav.cards },
    { href: "/news", label: t.nav.news },
  ];

  const socials =
    socialLinks && socialLinks.length > 0
      ? socialLinks.map((s) => ({ type: s.type, href: s.url, label: s.name ?? s.type }))
      : socialLinks === null
      ? FALLBACK_SOCIALS
      : FALLBACK_SOCIALS;

  return (
    <footer
      className="mt-auto pt-6"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        transition: "background 0.35s ease",
      }}
    >
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              {settings?.logo_url && (
                <img src={settings?.logo_url} className="h-16 w-auto"></img>
              )}
            </Link>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-muted)" }}>
              {t.footer.desc}
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map(({ type, href, label }) => (
                <a
                  key={`${type}-${href}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="t-social-link w-10 h-10 rounded-full flex items-center justify-center"
                >
                  <SocialIcon type={type} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-faint)" }}>
              {t.footer.sections_label}
            </h3>
            <ul className="space-y-1">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="t-nav-link text-sm underline-accent">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-faint)" }}>
              {t.footer.contacts_label}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                <span>{address}</span>
              </li>
              <li className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Phone size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                {sanitizedPhone ? (
                  <a href={`tel:${sanitizedPhone}`} className="t-hover-text transition-colors">{phone}</a>
                ) : (
                  <span>{phone}</span>
                )}
              </li>
              <li className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Clock size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                <span>{hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            © {new Date().getFullYear()} Turpan Fitness. {t.footer.rights}
          </p>
          {/* <Link href="/privacy" className="text-xs t-hover-text transition-colors" style={{ color: "var(--text-faint)" }}>
            {t.footer.privacy}
          </Link> */}
        </div>
      </div>

      <div className="h-8 md:h-12" />
    </footer>
  );
}
