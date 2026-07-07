import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { getLang } from "@/lib/getLang";
import { getTranslations } from "@/lib/translations";
import { Calendar, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const t = getTranslations(lang);

  let item;
  try {
    item = await api.newsItem(slug, lang);
  } catch {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 md:pt-40 pb-24 min-h-dvh" style={{ background: "var(--bg)" }}>
        <article className="container mx-auto" style={{ maxWidth: 800 }}>
          <Link href="/news" className="link-arrow mb-8" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={15} />
            {t.news_page.back}
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className="tag-red mb-4">{item.category}</span>
            <h1 className="display-2 text-balance mt-5 mb-5" style={{ color: "var(--text)" }}>{item.title}</h1>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-faint)" }}>
              <Calendar size={14} />
              <span>{formatDate(item.published_at)}</span>
            </div>
          </div>

          {/* Cover */}
          {item.cover_image_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10" style={{ border: "1px solid var(--border)" }}>
              <Image src={item.cover_image_url} alt={item.title} fill className="object-cover" priority />
            </div>
          )}

          {/* Content (CKEditor HTML) */}
          <div className="cms-content" dangerouslySetInnerHTML={{ __html: item.content ?? "" }} />
        </article>
      </main>
      <Footer />
    </>
  );
}
