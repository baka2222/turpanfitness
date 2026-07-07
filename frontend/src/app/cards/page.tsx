"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LeadModal from "@/components/ui/LeadModal";
import Reveal from "@/components/ui/Reveal";
import type { ClubCard } from "@/types";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { stripHtml } from "@/lib/html";
import { Check, Star, CreditCard, ArrowRight, Zap } from "lucide-react";

export default function CardsPage() {
  const { t, lang } = useLang();
  const [cards, setCards] = useState<ClubCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<ClubCard | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.cards(lang).then(setCards).catch(() => setCards([])).finally(() => setLoading(false));
  }, [lang]);

  const formatPrice = (price: string) =>
    Number(price).toLocaleString(lang === "en" ? "en-US" : "ru-RU");

  const typeLabel = (key: string) =>
    (t.cards_page.types as Record<string, string>)[key] ?? key;

  const handleBuy = (card: ClubCard) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 md:pt-40 pb-28 min-h-dvh" style={{ background: "var(--bg)" }}>
        <div className="container mx-auto px-4 md:px-6">

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow eyebrow--center mb-6">{t.cards_page.eyebrow}</span>
            <h1 className="display-1 text-balance mt-5" style={{ color: "var(--text)" }}>
              {t.cards_page.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {t.cards_page.subtitle}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[2rem] h-[580px] animate-pulse" style={{ background: "var(--surface-el)" }} />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-32" style={{ color: "var(--text-faint)" }}>
              <CreditCard size={44} className="mx-auto mb-4 opacity-40" />
              <p>{t.cards_page.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {cards.map((card, idx) => {
                const popular = card.is_popular;
                return (
                  <Reveal key={card.id} delay={idx * 80} className="h-full">
                    <div
                      className="relative rounded-[2rem] overflow-hidden flex flex-col h-full transition-transform duration-500 hover:-translate-y-1"
                      style={{
                        background: popular ? "#0d0a0a" : "var(--surface)",
                        border: popular
                          ? "1px solid rgba(220,38,38,0.35)"
                          : "1px solid var(--border)",
                        boxShadow: popular
                          ? "0 32px 64px -20px rgba(220,38,38,0.35)"
                          : "0 8px 32px -12px rgba(0,0,0,0.08)",
                      }}
                    >
                      {/* ── Обложка с изображением ── */}
                      <div className="relative h-52 shrink-0 overflow-hidden">
                        {card.image_url ? (
                          <Image
                            src={card.image_url}
                            alt={card.name}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{
                              background: popular
                                ? "linear-gradient(135deg, #1a0505 0%, #3d0808 50%, #1a0505 100%)"
                                : "linear-gradient(135deg, var(--surface-el) 0%, var(--surface) 100%)",
                            }}
                          >
                            <CreditCard
                              size={64}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
                              style={{ color: popular ? "#ef4444" : "var(--accent)" }}
                            />
                          </div>
                        )}

                        {/* Градиент поверх изображения снизу */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: popular
                              ? "linear-gradient(to bottom, rgba(13,10,10,0) 30%, rgba(13,10,10,0.95) 100%)"
                              : "linear-gradient(to bottom, transparent 30%, var(--surface) 100%)",
                          }}
                        />

                        {/* Лейбл типа карты — поверх изображения */}
                        <div className="absolute bottom-4 left-5 flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                            style={{
                              background: popular ? "rgba(220,38,38,0.25)" : "rgba(0,0,0,0.35)",
                              color: popular ? "#ff6b6b" : "rgba(255,255,255,0.85)",
                              backdropFilter: "blur(8px)",
                              border: popular ? "1px solid rgba(220,38,38,0.4)" : "1px solid rgba(255,255,255,0.15)",
                            }}
                          >
                            {typeLabel(card.card_type_label)}
                          </span>
                        </div>

                        {/* Бейдж "Популярное" */}
                        {popular && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full text-white"
                              style={{ background: "var(--accent)", boxShadow: "0 4px 12px rgba(220,38,38,0.5)" }}>
                              <Star size={10} className="fill-white" />
                              {t.cards_page.popular}
                            </span>
                          </div>
                        )}

                        {/* Красный блик для популярной */}
                        {popular && (
                          <div
                            className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
                            style={{ background: "rgba(220,38,38,0.35)" }}
                          />
                        )}
                      </div>

                      {/* ── Тело карточки ── */}
                      <div className="flex flex-col flex-1 px-7 pb-7 pt-5">

                        {/* Название */}
                        <h3
                          className="font-display text-2xl font-bold mb-2 leading-tight"
                          style={{ color: popular ? "#fff" : "var(--text)" }}
                        >
                          {card.name}
                        </h3>

                        {/* Описание */}
                        {card.description && (
                          <p
                            className="text-sm leading-relaxed mb-5 line-clamp-3"
                            style={{ color: popular ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}
                          >
                            {stripHtml(card.description)}
                          </p>
                        )}

                        {/* Цена */}
                        <div className="mb-6">
                          {card.old_price && (
                            <div
                              className="text-sm line-through mb-0.5"
                              style={{ color: popular ? "rgba(255,255,255,0.3)" : "var(--text-faint)" }}
                            >
                              {formatPrice(card.old_price)} {t.cards_page.currency}
                            </div>
                          )}
                          <div className="flex items-end gap-2">
                            <span
                              className="font-display text-[2.6rem] font-black leading-none tabular-nums"
                              style={{ color: popular ? "#fff" : "var(--text)" }}
                            >
                              {formatPrice(card.price)}
                            </span>
                            <span
                              className="text-sm mb-1.5 font-medium"
                              style={{ color: popular ? "rgba(255,255,255,0.4)" : "var(--text-faint)" }}
                            >
                              {t.cards_page.currency}
                            </span>
                          </div>
                        </div>

                        {/* Фичи */}
                        {card.features.length > 0 && (
                          <>
                            <div
                              className="h-px mb-5"
                              style={{ background: popular ? "rgba(255,255,255,0.08)" : "var(--border)" }}
                            />
                            <ul className="space-y-2.5 mb-7 flex-1">
                              {card.features.map((f) => (
                                <li
                                  key={f.id}
                                  className="flex items-start gap-3 text-sm"
                                  style={{ color: popular ? "rgba(255,255,255,0.75)" : "var(--text-muted)" }}
                                >
                                  <span
                                    className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                                    style={{
                                      background: popular ? "rgba(220,38,38,0.2)" : "rgba(220,38,38,0.1)",
                                      border: "1px solid rgba(220,38,38,0.3)",
                                    }}
                                  >
                                    <Check size={10} className="text-[#ef4444]" />
                                  </span>
                                  <span>{f.text}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        {/* Кнопка */}
                        <button
                          onClick={() => handleBuy(card)}
                          className={`mt-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                            popular
                              ? "text-white hover:opacity-90 active:scale-[0.98]"
                              : "hover:opacity-80 active:scale-[0.98]"
                          }`}
                          style={
                            popular
                              ? { background: "var(--accent)", boxShadow: "0 8px 24px rgba(220,38,38,0.4)" }
                              : { background: "var(--surface-el)", color: "var(--text)", border: "1px solid var(--border)" }
                          }
                        >
                          {popular && <Zap size={15} className="fill-white" />}
                          {t.cards_page.buy}
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs mt-14" style={{ color: "var(--text-faint)" }}>
            {t.cards_page.note}
          </p>
        </div>
      </main>
      <Footer />

      <LeadModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedCard(null); }}
        sourcePage="cards"
        relatedCardId={selectedCard?.id}
        preTitle={selectedCard ? `${t.cards_page.buy}: ${selectedCard.name}` : t.cards_page.buy}
      />
    </>
  );
}
