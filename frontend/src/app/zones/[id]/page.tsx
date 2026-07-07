import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CTASection from "@/components/sections/CTASection";
import { api } from "@/lib/api";
import { getLang } from "@/lib/getLang";
import { getTranslations } from "@/lib/translations";
import { stripHtml } from "@/lib/html";
import { ArrowLeft, Check, Play, Sparkles, MoveRight, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ZoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();

  const lang = await getLang();
  const t = getTranslations(lang);

  let zone;
  try {
    zone = await api.zone(numId, lang);
  } catch {
    notFound();
  }

  return (
    <>
      <Navbar />
      {/* Убрали overflow-hidden с main, чтобы работал sticky (parallax) */}
      <main className="min-h-dvh relative" style={{ background: "var(--bg)" }}>
        
        {/* ─── Cinematic Hero Section ─────────────────────────────── */}
      <div className="relative h-[85vh] w-full flex flex-col justify-end overflow-hidden">
        {/* Фоновое изображение */}
        <div className="absolute inset-0">
          {zone.cover_image_url ? (
            <Image
              src={zone.cover_image_url}
              alt={zone.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-900" />
          )}
          {/* Градиентные оверлеи */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-black/90" />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Контент снизу */}
        <div className="relative z-10 container mx-auto px-4 md:px-8 pb-32 flex flex-col items-center text-center">
          {/* Кнопка "Назад" теперь здесь, перед заголовком */}
          <Link
            href="/zones"
            className="group inline-flex items-center gap-3 text-sm font-bold text-white/80 hover:text-white transition-all backdrop-blur-md bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full border border-white/10 shadow-lg mb-8"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            {t.zone_detail.back}
          </Link>

          <h1 className="text-6xl md:text-8xl lg:text-9xl mb-12 font-black text-white tracking-tighter text-balance drop-shadow-2xl">
            {zone.name}
          </h1>
          <div className="w-24 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_15px_var(--accent)] mt-8" />
        </div>
      </div>

        {/* ─── Основной контент (Наплывающая панель) ────────────────────────────────── */}
        <div 
          className="relative z-20 w-full -mt-16 rounded-t-[3rem] md:rounded-t-[4rem] border-t shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          style={{ 
            background: "var(--bg)", 
            borderColor: "var(--border)" 
          }}
        >
          {/* Индикатор скролла для мобилок */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20 backdrop-blur-md" />

          <div className="container mx-auto px-4 md:px-8 py-20 md:py-28">

            <div className="grid grid-cols-1 mt-6 lg:grid-cols-12 gap-12 lg:gap-20">

              {/* Левая колонка — Описание и Видео (Широкая) */}
              <div className="lg:col-span-7 space-y-12 md:space-y-16">

                {/* Описание */}
                <section className="pb-12 border-b" style={{ borderColor: "var(--border)" }}>
                  <h3 className="text-2xl md:text-3xl font-bold mb-5 flex items-center gap-4" style={{ color: "var(--text)" }}>
                    {"Об этой зоне"}
                  </h3>
                  <p className="text-lg md:text-xl leading-relaxed opacity-80" style={{ color: "var(--text)" }}>
                    {stripHtml(zone.description)}
                  </p>
                </section>

                {/* Видео плеер */}
                {zone.video_tour_url && (
                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 opacity-60" style={{ color: "var(--text)" }}>
                      {t.zone_detail.video}
                    </h3>
                    <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl group border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                      
                      <iframe
                        src={zone.video_tour_url}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full z-10"
                        title={`${t.zone_detail.video} — ${zone.name}`}
                      />
      
                    </div>
                  </section>
                )}
              </div>

              {/* Правая колонка — Особенности (Узкая, плавающая) */}
              <div className="lg:col-span-5 relative">
                <div className="sticky top-32 p-8 md:p-10 rounded-[2rem] border shadow-xl" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <h3 className="text-2xl font-bold mb-8" style={{ color: "var(--text)" }}>
                    {t.zone_detail.features}
                  </h3>
                  
                  {zone.features.length > 0 ? (
                    <ul className="space-y-4">
                      {zone.features.map((f) => (
                        <li 
                          key={f.id} 
                          className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300"
                          style={{ background: "var(--surface-el)" }}
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                            style={{ background: "var(--bg)", border: "1px solid var(--accent)" }}
                          >
                            <Check size={18} style={{ color: "var(--accent)" }} />
                          </div>
                          <span className="text-base font-medium" style={{ color: "var(--text)" }}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 rounded-2xl text-center opacity-60 border border-dashed" style={{ borderColor: "var(--border)" }}>
                      Нет особенностей
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Галерея (Bento Grid) ────────────────────────────────── */}
            {zone.gallery.length > 0 && (
              <section className="mt-20 md:mt-28 border-t pt-16 md:pt-20" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-end justify-between mb-12">
                  <h2 className="text-3xl md:text-4xl font-black" style={{ color: "var(--text)" }}>
                    {t.zone_detail.gallery}
                  </h2>
                </div>
                
                {/* Современная сетка Bento (первая картинка большая, остальные поменьше) */}
                <div className="grid pb-12 grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[300px]">
                  {zone.gallery.map((img, index) => (
                    <div
                      key={img.id}
                      className={`relative rounded-3xl overflow-hidden group cursor-pointer ${
                        index === 0 ? "col-span-2 row-span-2" : "col-span-2 md:col-span-1 row-span-1"
                      }`}
                      style={{ background: "var(--surface-el)" }}
                    >
                      {img.image_url ? (
                        <>
                          <Image
                            src={img.image_url}
                            alt={img.caption || zone.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Иконка "увеличить" по центру */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <MoveRight size={24} className="text-white -rotate-45" />
                            </div>
                          </div>

                          {img.caption && (
                            <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                              <p className="text-white font-medium text-lg leading-tight shadow-black drop-shadow-md">
                                {img.caption}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <Sparkles size={48} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            
          </div>
        </div>
      </main>
      <CTASection />
      <Footer />
    </>
  );
}