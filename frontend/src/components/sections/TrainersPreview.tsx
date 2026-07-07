"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Trainer } from "@/types";
import { ArrowRight, ArrowLeft, Award, ChevronRight } from "lucide-react";
import LeadModal from "@/components/ui/LeadModal";
import { useLang } from "@/contexts/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function TrainerCard({ trainer, onBook }: { trainer: Trainer; onBook: () => void }) {
  const { t } = useLang();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 h-full"
      style={{
        border: "1px solid var(--border)",
        boxShadow: hovered ? "var(--card-shadow-hover)" : "var(--card-shadow)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: "var(--surface-el)" }}>
        {trainer.photo_url ? (
          <Image
            src={trainer.photo_url}
            alt={trainer.name}
            fill
            className="object-cover object-top transition-transform duration-700"
            style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-display text-3xl font-bold" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
              {trainer.name[0]}
            </div>
          </div>
        )}

        <div
          className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)" }}
        />

        {/* Имя + должность — по умолчанию */}
        <div className="absolute inset-x-0 bottom-0 p-5 z-10 transition-all duration-300" style={{ opacity: hovered ? 0 : 1 }}>
          <h3 className="font-display font-semibold text-white text-lg leading-tight">{trainer.name}</h3>
          <p className="text-white/55 text-sm mt-0.5">{trainer.position}</p>
          {trainer.experience_years && (
            <div className="flex items-center gap-1.5 mt-2">
              <Award size={11} className="text-[#dc2626]" />
              <span className="text-white/40 text-xs">{trainer.experience_years} {t.trainers.exp_years}</span>
            </div>
          )}
        </div>

        {/* Ховер-оверлей: специализации + кнопка */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-5 z-20 transition-all duration-350"
          style={{
            background: "linear-gradient(to top, rgba(5,0,0,0.97) 0%, rgba(5,0,0,0.78) 55%, transparent 100%)",
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <p className="text-white font-display font-semibold text-lg mb-0.5">{trainer.name}</p>
          <p className="text-white/55 text-sm mb-4">{trainer.position}</p>
          {trainer.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {trainer.specializations.slice(0, 3).map((sp) => (
                <span key={sp.id} className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(220,38,38,0.18)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.32)" }}>
                  {sp.name}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onBook(); }}
            className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 btn-red"
          >
            {t.trainers.book}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrainersPreview({ trainers }: { trainers: Trainer[] }) {
  const { t } = useLang();
  const [modalTrainer, setModalTrainer] = useState<Trainer | null>(null);
  const coaches = trainers.filter((tr) => tr.is_coach !== false).slice(0, 8);

  return (
    <section className="section" style={{ background: "var(--bg)" }}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
          <div className="max-w-xl">
            <span className="eyebrow mb-6">{t.trainers.tag}</span>
            <h2 className="display-2 text-balance mt-5" style={{ color: "var(--text)" }}>
              {t.trainers.title}
            </h2>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex gap-3">
              <button className="tr-prev w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <ArrowLeft size={20} style={{ color: "var(--text-muted)" }} />
              </button>
              <button className="tr-next w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <ArrowRight size={20} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <Link href="/trainers" className="link-arrow shrink-0">
              {t.trainers.view_all}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {coaches.length === 0 ? (
          <p className="text-center py-20" style={{ color: "var(--text-faint)" }}>{t.trainers.no_data}</p>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{ prevEl: ".tr-prev", nextEl: ".tr-next" }}
            pagination={{ clickable: true, el: ".tr-pagination" }}
            autoplay={{ delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true }}
            grabCursor
            breakpoints={{
              480:  { slidesPerView: 2, spaceBetween: 16 },
              768:  { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="!pb-12"
          >
            {coaches.map((trainer) => (
              <SwiperSlide key={trainer.id} className="h-auto">
                <TrainerCard trainer={trainer} onBook={() => setModalTrainer(trainer)} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="tr-pagination flex justify-center mt-2" />
      </div>

      <LeadModal
        open={!!modalTrainer}
        onClose={() => setModalTrainer(null)}
        sourcePage="trainers"
        relatedTrainerId={modalTrainer?.id}
        preTitle={modalTrainer ? `${t.trainers.book.replace("тренеру", "")} ${modalTrainer.name}` : t.trainers.book}
      />
    </section>
  );
}
