"use client";
import { useState, useEffect } from "react";
import LeadModal from "@/components/ui/LeadModal";
import { MessageCircle, Phone, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/types";

export default function CTASection() {
  const [modalOpen, setModalOpen] = useState(false);
  const { t, lang } = useLang();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    api.settings(lang).then(setSettings).catch(() => {});
  }, [lang]);

  const waMessage = settings?.whatsapp_default_message ?? "";
  const waPhone = settings?.whatsapp_phone ?? "";
  const waHref = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}` : null;
  const workHours = settings?.work_hours ?? "";

  return (
    <section className="section-sm" style={{ background: "var(--bg-alt)" }}>
      <div className="container mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden surface-dark">
          {/* single restrained glow */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 rounded-full blur-[150px] pointer-events-none"
            style={{ background: "rgba(220,38,38,0.18)", width: "min(680px, 92vw)", height: "min(420px, 65vw)" }}
          />
          <div className="absolute top-0 inset-x-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.6), transparent)" }} />

          <div className="relative px-7 py-16 md:px-16 md:py-24 text-center">
            <span className="eyebrow eyebrow--center mb-6">{t.cta.tag}</span>

            <h2 className="display-2 text-balance text-white max-w-3xl mx-auto mt-5">
              {t.cta.title1} <span style={{ background: "linear-gradient(120deg,#fff 30%,#ef4444 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{t.cta.title2}</span>
            </h2>

            <p className="max-w-lg mx-auto mt-6 mb-10 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t.cta.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button onClick={() => setModalOpen(true)} className="btn btn-primary">
                {t.cta.primary}
                <ArrowRight size={17} />
              </button>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-on-dark">
                  <MessageCircle size={17} />
                  {t.cta.wa}
                </a>
              )}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {settings?.phone && (
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2 transition-colors hover:text-white">
                  <Phone size={14} className="text-[#ef4444]" />
                  {settings.phone}
                </a>
              )}
              {settings?.phone && workHours && <span className="hidden sm:block w-px h-4" style={{ background: "rgba(255,255,255,0.18)" }} />}
              {workHours && <span>{workHours}</span>}
            </div>
          </div>
        </div>
      </div>

      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} sourcePage="cta" preTitle={t.cta.primary} />
    </section>
  );
}
