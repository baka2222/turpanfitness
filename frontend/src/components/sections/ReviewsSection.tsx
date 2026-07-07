"use client";
import { useState } from "react";
import Image from "next/image";
import type { Review } from "@/types";
import { Star, Quote, CheckCircle2, ArrowLeft, ArrowRight, X, MessageCirclePlus } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import Reveal from "@/components/ui/Reveal";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const FALLBACK: Review[] = [
  { id: 1, author_name: "Айгуль Бекова", author_photo_url: null, rating: 5, source: "google", text: "Отличный клуб! Оборудование Technogym на высшем уровне, тренеры очень профессиональные. Хожу уже год и очень довольна результатами.", created_at: "2024-01-15", order: 1 },
  { id: 2, author_name: "Алишер Джумаев", author_photo_url: null, rating: 5, source: "2gis", text: "Лучший фитнес-клуб в городе. Бассейн просто шикарный — чистый, просторный. Персонал очень вежливый и внимательный.", created_at: "2024-02-10", order: 2 },
  { id: 3, author_name: "Марина Соколова", author_photo_url: null, rating: 5, source: "instagram", text: "Записалась на групповые программы — Cycle и Yoga. Невероятные тренеры, атмосфера мотивирует работать над собой каждый день.", created_at: "2024-03-05", order: 3 },
  { id: 4, author_name: "Тимур Асанов", author_photo_url: null, rating: 5, source: "google", text: "Чистота в раздевалках идеальная. Очень радует наличие сауны после тяжелой тренировки.", created_at: "2024-04-12", order: 4 },
];

const TEXT_CLAMP_THRESHOLD = 180;

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "fill-[var(--accent)] text-[var(--accent)]" : "fill-transparent text-[var(--border-hover)]"}
        />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    google: "#4285F4",
    "2gis": "#1BBF3F",
    instagram: "#E1306C",
    yandex: "#FC3F1D",
  };
  const color = colors[source.toLowerCase()] ?? "var(--accent)";
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {source}
    </span>
  );
}

function Avatar({ item }: { item: Review }) {
  return (
    <div className="relative shrink-0">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base overflow-hidden"
        style={{ background: "var(--bg)", color: "var(--accent)", border: "2px solid var(--accent-dim)" }}
      >
        {item.author_photo_url ? (
          <Image src={item.author_photo_url} alt={item.author_name} fill className="object-cover" />
        ) : (
          item.author_name[0]
        )}
      </div>
      <div className="absolute -bottom-1 -right-1 bg-[var(--surface)] rounded-full">
        <CheckCircle2 size={16} className="text-[var(--accent)]" fill="var(--bg)" />
      </div>
    </div>
  );
}

function ReviewCard({ item, onExpand, readMoreLabel }: { item: Review; onExpand: () => void; readMoreLabel: string }) {
  const needsExpand = item.text.length > TEXT_CLAMP_THRESHOLD;

  return (
    <div
      className="group relative h-full flex flex-col p-7 rounded-[1.5rem] transition-all duration-500 hover:-translate-y-1"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px -8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Декоративная кавычка */}
      <div
        className="absolute top-5 right-6 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60"
        style={{ color: "var(--accent)" }}
      >
        <Quote size={32} fill="currentColor" />
      </div>

      {/* Шапка: аватар + имя + источник */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar item={item} />
        <div className="min-w-0">
          <h4 className="font-bold text-[15px] leading-tight truncate" style={{ color: "var(--text)" }}>
            {item.author_name}
          </h4>
          <div className="mt-1">
            <SourceBadge source={item.source} />
          </div>
        </div>
      </div>

      {/* Рейтинг */}
      <div className="mb-4">
        <Stars rating={item.rating} />
      </div>

      {/* Текст с ограничением + кнопка раскрытия */}
      <blockquote className="flex-1 flex flex-col">
        <p
          className="text-[15px] leading-relaxed flex-1"
          style={{
            color: "var(--text-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.text}
        </p>
        {needsExpand && (
          <button
            onClick={onExpand}
            className="mt-3 text-[13px] font-semibold self-start transition-colors duration-200"
            style={{ color: "var(--accent)" }}
          >
            {readMoreLabel}
          </button>
        )}
      </blockquote>
    </div>
  );
}

function ReviewModal({ item, onClose }: { item: Review; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[2rem] p-8 shadow-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{ background: "var(--surface-el)", color: "var(--text-muted)" }}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <Avatar item={item} />
          <div>
            <h4 className="font-bold text-lg" style={{ color: "var(--text)" }}>
              {item.author_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={item.rating} size={13} />
              <SourceBadge source={item.source} />
            </div>
          </div>
        </div>

        <div
          className="w-10 h-0.5 rounded-full mb-5"
          style={{ background: "var(--accent)" }}
        />

        <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
          "{item.text}"
        </p>
      </div>
    </div>
  );
}

export default function ReviewsSection({ reviews }: { reviews?: Review[] }) {
  const { t } = useLang();
  const items = reviews && reviews.length > 0 ? reviews : FALLBACK;
  const [expanded, setExpanded] = useState<Review | null>(null);

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Заголовок + кнопки навигации */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <Reveal>
              <span className="eyebrow mb-6">{t.reviews.tag || "Отзывы"}</span>
              <h2 className="display-2 text-balance mt-2" style={{ color: "var(--text)" }}>
                {t.reviews.title || "Что говорят наши клиенты"}
              </h2>
            </Reveal>
          </div>

          <Reveal delay={200} className="hidden md:flex items-center gap-3">
            <a
              href="https://t.me/TurpanFitnessBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <MessageCirclePlus size={16} style={{ color: "var(--accent)" }} />
              {t.reviews.leave_review}
            </a>
            <button
              className="swiper-custom-prev group w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <ArrowLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </button>
            <button
              className="swiper-custom-next group w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <ArrowRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </button>
          </Reveal>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{ prevEl: ".swiper-custom-prev", nextEl: ".swiper-custom-next" }}
          pagination={{ clickable: true, el: ".swiper-custom-pagination" }}
          autoplay={{ delay: 6000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          grabCursor={true}
          breakpoints={{
            640:  { slidesPerView: 1.3, spaceBetween: 16 },
            768:  { slidesPerView: 2,   spaceBetween: 20 },
            1024: { slidesPerView: 3,   spaceBetween: 24 },
          }}
          className="!pb-12"
        >
          {items.map((item, i) => (
            <SwiperSlide key={item.id} className="h-auto self-stretch">
              <Reveal delay={i * 80} className="h-full">
                <ReviewCard item={item} onExpand={() => setExpanded(item)} readMoreLabel={t.reviews.read_more} />
              </Reveal>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-custom-pagination flex justify-center mt-2" />
      </div>

      {/* Модалка с полным отзывом */}
      {expanded && <ReviewModal item={expanded} onClose={() => setExpanded(null)} />}
    </section>
  );
}
