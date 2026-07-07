import Link from "next/link";
import Image from "next/image";
import type { NewsListItem } from "@/types";
import { stripHtml } from "@/lib/html";
import { ArrowRight, Calendar } from "lucide-react";

function formatDate(dateStr: string, lang = "ru") {
  try {
    const locale = lang === "en" ? "en-US" : "ru-RU";
    return new Date(dateStr).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/* NewsPreview is a server component — translations passed as props */
export default function NewsPreview({
  news,
  tag = "Новости",
  title = "Жизнь клуба",
  viewAllShort = "Все новости",
  viewAll = "Смотреть все новости",
  lang = "ru",
}: {
  news: NewsListItem[];
  tag?: string;
  title?: string;
  viewAllShort?: string;
  viewAll?: string;
  lang?: string;
}) {
  const preview = news.slice(0, 3);
  if (preview.length === 0) return null;
  const [featured, ...rest] = preview;

  return (
    <section className="section" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
          <div className="max-w-xl">
            <span className="eyebrow mb-6">{tag}</span>
            <h2 className="display-2 text-balance mt-5" style={{ color: "var(--text)" }}>{title}</h2>
          </div>
          <Link href="/news" className="link-arrow shrink-0">
            {viewAllShort}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Featured */}
          <Link
            href={`/news/${featured.slug}`}
            className="lg:col-span-7 group relative rounded-[1.75rem] overflow-hidden aspect-[4/3] lg:aspect-auto flex flex-col justify-end"
            style={{ border: "1px solid var(--border)", minHeight: 400 }}
          >
            {featured.cover_image_url ? (
              <Image src={featured.cover_image_url} alt={featured.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            ) : (
              <div className="absolute inset-0" style={{ background: "var(--surface-el)" }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.30) 50%, transparent 100%)" }} />
            <div className="relative p-8 md:p-10">
              <span className="tag-red mb-4" style={{ color: "#ef4444", background: "rgba(220,38,38,0.18)", borderColor: "rgba(220,38,38,0.3)" }}>
                {featured.category}
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mt-4 mb-2 text-white line-clamp-2">{featured.title}</h3>
              <p className="text-white/65 text-sm line-clamp-2 mb-4 max-w-xl">{stripHtml(featured.excerpt)}</p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Calendar size={12} />
                <span>{formatDate(featured.published_at, lang)}</span>
              </div>
            </div>
          </Link>

          {/* Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {rest.map((item) => (
              <Link key={item.id} href={`/news/${item.slug}`} className="group card-premium overflow-hidden flex gap-5 p-5 items-center flex-1">
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative" style={{ background: "var(--surface-el)" }}>
                  {item.cover_image_url && <Image src={item.cover_image_url} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent)" }}>{item.category}</span>
                  <h4 className="font-semibold text-base mt-1.5 mb-2 line-clamp-2" style={{ color: "var(--text)" }}>{item.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-faint)" }}>
                    <Calendar size={11} />
                    <span>{formatDate(item.published_at, lang)}</span>
                  </div>
                </div>
              </Link>
            ))}

            <Link href="/news" className="t-cta-outline flex items-center justify-center gap-2 py-4 text-sm font-medium group">
              {viewAll}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
