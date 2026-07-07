"use client";
import type { Advantage } from "@/types";
import { Shield, Dumbbell, Waves, Car, Zap, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const FALLBACK: Advantage[] = [
  { id: 1, icon: "dumbbell", title: "Оборудование Technogym", description: "Профессиональное итальянское оборудование премиум-класса для максимального результата.", order: 1 },
  { id: 2, icon: "waves", title: "Бассейн 25 метров", description: "4 плавательные дорожки, озонирование и УФ-очистка воды для вашего здоровья.", order: 2 },
  { id: 3, icon: "shield", title: "Безопасность", description: "Круглосуточная охрана, видеонаблюдение и система контроля доступа.", order: 3 },
  { id: 4, icon: "car", title: "Бесплатный паркинг", description: "Просторная охраняемая парковка для всех членов клуба.", order: 4 },
  { id: 5, icon: "zap", title: "Групповые программы", description: "Йога, TRX, Cycle, Stretching — более 30 занятий в неделю.", order: 5 },
  { id: 6, icon: "clock", title: "Гибкое расписание", description: "Занятия с 06:00 до 22:00 — найдите время, удобное именно вам.", order: 6 },
];

const iconMap: Record<string, React.ReactNode> = {
  dumbbell: <Dumbbell size={20} />,
  waves:    <Waves size={20} />,
  shield:   <Shield size={20} />,
  car:      <Car size={20} />,
  zap:      <Zap size={20} />,
  clock:    <Clock size={20} />,
};

export default function AdvantagesSection({ items, tag, title }: { items?: Advantage[]; tag?: string; title?: string }) {
  const advantages = (items && items.length > 0) ? items : FALLBACK;

  return (
    <section id="advantages" className="section" style={{ background: "var(--bg-alt)" }}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 md:mb-16">
          <div className="max-w-2xl">
            <span className="eyebrow mb-6">{tag ?? "Почему мы"}</span>
            <h2 className="display-2 text-balance mt-5" style={{ color: "var(--text)" }}>
              {title ?? "Преимущества клуба"}
            </h2>
          </div>
          <div className="hidden md:flex gap-3 shrink-0">
            <button className="adv-prev w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <ArrowLeft size={20} style={{ color: "var(--text-muted)" }} />
            </button>
            <button className="adv-next w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <ArrowRight size={20} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{ prevEl: ".adv-prev", nextEl: ".adv-next" }}
          pagination={{ clickable: true, el: ".adv-pagination" }}
          autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          grabCursor
          breakpoints={{
            640:  { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="!pb-12"
        >
          {advantages.map((a, i) => (
            <SwiperSlide key={a.id} className="h-auto">
              <div className="group card-premium p-8 relative overflow-hidden h-full">
                <span
                  className="absolute top-6 right-7 font-display font-semibold leading-none select-none pointer-events-none"
                  style={{ fontSize: "2.4rem", color: "var(--text)", opacity: 0.05 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105"
                  style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-glow)", color: "var(--accent)" }}
                >
                  {iconMap[a.icon] ?? <Zap size={20} />}
                </div>
                <h3 className="font-semibold text-lg mb-2.5" style={{ color: "var(--text)" }}>{a.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{a.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="adv-pagination flex justify-center mt-2" />
      </div>
    </section>
  );
}
