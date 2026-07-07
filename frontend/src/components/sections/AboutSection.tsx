"use client";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import Reveal from "@/components/ui/Reveal";
import type { SiteSettings } from "@/types";

export default function AboutSection({ settings }: { settings?: SiteSettings | null }) {
  const { t } = useLang();
  const chips = t.advantages.slice(0, 4);

  return (
    <section id="about" className="section" style={{ background: "var(--bg-alt)" }}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left — heading + CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <Reveal>
              <span className="eyebrow mb-6">{t.story.tag}</span>
              <h2 className="display-2 text-balance mt-5" style={{ color: "var(--text)" }}>
                {t.story.title1}{" "}
                <span className="text-gradient-red">{t.story.title2}</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Link href="/zones" className="btn btn-dark mt-9">
                {t.story.cta}
                <ArrowRight size={17} />
              </Link>
            </Reveal>
          </div>

          {/* Right — CMS prose + highlights */}
          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <div
                className="text-lg md:text-xl lg:text-2xl font-medium"
                dangerouslySetInnerHTML={{ __html: settings?.about_title ?? "" }}
              />
            </Reveal>

            <Reveal delay={160}>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-10 pt-10" style={{ borderTop: "1px solid var(--border)" }}>
                <div
                  className="cms-content"
                  dangerouslySetInnerHTML={{ __html: settings?.about_content ?? "" }}
                />
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
