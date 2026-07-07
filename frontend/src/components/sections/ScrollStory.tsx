"use client";
import { useRef, useEffect, useState, Suspense } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import {
  Check,
  ChevronDown,
  Dumbbell,
  Waves,
  Zap,
  Shield,
  Award,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import LeadModal from "@/components/ui/LeadModal";
import { useLang } from "@/contexts/LanguageContext";
import type { SiteSettings } from "@/types";

const DumbbellCanvas = dynamic(
  () => import("@/components/3d/DumbbellCanvas"),
  { ssr: false, loading: () => null }
);

type LucideIcon = React.ComponentType<{ size?: number }>;
const ICONS: LucideIcon[] = [Dumbbell, Waves, Shield, Zap, Check];
const ICONS2: LucideIcon[] = [Dumbbell, Waves, Zap, Award, Check];

/* ─── Atoms ───────────────────────────────────────── */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-100 bg-red-50 text-red-700 shadow-sm mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span style={{ fontSize: 10, letterSpacing: "0.2em" }} className="font-bold uppercase">
        {children}
      </span>
    </div>
  );
}

function Item({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm">
      <div className="w-9 h-9 rounded-xl border border-red-100 bg-red-50 flex items-center justify-center text-red-600 shrink-0">
        <Icon size={16} />
      </div>
      <span className="text-slate-700 text-sm leading-relaxed">{text}</span>
    </li>
  );
}

function SceneNum({ n, dark }: { n: string; dark?: boolean }) {
  return (
    <span
      className="absolute -top-5 -left-1 font-display font-bold leading-none select-none pointer-events-none"
      style={{ fontSize: "clamp(5rem,9vw,9rem)", color: dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.04)" }}
    >
      {n}
    </span>
  );
}

/* ─── Glass card wrappers ─────────────────────────── */
function HeroCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white/97 border border-slate-200/80 rounded-[2rem] p-8 lg:p-10 backdrop-blur-lg"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset" }}
    >
      {children}
    </div>
  );
}

