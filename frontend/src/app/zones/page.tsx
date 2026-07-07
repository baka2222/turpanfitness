import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CTASection from "@/components/sections/CTASection";
import { api } from "@/lib/api";
import { getLang } from "@/lib/getLang";
import { getTranslations } from "@/lib/translations";
import { stripHtml } from "@/lib/html";
import type { Zone } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Dumbbell, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ZonesPage() {
  const lang = await getLang();
  const t = getTranslations(lang);

  let zones: Zone[] = [];
  try {
    zones = await api.zones(lang);
  } catch {
    /* empty */
  }

  return (
    <>
      <Navbar />
      <main className="relative pt-32 md:pt-44 min-h-dvh overflow-hidden" style={{ background: "var(--bg)" }}>
        {/* Фоновое свечение для вау-эффекта */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container relative mx-auto px-4 md:px-6 pb-24 md:pb-32">
          
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20 md:mb-32">
            <div className="relative group mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-purple-500 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500" />
              <span className="relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.2em] bg-[var(--bg)] border border-[var(--border)]" style={{ color: "var(--accent)" }}>
                <Sparkles size={16} />
                {t.zones_page.eyebrow}
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-balance mb-8" style={{ color: "var(--text)" }}>
              {t.zones_page.title}
            </h1>
          </div>

          {/* Zones Grid */}
          <div className="space-y-24 pb-24">
            {zones.map((zone, i) => (
              <ZoneCard key={zone.id} zone={zone} index={i} t={t} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  function ZoneCard({ zone, index, t }: { zone: Zone; index: number; t: any }) {
  const isEven = index % 2 === 0;
  
  return (
    <Link 
      href={`/zones/${zone.id}`}
      className="group block relative"
    >
      <div className={`relative flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-stretch gap-6 lg:gap-12`}>

        {/* Image Card */}
        <div className="w-full lg:w-[55%] aspect-[16/10] relative rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
          <Image 
            src={zone.cover_image_url || "/placeholder.jpg"} 
            alt={zone.name} 
            fill 
            className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s]" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)] via-transparent to-transparent opacity-60" />
        </div>

        {/* Text Card */}
        <div className={`w-full lg:w-[45%] z-10 ${isEven ? "lg:-ml-24" : "lg:-mr-24"} flex`}>
          <div className="flex-1 p-8 sm:p-10 lg:p-14 bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)] rounded-[2rem] shadow-xl group-hover:border-[var(--accent)]/50 transition-colors duration-500 flex flex-col justify-center overflow-hidden">
            <h2 className="text-4xl lg:text-3xl font-black mb-6 tracking-tight">
              {zone.name}
            </h2>
            {/* Текст обрезается до 3 строк */}
            <p className="text-lg opacity-70 mb-8 leading-relaxed line-clamp-3">
              {stripHtml(zone.description)}
            </p>
            
            <div className="flex items-center gap-4 text-[var(--accent)] font-bold">
              <span>{t.zones_page.details}</span>
              <div className="w-12 h-px bg-[var(--accent)] transition-all group-hover:w-20" />
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
}