"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/ui/Reveal";
import type { NewsListItem } from "@/types";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { stripHtml } from "@/lib/html";
import { Calendar, Newspaper, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

const PAGE_SIZE = 9;

export default function NewsPage() {
  const { t, lang } = useLang();
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const [featured, ...rest] = news;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
    } catch { return dateStr; }
  };

  useEffect(() => {
    setLoading(true);
    api.news(lang, page, PAGE_SIZE)
      .then((data) => { setNews(data.results); setTotal(data.total); })
      .catch(() => { setNews([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, lang]);

  return (
    <>
      <Navbar />
      <main className="pt-32 md:pt-40 pb-24 min-h-dvh" style={{ background: "var(--bg)" }}>
        <div className="container mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <span className="eyebrow mb-6">{t.news_page.eyebrow}</span>
            <h1 className="display-1 text-balance mt-5" style={{ color: "var(--text)" }}>{t.news_page.title}</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-premium overflow-hidden animate-pulse">
                  <div className="aspect-video" style={{ background: "var(--surface-el)" }} />
                  <div className="p-6 space-y-3">
                    <div className="h-3 rounded w-1/3" style={{ background: "var(--surface-el)" }} />
                    <div className="h-5 rounded" style={{ background: "var(--surface-el)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-32" style={{ color: "var(--text-faint)" }}>
              <Newspaper size={44} className="mx-auto mb-4 opacity-40" />
              <p>{t.news_page.empty}</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link href={`/news/${featured.slug}`} className="group relative rounded-[1.75rem] overflow-hidden flex flex-col justify-end mb-6" style={{ border: "1px solid var(--border)", minHeight: 420 }}>
                  {featured.cover_image_url ? (
                    <Image src={featured.cover_image_url} alt={featured.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: "var(--surface-el)" }} />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.35) 45%, transparent 100%)" }} />
                  <div className="relative p-8 md:p-12">
                    <span className="tag-red mb-4" style={{ color: "#ef4444", background: "rgba(220,38,38,0.18)", borderColor: "rgba(220,38,38,0.3)" }}>{featured.category}</span>
                    <h2 className="font-display text-3xl md:text-4xl font-semibold mt-4 mb-2 text-white line-clamp-2 max-w-3xl">{featured.title}</h2>
                    <p className="text-white/65 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl">{stripHtml(featured.excerpt)}</p>
                    <div className="flex items-center gap-2 text-xs text-white/55"><Calendar size={12} /><span>{formatDate(featured.published_at)}</span></div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {rest.map((item, idx) => (
                    <Reveal key={item.id} delay={(idx % 3) * 80}>
                      <Link href={`/news/${item.slug}`} className="group card-premium overflow-hidden flex flex-col h-full">
                        <div className="relative aspect-video overflow-hidden" style={{ background: "var(--surface-el)" }}>
                          {item.cover_image_url && <Image src={item.cover_image_url} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: "var(--accent)" }}>{item.category}</span>
                          <h3 className="font-semibold text-lg leading-snug mb-2 line-clamp-2 flex-1" style={{ color: "var(--text)" }}>{item.title}</h3>
                          <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--text-muted)" }}>{stripHtml(item.excerpt)}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-faint)" }}><Calendar size={11} /><span>{formatDate(item.published_at)}</span></div>
                            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: "var(--accent)" }} />
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 transition-all" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className="w-10 h-10 rounded-full text-sm font-medium transition-all" style={p === page ? { background: "var(--accent)", color: "#fff" } : { border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 transition-all" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
