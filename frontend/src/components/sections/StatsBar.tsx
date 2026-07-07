"use client";
import { useRef, useEffect, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

function Counter({ target, duration = 1700 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(ease * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString("ru-RU")}</span>;
}

export default function StatsBar() {
  const { t } = useLang();

  const stats = t.stats.items.map((item) => {
    const num = parseInt(item.value.replace(/[^0-9]/g, ""), 10);
    const suffix = item.value.replace(/[0-9\s,]/g, "");
    return { ...item, num: isNaN(num) ? null : num, suffix };
  });

  return (
    <section className="section-sm" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow eyebrow--center">{t.stats.label}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center px-6 py-6 sm:py-2 ${i > 0 ? "sm:border-l" : ""}`}
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="font-display font-semibold leading-none tabular-nums"
                style={{ fontSize: "clamp(3rem,5.5vw,4.6rem)", color: "var(--text)", letterSpacing: "-0.02em" }}
              >
                {s.num !== null ? <><Counter target={s.num} /><span style={{ color: "var(--accent)" }}>{s.suffix}</span></> : s.value}
              </div>
              <div className="text-xs font-medium tracking-[0.18em] uppercase mt-4" style={{ color: "var(--text-faint)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