function SideCard({ children, align = "left", gif }: { children: React.ReactNode; align?: "left" | "right"; gif?: string }) {
  if (gif) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl bg-black"
        style={{
          maxWidth: 320,
          boxShadow: "0 24px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07) inset",
        }}
      >
        <img
          src={gif}
          alt=""
          className="w-full h-full object-cover"   // или object-contain
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        {/* градиент и текст – без изменений */}
        <div className="absolute inset-0" style={{ background: "..." }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-20" style={{ textAlign: align === "right" ? "right" : "left" }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div
      className="bg-white/95 border border-slate-200/80 rounded-3xl p-7 backdrop-blur-lg"
      style={{
        textAlign: align === "right" ? "right" : "left",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Dark card atoms (GIF background scenes) ──────── */
function DarkTag({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 text-white shadow-sm mb-3 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      <span style={{ fontSize: 10, letterSpacing: "0.2em" }} className="font-bold uppercase">
        {children}
      </span>
    </div>
  );
}

function DarkItem({ Icon, text, align = "left" }: { Icon: LucideIcon; text: string; align?: "left" | "right" }) {
  return (
    <li className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse" : ""} bg-white/10 border border-white/10 rounded-2xl px-3.5 py-2.5`}>
      <div className="w-8 h-8 rounded-xl bg-red-500/25 border border-red-400/30 flex items-center justify-center text-red-300 shrink-0">
        <Icon size={14} />
      </div>
      <span className="text-white/90 text-sm leading-snug">{text}</span>
    </li>
  );
}

function DarkStatRow({ stats, align = "left" }: { stats: { v: string; l: string }[]; align?: "left" | "right" }) {
  return (
    <div className={`flex gap-5 mb-4 ${align === "right" ? "justify-end" : ""}`}>
      {stats.map(({ v, l }) => (
        <div key={l} className={align === "right" ? "text-right" : ""}>
          <div className="font-display text-2xl font-bold text-red-400 leading-none">{v}</div>
          <div className="text-white/45 mt-0.5" style={{ fontSize: 10 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function CTACard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white/97 border border-slate-200/80 rounded-[2rem] p-10 backdrop-blur-lg max-w-lg mx-auto text-center"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset" }}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════ */
interface ScrollStoryProps { settings: SiteSettings; }

export default function ScrollStory({ settings }: ScrollStoryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    setPrefersReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    return (
      <>
        <DesktopStory settings={settings} onJoin={() => setModalOpen(true)} />
        <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} sourcePage="scroll-story" preTitle={t.scene5.cta_primary} />
      </>
    );
  }

  if (isMobile || prefersReduced) {
    return (
      <>
        <MobileStory settings={settings} onJoin={() => setModalOpen(true)} reduced={prefersReduced} />
        <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} sourcePage="scroll-story-mobile" preTitle={t.scene5.cta_primary} />
      </>
    );
  }

  return (
    <>
      <DesktopStory settings={settings} onJoin={() => setModalOpen(true)} />
      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} sourcePage="scroll-story" preTitle={t.scene5.cta_primary} />
    </>
  );
}

/* ════════════════════════════════════════════════════
   DESKTOP — AnimatePresence ensures ZERO overlap.
   One scene exits completely before the next enters.

   Scene boundaries (out of 560vh total):
     S1: 0.00 – 0.22   (123vh hold)
     S2: 0.22 – 0.45   (129vh hold)
     S3: 0.45 – 0.66   (118vh hold)
     S4: 0.66 – 0.87   (118vh hold)
     S5: 0.87 – 1.00   (73vh visible)

   3D model moves only BETWEEN scenes (while text
   is invisible), so it never fights the text for
   attention.
   ════════════════════════════════════════════════════ */

type SceneId = 1 | 2 | 3 | 4 | 5;

const SCENE_THRESHOLDS: [number, number, number, number] = [0.22, 0.45, 0.66, 0.87];

// ── GIF backgrounds per scene — drop files into public/gifs/ ──
const SCENE_GIFS: Partial<Record<SceneId, string>> = {
  2: "/gifs/scene2.gif",
  3: "/gifs/scene3.gif",
  4: "/gifs/scene4.gif",
};

function progressToScene(v: number): SceneId {
  if (v < SCENE_THRESHOLDS[0]) return 1;
  if (v < SCENE_THRESHOLDS[1]) return 2;
  if (v < SCENE_THRESHOLDS[2]) return 3;
  if (v < SCENE_THRESHOLDS[3]) return 4;
  return 5;
}

/* Enter/exit variants — directional for L/R panels */
const variantsLeft = {
  enter: { opacity: 0, x: -24 },
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit:   { opacity: 0, x: -20, transition: { duration: 0.28, ease: "easeIn" as const } },
};
const variantsRight = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit:   { opacity: 0, x: 20,  transition: { duration: 0.28, ease: "easeIn" as const } },
};
const variantsCenter = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.28, ease: "easeIn" as const } },
};

function DesktopStory({ settings, onJoin }: { settings: SiteSettings; onJoin: () => void }) {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const sceneRef = useRef<SceneId>(1);
  const [scene, setScene] = useState<SceneId>(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      scrollRef.current = v;
      const next = progressToScene(v);
      if (next !== sceneRef.current) {
        sceneRef.current = next;
        setScene(next);
      }
    });
  }, [scrollYProgress]);

  const hintOp = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Dark background fades in as scene 1 exits, fades out as scene 5 enters
  const darkOverlayOpacity = useTransform(
    scrollYProgress,
    [0.16, 0.23, 0.83, 0.89],
    [0,    0.88, 0.88, 0   ]
  );


  return (
    <div ref={containerRef} style={{ height: "560vh" }}>
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 55%, #fff5f5 100%)" }}
      >
        {/* Dark overlay — fades in between scenes 1→2, fades out between scenes 4→5 */}
        <motion.div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "#050505", opacity: darkOverlayOpacity }}
        />

        {/* 3D canvas — above dark overlay so model glows against dark bg */}
        <div className="absolute inset-0 z-[5] pointer-events-none">
          <Suspense fallback={null}>
            <DumbbellCanvas scrollRef={scrollRef} variant="scroll" />
          </Suspense>
        </div>

        {/* ── One scene at a time, guaranteed no overlap ── */}
        <AnimatePresence mode="wait">

          {scene === 1 && (
            <motion.div
              key="s1"
              variants={variantsCenter}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 z-20 flex flex-col justify-center px-8 lg:px-16 pointer-events-none"
            >
              <div className="max-w-[520px] pointer-events-auto">
                <HeroCard>
                  <Tag>{settings.hero_slogan ?? t.story.tag}</Tag>
                  <h2
                    className="font-display font-semibold tracking-tight mb-5 text-slate-950"
                    style={{ fontSize: "clamp(2.3rem,4.5vw,3.8rem)", lineHeight: 1.06 }}
                  >
                    {t.story.title1}<br />
                    <span className="text-gradient-red">{t.story.title2}</span>
                  </h2>
                  <div
                    className="text-slate-600 text-base max-w-md leading-relaxed mb-7 [&>p]:mb-3 [&>p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: settings.about_content ?? "нет данных" }}
                  />
                  {/* Quick feature chips drawn from real advantages */}
                  <div className="flex flex-wrap gap-2 mb-7">
                    {t.advantages.slice(0, 3).map((adv) => (
                      <span
                        key={adv}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                      >
                        <Check size={12} className="text-red-600 shrink-0" />
                        {adv}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={onJoin}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm transition-all hover:shadow-lg hover:shadow-red-200/50 active:scale-95"
                  >
                    {t.hero.cta_primary}
                    <ArrowRight size={15} />
                  </button>
                </HeroCard>
              </div>
            </motion.div>
          )}

          {scene === 2 && (
            <motion.div
              key="s2"
              variants={variantsLeft}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-y-0 left-[10%] z-20 w-[46%] flex flex-col justify-center pl-24 pr-6 lg:pl-32 lg:pr-8 pointer-events-none"
            >
              <div className="relative pointer-events-auto">
                <SceneNum n="02" dark />
                <SideCard gif={SCENE_GIFS[2]}>
                  <DarkTag>{t.scene2_detail.tag}</DarkTag>
                  <h2
                    className="font-display font-semibold text-white mb-2.5"
                    style={{ fontSize: "clamp(1.8rem,3vw,2.9rem)", lineHeight: 1.1 }}
                  >
                    {t.scene2_detail.title1}<br />
                    <span className="text-gradient-red">{t.scene2_detail.title2}</span>
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-[300px]">
                    {t.scene2_detail.subtitle}
                  </p>
                  <DarkStatRow stats={[{ v: t.scene2_detail.s1v, l: t.scene2_detail.s1l }, { v: t.scene2_detail.s2v, l: t.scene2_detail.s2l }, { v: t.scene2_detail.s3v, l: t.scene2_detail.s3l }]} />
                  <ul className="space-y-2">
                    <DarkItem Icon={Waves} text={t.scene2_detail.f1} />
                    <DarkItem Icon={Shield} text={t.scene2_detail.f2} />
                  </ul>
                </SideCard>
              </div>
            </motion.div>
          )}

          {scene === 3 && (
            <motion.div
              key="s3"
              variants={variantsRight}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-y-0 right-0 z-20 w-[46%] flex flex-col justify-center px-10 lg:px-16 pointer-events-none"
            >
              <div className="relative w-full pointer-events-auto">
                <SceneNum n="03" dark />
                <SideCard align="right" gif={SCENE_GIFS[3]}>
                  <DarkTag align="right">{t.scene3_detail.tag}</DarkTag>
                  <h2
                    className="font-display font-semibold text-white mb-2.5"
                    style={{ fontSize: "clamp(1.8rem,3vw,2.9rem)", lineHeight: 1.1 }}
                  >
                    {t.scene3_detail.title1}<br />
                    <span className="text-gradient-red">{t.scene3_detail.title2}</span>
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 ml-auto max-w-[300px]">
                    {t.scene3_detail.subtitle}
                  </p>
                  <DarkStatRow align="right" stats={[{ v: t.scene3_detail.s1v, l: t.scene3_detail.s1l }, { v: t.scene3_detail.s2v, l: t.scene3_detail.s2l }, { v: t.scene3_detail.s3v, l: t.scene3_detail.s3l }]} />
                  <ul className="space-y-2">
                    <DarkItem align="right" Icon={Dumbbell} text={t.scene3_detail.f1} />
                    <DarkItem align="right" Icon={Zap} text={t.scene3_detail.f2} />
                  </ul>
                </SideCard>
              </div>
            </motion.div>
          )}

          {scene === 4 && (
            <motion.div
              key="s4"
              variants={variantsLeft}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-y-0 left-[10%] z-20 w-[46%] flex flex-col justify-center pl-24 pr-6 lg:pl-32 lg:pr-8 pointer-events-none"
            >
              <div className="relative pointer-events-auto">
                <SceneNum n="04" dark />
                <SideCard gif={SCENE_GIFS[4]}>
                  <DarkTag>{t.scene4_detail.tag}</DarkTag>
                  <h2
                    className="font-display font-semibold text-white mb-2.5"
                    style={{ fontSize: "clamp(1.8rem,3vw,2.9rem)", lineHeight: 1.1 }}
                  >
                    {t.scene4_detail.title1}<br />
                    <span className="text-gradient-red">{t.scene4_detail.title2}</span>
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-[300px]">
                    {t.scene4_detail.subtitle}
                  </p>
                  <DarkStatRow stats={[{ v: t.scene4_detail.s1v, l: t.scene4_detail.s1l }, { v: t.scene4_detail.s2v, l: t.scene4_detail.s2l }, { v: t.scene4_detail.s3v, l: t.scene4_detail.s3l }]} />
                  <a
                    href="/schedule"
                    className="inline-flex items-center gap-2 mt-1 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors group"
                  >
                    {t.scene4_detail.schedule}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </SideCard>
              </div>
            </motion.div>
          )}

          {scene === 5 && (
            <motion.div
              key="s5"
              variants={variantsCenter}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <CTACard>
                  <Tag>{t.scene5.tag}</Tag>
                  <h2
                    className="font-display font-semibold text-slate-950 tracking-tight mb-4"
                    style={{ fontSize: "clamp(2.2rem,4.5vw,4rem)", lineHeight: 1.07 }}
                  >
                    {t.scene5.title1}<br />
                    <span className="text-gradient-red">{t.scene5.title2}</span>
                  </h2>
                  <p className="text-slate-600 text-base max-w-sm mx-auto mb-8 leading-relaxed">
                    {t.scene5.desc}
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={onJoin}
                      className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm transition-all hover:shadow-xl hover:shadow-red-200/50 active:scale-95"
                    >
                      {t.scene5.cta_primary}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(settings.whatsapp_default_message ?? "нет данных")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3.5 border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold rounded-full text-sm transition-all hover:bg-slate-50 flex items-center gap-2 active:scale-95"
                    >
                      <MessageCircle size={16} />
                      {t.scene5.wa}
                    </a>
                  </div>
                </CTACard>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Scroll hint — fades as soon as user starts scrolling */}
        <motion.div
          style={{ opacity: hintOp }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-slate-400 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.25em" }}>
            {t.hero.scroll_hint}
          </span>
          <ChevronDown size={16} className="text-slate-400 animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MOBILE — stacked, all-light layout
   ════════════════════════════════════════════════════ */
function MobileStory({
  settings,
  onJoin,
  reduced,
}: {
  settings: SiteSettings;
  onJoin: () => void;
  reduced: boolean;
}) {
  const { t } = useLang();

  const reveal = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.55, ease: "easeOut" as const },
      };

  return (
    <div className="relative">
      {/* Hero with floating dumbbell */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden" style={{ background: "#f0f4ff" }}>
        {!reduced && (
          <div className="absolute inset-0 z-0">
            <Suspense fallback={null}>
              <DumbbellCanvas variant="float" isMobile />
            </Suspense>
          </div>
        )}

        {/* Light gradient — blends canvas into content */}
        <div
          className="absolute inset-x-0 bottom-0 z-[1] pointer-events-none"
          style={{
            height: "60%",
            background: "linear-gradient(to top, #f0f4ff 0%, #f0f4ff 18%, rgba(240,244,255,0.82) 55%, transparent 100%)",
          }}
        />

          <div className="relative z-10 mt-auto px-6 pb-14 pt-28">
          <Tag>{settings.hero_slogan ?? t.story.tag}</Tag>
          <h2
            className="font-display font-semibold tracking-tight mb-4 text-slate-950"
            style={{ fontSize: "clamp(2.1rem,9vw,3.2rem)", lineHeight: 1.06 }}
          >
            {t.story.title1}{" "}
            <span className="text-gradient-red">{t.story.title2}</span>
          </h2>
            <div
              className="text-slate-600 text-sm mb-6 leading-relaxed max-w-sm [&>p]:mb-2 [&>p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: settings.about_content ?? "нет данных" }}
            />
          <div className="flex flex-wrap gap-2 mb-7">
            {t.advantages.slice(0, 3).map((adv) => (
              <span
                key={adv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium"
              >
                <Check size={12} className="text-red-600 shrink-0" />
                {adv}
              </span>
            ))}
          </div>
          <button
            onClick={onJoin}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm transition-all active:scale-95 shadow-md shadow-red-200/40"
          >
            {t.hero.cta_primary}
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Advantages */}
      <section className="section-sm px-6" style={{ background: "#ffffff", borderTop: "1px solid rgba(15,23,42,0.07)" }}>
        <motion.div {...reveal} className="container mx-auto">
          <Tag>{t.scene2.tag}</Tag>
          <h2 className="font-display font-semibold text-slate-950 mb-6" style={{ fontSize: "clamp(1.8rem,7vw,2.5rem)", lineHeight: 1.1 }}>
            {t.scene2.title1}{" "}
            <span className="text-gradient-red">{t.scene2.title2}</span>
          </h2>
          <ul className="space-y-3">
            {t.advantages.map((text, i) => (
              <Item key={i} Icon={ICONS[i] ?? Check} text={text} />
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Services */}
      <section className="section-sm px-6" style={{ background: "#f8fafc", borderTop: "1px solid rgba(15,23,42,0.07)" }}>
        <motion.div {...reveal} className="container mx-auto">
          <Tag>{t.scene3.tag}</Tag>
          <h2 className="font-display font-semibold text-slate-950 mb-6" style={{ fontSize: "clamp(1.8rem,7vw,2.5rem)", lineHeight: 1.1 }}>
            {t.scene3.title1}{" "}
            <span className="text-gradient-red">{t.scene3.title2}</span>
          </h2>
          <ul className="space-y-3">
            {t.services.map((text, i) => (
              <Item key={i} Icon={ICONS2[i] ?? Check} text={text} />
            ))}
          </ul>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="section-sm px-6 text-center" style={{ background: "#ffffff", borderTop: "1px solid rgba(15,23,42,0.07)" }}>
        <motion.div {...reveal} className="container mx-auto">
          <Tag>{t.scene5.tag}</Tag>
          <h2 className="font-display font-semibold text-slate-950 mb-3" style={{ fontSize: "clamp(1.8rem,7vw,2.5rem)", lineHeight: 1.1 }}>
            {t.scene5.title1}{" "}
            <span className="text-gradient-red">{t.scene5.title2}</span>
          </h2>
          <p className="text-slate-600 text-sm mb-7 max-w-xs mx-auto leading-relaxed">{t.scene5.desc}</p>
          <button
            onClick={onJoin}
            className="w-full max-w-xs mx-auto py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl transition-all active:scale-95 shadow-md shadow-red-200/40"
          >
            {t.scene5.cta_primary}
          </button>
        </motion.div>
      </section>
    </div>
  );
}
