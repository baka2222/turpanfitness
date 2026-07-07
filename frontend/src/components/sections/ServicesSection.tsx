"use client";
import Link from "next/link";
import Image from "next/image";
import type { Zone } from "@/types";
import { stripHtml } from "@/lib/html";
import { ArrowRight, ArrowUpRight, ArrowLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const FALLBACK: Zone[] = [
  { id: 1, name: "Тренажёрный зал", description: "Кардиозона, силовая зона и зона функционального тренинга с оборудованием Technogym.", cover_image_url: null, video_tour_url: null, order: 1, features: [] },
  { id: 2, name: "Бассейн", description: "25-метровый бассейн с 4 дорожками, озонированием и УФ-очисткой. Детское плавание.", cover_image_url: null, video_tour_url: null, order: 2, features: [] },
  { id: 3, name: "Групповые программы", description: "Йога, TRX, Cycle, Stretching и многое другое. Более 30 занятий в неделю с лучшими тренерами.", cover_image_url: null, video_tour_url: null, order: 3, features: [] },
];

const GRADIENTS = [
  "linear-gradient(155deg, #2a0a0a 0%, #141414 58%, #0a0a0a 100%)",
  "linear-gradient(155deg, #1d1d20 0%, #121214 58%, #0a0a0a 100%)",
  "linear-gradient(155deg, #241010 0%, #161214 58%, #0a0a0a 100%)",
];

export default function ServicesSection({ zones, tag, title, viewAll, detail }: {
  zones?: Zone[];
  tag?: string;
  title?: string;
  viewAll?: string;
  detail?: string;
}) {
  const items = (zones && zones.length > 0) ? zones : FALLBACK;

  return (
    <section className="section surface-dark relative overflow-hidden">
      <div className="container mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
          <div className="max-w-xl">
            <span className="eyebrow mb-6">{tag ?? "Наши зоны"}</span>
            <h2 className="display-2 text-balance mt-5 text-white">{title ?? "Услуги клуба"}</h2>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex gap-3">
              <button className="svc-prev w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <ArrowLeft size={20} className="text-white/70" />
              </button>
              <button className="svc-next w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <ArrowRight size={20} className="text-white/70" />
              </button>
            </div>
            <Link href="/zones" className="inline-flex items-center gap-2 text-sm font-medium group" style={{ color: "rgba(255,255,255,0.6)" }}>
              {viewAll ?? "Все зоны"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{ prevEl: ".svc-prev", nextEl: ".svc-next" }}
          pagination={{ clickable: true, el: ".svc-pagination" }}
          autoplay={{ delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          grabCursor
          breakpoints={{
            640:  { slidesPerView: 1.5, spaceBetween: 20 },
            1024: { slidesPerView: 3,   spaceBetween: 20 },
          }}
          className="!pb-12"
        >
          {items.map((zone, i) => (
            <SwiperSlide key={zone.id}>
              <Link
                href={`/zones/${zone.id}`}
                className="group relative rounded-[1.75rem] overflow-hidden flex flex-col justify-end transition-all duration-500 block"
                style={{ border: "1px solid rgba(255,255,255,0.09)", aspectRatio: "4/5" }}
              >
                {zone.cover_image_url ? (
                  <Image src={zone.cover_image_url} alt={zone.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                ) : (
                  <div className="absolute inset-0" style={{ background: GRADIENTS[i % GRADIENTS.length] }} />
                )}
                <div className="absolute top-6 left-7 font-display font-semibold text-white/15 select-none leading-none" style={{ fontSize: "2.5rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.45) 45%, transparent 78%)" }} />
                <div className="relative p-7">
                  <h3 className="font-display text-2xl font-semibold mb-2 text-white">{zone.name}</h3>
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-5">{stripHtml(zone.description)}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 group-hover:text-[#ef4444] transition-colors">
                    {detail ?? "Подробнее"}
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="svc-pagination flex justify-center mt-2" />
      </div>
    </section>
  );
}
