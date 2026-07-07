"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, Check } from "lucide-react";
import LeadModal from "@/components/ui/LeadModal";
import { useLang } from "@/contexts/LanguageContext";
import type { SiteSettings } from "@/types";

const DumbbellCanvas = dynamic(() => import("@/components/3d/DumbbellCanvas"), {
  ssr: false,
  loading: () => null,
});

const containerAnim = (mobile: boolean) => ({
  hidden: {},
  show: { transition: { staggerChildren: mobile ? 0.05 : 0.1, delayChildren: mobile ? 0.05 : 0.1 } },
});
const riseAnim = (mobile: boolean) => ({
  hidden: { opacity: 0, y: mobile ? 12 : 26 },
  show: { opacity: 1, y: 0, transition: { duration: mobile ? 0.4 : 0.8, ease: [0.22, 0.61, 0.36, 1] as const } },
});

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export default function HeroSection({ settings }: { settings?: SiteSettings | null }) {
  const [modalOpen, setModalOpen] = useState(false);
  // Lazy init: check width immediately on client so 3D canvas never starts loading on mobile
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const { t } = useLang();
  const scrollRef = useRef(0);
  const media = settings?.hero_media_url ?? null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const container = containerAnim(isMobile);
  const rise = riseAnim(isMobile);

  const stats = [
    { value: "25", suffix: "м", label: t.hero.stat_pool },
    { value: "10", suffix: "+", label: t.hero.stat_trainers },
    { value: "30", suffix: "+", label: t.hero.stat_programs },
  ];

  return (
    <section className="relative min-h-dvh flex flex-col overflow-hidden" style={{ background: "var(--ink)" }}>
      {/* ── Base backdrop ── */}
      <div className="absolute inset-0 z-0">
        {media ? (
          isVideo(media) ? (
            <video className="absolute inset-0 h-full w-full object-cover" src={media} autoPlay muted loop playsInline />
          ) : (
            <Image src={media} alt="" fill priority sizes="100vw" className="object-cover" />
          )
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 70% 18%, #1a1112 0%, #0d0c0d 45%, var(--ink) 100%)" }}
          />
        )}
      </div>

      {/* ── Cinematic scrims ── */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, var(--ink) 3%, transparent 55%)" }} />
      <div className="absolute inset-x-0 top-0 h-32 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.65), transparent)" }} />

      {/* Red glow — clipped to section, no negative top on mobile */}
      <div
        className="absolute top-0 lg:-top-40 left-1/2 -translate-x-1/2 rounded-full blur-[120px] lg:blur-[150px] z-10 pointer-events-none"
        style={{ background: "rgba(220,38,38,0.14)", width: "min(520px, 80vw)", height: "min(520px, 80vw)" }}
      />

      {/* ── 3D dumbbell — desktop only, too heavy for mobile GPU ── */}
      {!isMobile && (
        <div className="absolute inset-0 z-[15]">
          <Suspense fallback={null}>
            <DumbbellCanvas scrollRef={scrollRef} variant="scroll" />
          </Suspense>
        </div>
      )}

      {/* ── Text-protection gradients ── */}
      <div
        className="hidden lg:block absolute inset-0 z-[18] pointer-events-none"
        style={{
          background:
            "linear-gradient(95deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.55) 34%, transparent 60%), linear-gradient(to top, var(--ink) 5%, transparent 36%)",
        }}
      />
      <div
        className="lg:hidden absolute inset-0 z-[18] pointer-events-none"
        style={{
          background:
            "radial-gradient(125% 78% at 50% 48%, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.22) 45%, transparent 74%), linear-gradient(to top, var(--ink) 6%, transparent 44%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-20 flex-1 flex items-center pt-28 pb-44 md:pb-52 pointer-events-none">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl pointer-events-auto text-center mx-auto lg:text-left lg:mx-0"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={rise} className="mb-7">
              <span className="inline-flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#ef4444" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#ef4444" }} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "rgba(255,255,255,0.62)" }}>
                  {t.hero.tag}
                </span>
              </span>
            </motion.div>

            <motion.h1 variants={rise} className="display-1 text-white text-balance mb-7">
              {t.hero.title1}{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #ffffff 18%, #ef4444 92%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t.hero.title2}
              </span>
              <br />
              {t.hero.title3}
            </motion.h1>

            <motion.p variants={rise} className="text-base md:text-lg leading-relaxed mb-9 max-w-xl mx-auto lg:mx-0" style={{ color: "rgba(255,255,255,0.66)" }}>
              {settings?.hero_slogan}
            </motion.p>

            <motion.div variants={rise} className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-10">
              <button onClick={() => setModalOpen(true)} className="btn btn-primary">
                {t.hero.cta_primary}
                <ArrowRight size={17} />
              </button>
              <button onClick={() => setModalOpen(true)} className="btn btn-on-dark">
                {t.hero.cta_secondary}
              </button>
            </motion.div>

            <motion.div variants={rise} className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2.5">
              {[t.hero.trust_1, t.hero.trust_2, t.hero.trust_3].map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.66)" }}>
                  <span className="flex items-center justify-center w-4 h-4 rounded-full" style={{ background: "rgba(220,38,38,0.22)" }}>
                    <Check size={10} className="text-[#ef4444]" />
                  </span>
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom stat rail ── */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isMobile ? 0.3 : 0.7, duration: isMobile ? 0.4 : 0.8, ease: [0.22, 0.61, 0.36, 1] as const }}
        style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}
      >
        <div className="container mx-auto">
          <div className="flex items-stretch">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex-1 py-6 md:py-7"
                style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.10)" : undefined, paddingLeft: i > 0 ? "1.5rem" : 0 }}
              >
                <div className="font-display font-semibold text-white leading-none" style={{ fontSize: "clamp(1.9rem,3.2vw,2.8rem)" }}>
                  {s.value}
                  <span className="text-[#ef4444]">{s.suffix}</span>
                </div>
                <div className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.18em] mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {s.label}
                </div>
              </div>
            ))}
            <div className="hidden md:flex items-center pl-6 pr-1">
              <span className="flex flex-col items-center gap-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span className="text-[10px] uppercase tracking-[0.2em]">{t.hero.scroll_hint}</span>
                <ArrowDown size={15} className="animate-bounce" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} sourcePage="hero" preTitle={t.hero.cta_primary} />
    </section>
  );
}
