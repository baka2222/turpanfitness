"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LeadModal from "@/components/ui/LeadModal";
import Reveal from "@/components/ui/Reveal";
import type { Trainer, Specialization } from "@/types";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { stripHtml } from "@/lib/html";
import { Award, Filter, X, Trophy, CalendarCheck } from "lucide-react";

/* ─── Аватар (карточки) ───────────────────────────────────── */
function Avatar({ person, className = "" }: { person: Trainer; className?: string }) {
  if (!person.photo_url) {
    return (
      <div className="aspect-[3/4] flex items-center justify-center rounded-2xl" style={{ background: "var(--surface-el)" }}>
        <span className="font-display font-bold text-4xl" style={{ color: "var(--accent)" }}>{person.name[0]}</span>
      </div>
    );
  }
  return (
    <Image
      src={person.photo_url}
      alt={person.name}
      width={0}
      height={0}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      className={`w-full h-auto ${className}`}
    />
  );
}

/* ─── Фото в модалке (правая колонка, без кропа) ─────────── */
function ModalPhoto({ person }: { person: Trainer }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#0d0a0a" }}>
      {person.photo_url ? (
        <Image
          src={person.photo_url}
          alt={person.name}
          fill
          className="object-contain object-center"
        />
      ) : (
        <span className="font-display font-bold text-5xl" style={{ color: "var(--accent)" }}>{person.name[0]}</span>
      )}
    </div>
  );
}

/* ─── Модалка тренера ─────────────────────────────────────── */
function TrainerModal({ trainer, onClose, onBook }: {
  trainer: Trainer; onClose: () => void; onBook: () => void;
}) {
  const [tab, setTab] = useState<"desc" | "book">("desc");
  const { t } = useLang();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-3xl rounded-t-[2rem] md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", height: "min(680px, 92dvh)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: "var(--surface-el)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <X size={17} />
        </button>

        {/* Левая часть — контент */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <div className="md:hidden relative shrink-0 h-48 rounded-t-[2rem] overflow-hidden">
            <ModalPhoto person={trainer} />
          </div>
          {/* Шапка с именем и табами */}
          <div className="px-7 pt-7 pb-0 shrink-0">
            <p className="font-display text-2xl font-bold leading-tight" style={{ color: "var(--text)" }}>
              {trainer.name.toUpperCase()}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{trainer.position}</p>

            {/* Табы */}
            <div className="flex gap-6 mt-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => setTab("desc")}
                className="text-sm font-semibold pb-3 border-b-2 -mb-px transition-colors"
                style={{
                  color: tab === "desc" ? "var(--text)" : "var(--text-faint)",
                  borderColor: tab === "desc" ? "var(--accent)" : "transparent",
                }}
              >
                {t.trainers_page.tab_desc}
              </button>
              <button
                onClick={() => setTab("book")}
                className="text-sm font-semibold pb-3 border-b-2 -mb-px transition-colors"
                style={{
                  color: tab === "book" ? "var(--text)" : "var(--text-faint)",
                  borderColor: tab === "book" ? "var(--accent)" : "transparent",
                }}
              >
                {t.trainers_page.tab_book}
              </button>
            </div>
          </div>

          {/* Вкладка — описание */}
          {tab === "desc" && (
            <div
              className="overflow-y-auto overflow-x-hidden flex-1 px-7 py-6 space-y-5"
              style={{ overscrollBehavior: "contain" }}
            >
              {trainer.experience_years != null && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(220,38,38,0.1)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.22)" }}
                >
                  <Award size={12} />{trainer.experience_years} {t.trainers_page.exp}
                </span>
              )}

              {trainer.description ? (
                <div
                  className="cms-content text-sm"
                  dangerouslySetInnerHTML={{ __html: trainer.description }}
                />
              ) : (
                <p className="text-sm" style={{ color: "var(--text-faint)" }}>{t.trainers_page.no_desc}</p>
              )}

              {trainer.achievements.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "var(--text-faint)" }}>
                    {t.trainers_page.achievements}
                  </p>
                  <ul className="space-y-2.5">
                    {trainer.achievements.map((a) => (
                      <li key={a.id} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                        <Trophy size={14} className="text-[#ef4444] shrink-0 mt-0.5" />
                        <span>{stripHtml(a.text)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Вкладка — запись */}
          {tab === "book" && (
            <div className="flex flex-1 flex-col items-center justify-center px-7 py-10 gap-5">
              <CalendarCheck size={44} style={{ color: "var(--accent)", opacity: 0.5 }} />
              <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
                {t.trainers_page.book_prompt} {trainer.name}
              </p>
              <button onClick={onBook} className="btn btn-primary w-full max-w-xs">
                <CalendarCheck size={16} />
                {t.trainers_page.book_submit}
              </button>
            </div>
          )}
        </div>

        {/* Правая часть — фото (только десктоп) */}
        <div
          className="hidden md:block shrink-0 relative rounded-r-[2rem] overflow-hidden"
          style={{ background: "#0d0a0a", width: "62%" }}
        >
          <ModalPhoto person={trainer} />
        </div>
      </div>
    </div>
  );
}

/* ─── Карточка тренера ────────────────────────────────────── */
function TrainerCard({ trainer, onOpen }: { trainer: Trainer; onOpen: () => void }) {
  const { t } = useLang();
  return (
    <div className="group cursor-pointer" onClick={onOpen}>
      {/* Фото */}
      <div className="relative rounded-2xl overflow-hidden mb-3">
        <Avatar
          person={trainer}
          className="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {/* Кнопка */}
        <div
          className="absolute inset-x-0 bottom-0 p-3.5"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }}
        >
          <div
            className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold text-center uppercase tracking-wide"
            style={{ background: "var(--accent)" }}
          >
            {t.trainers_page.tab_book}
          </div>
        </div>
      </div>

      {/* Имя и должность */}
      <h3 className="font-semibold text-base leading-tight" style={{ color: "var(--text)" }}>{trainer.name}</h3>
      <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{trainer.position}</p>
      {trainer.experience_years != null && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-faint)" }}>
          <Award size={10} className="text-[#ef4444]" />{trainer.experience_years} {t.trainers_page.exp}
        </p>
      )}
    </div>
  );
}

/* ─── Карточка сотрудника ─────────────────────────────────── */
function StaffCard({ person, onOpen }: { person: Trainer; onOpen: () => void }) {
  const hasDesc = Boolean(person.description?.trim());

  return (
    <div
      className="group cursor-pointer"
      onClick={hasDesc ? onOpen : undefined}
      style={{ cursor: hasDesc ? "pointer" : "default" }}
    >
      {/* Фото */}
      <div className="relative rounded-2xl overflow-hidden mb-3">
        <Avatar
          person={person}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <h4 className="font-semibold text-base leading-tight" style={{ color: "var(--text)" }}>{person.name}</h4>
      <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{person.position}</p>
    </div>
  );
}

/* ─── Модалка сотрудника ──────────────────────────────────── */
function StaffModal({ person, onClose }: { person: Trainer; onClose: () => void }) {
  const { t } = useLang();
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-2xl rounded-t-[2rem] md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", height: "min(600px, 88dvh)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: "var(--surface-el)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <X size={17} />
        </button>

        {/* Контент */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <div className="md:hidden relative shrink-0 h-48 rounded-t-[2rem] overflow-hidden">
            <ModalPhoto person={person} />
          </div>
          <div className="px-7 pt-7 pb-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>
              {person.name.toUpperCase()}
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--accent)" }}>{person.position}</p>
          </div>
          <div
            className="overflow-y-auto overflow-x-hidden flex-1 px-7 py-6"
            style={{ overscrollBehavior: "contain" }}
          >
            {person.description ? (
              <div className="cms-content text-sm" dangerouslySetInnerHTML={{ __html: person.description }} />
            ) : (
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>{t.trainers_page.no_desc}</p>
            )}
          </div>
        </div>

        {/* Фото справа */}
        <div
          className="hidden md:block shrink-0 relative rounded-r-[2rem] overflow-hidden"
          style={{ background: "#0d0a0a", width: "62%" }}
        >
          <ModalPhoto person={person} />
        </div>
      </div>
    </div>
  );
}

/* ─── Заголовок секции ────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <h2
        className="text-sm font-bold uppercase tracking-[0.22em] shrink-0"
        style={{ color: "var(--text)" }}
      >
        {children}
      </h2>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

/* ─── Страница ────────────────────────────────────────────── */
export default function TrainersPage() {
  const { t, lang } = useLang();
  const [allStaff, setAllStaff] = useState<Trainer[]>([]);
  const [specs, setSpecs] = useState<Specialization[]>([]);
  const [activeSpec, setActiveSpec] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalTrainer, setModalTrainer] = useState<Trainer | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadTrainer, setLeadTrainer] = useState<Trainer | null>(null);
  const [staffModal, setStaffModal] = useState<Trainer | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.trainers(lang, { coaches_only: "false" }),
      api.specializations(lang),
    ])
      .then(([staff, s]) => { setAllStaff(staff); setSpecs(s); })
      .catch(() => { setAllStaff([]); setSpecs([]); })
      .finally(() => setLoading(false));
  }, [lang]);

  const groupByCategory = (list: Trainer[]) => {
    const map = new Map<string, Trainer[]>();
    for (const p of list) {
      const key = p.category_name || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  };

  const coaches = allStaff.filter((p) => p.is_coach);
  const otherStaff = allStaff.filter((p) => !p.is_coach);

  const filteredCoaches = activeSpec
    ? coaches.filter((tr) => tr.specializations.some((s) => s.id === activeSpec))
    : coaches;

  const coachGroups = groupByCategory(filteredCoaches);
  const staffGroups = groupByCategory(otherStaff);

  const handleBook = (trainer: Trainer) => {
    setModalTrainer(null);
    setLeadTrainer(trainer);
    setLeadOpen(true);
  };

  const pillActive = { background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" };
  const pillIdle = { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" };

  return (
    <>
      <Navbar />
      <main className="pt-28 md:pt-36 pb-24 min-h-dvh" style={{ background: "var(--bg)" }}>
        <div className="container mx-auto px-4 md:px-6">

          {/* Заголовок страницы */}
          <div className="max-w-2xl mb-10">
            <span className="eyebrow mb-5">{t.trainers_page.eyebrow}</span>
            <h1 className="display-1 text-balance mt-4" style={{ color: "var(--text)" }}>
              {t.trainers_page.title}
            </h1>
          </div>

          {/* Фильтры по специализациям */}
          {!loading && specs.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-10">
              <div className="flex items-center gap-2 text-xs font-medium mr-1" style={{ color: "var(--text-faint)" }}>
                <Filter size={13} /><span>{t.trainers_page.filter}:</span>
              </div>
              <button
                onClick={() => setActiveSpec(null)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={activeSpec === null ? pillActive : pillIdle}
              >
                {t.trainers_page.all}
              </button>
              {specs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSpec(s.id === activeSpec ? null : s.id)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={activeSpec === s.id ? pillActive : pillIdle}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Скелетон */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="rounded-2xl animate-pulse" style={{ aspectRatio: "3/4", background: "var(--surface-el)" }} />
                  <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "var(--surface-el)" }} />
                  <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: "var(--surface-el)" }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ─── Тренеры — по категориям ─── */}
              {coachGroups.size > 0
                ? [...coachGroups.entries()].map(([catName, trainers]) => (
                  <section key={catName} className="mb-16">
                    <Reveal>
                      <SectionTitle>{catName}</SectionTitle>
                    </Reveal>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                      {trainers.map((tr, idx) => (
                        <Reveal key={tr.id} delay={(idx % 5) * 50}>
                          <TrainerCard trainer={tr} onOpen={() => setModalTrainer(tr)} />
                        </Reveal>
                      ))}
                    </div>
                  </section>
                ))
                : activeSpec && (
                  <div className="text-center py-20 mb-16" style={{ color: "var(--text-faint)" }}>
                    <Award size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">{t.trainers_page.empty}</p>
                  </div>
                )
              }

              {/* ─── Остальной персонал — по категориям ─── */}
              {[...staffGroups.entries()].map(([catName, persons]) => (
                <section key={catName} className="mb-16">
                  <Reveal>
                    <SectionTitle>{catName}</SectionTitle>
                  </Reveal>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                    {persons.map((person, idx) => (
                      <Reveal key={person.id} delay={(idx % 5) * 50}>
                        <StaffCard person={person} onOpen={() => setStaffModal(person)} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </main>
      <Footer />

      {modalTrainer && (
        <TrainerModal
          trainer={modalTrainer}
          onClose={() => setModalTrainer(null)}
          onBook={() => handleBook(modalTrainer)}
        />
      )}

      {staffModal && (
        <StaffModal person={staffModal} onClose={() => setStaffModal(null)} />
      )}

      <LeadModal
        open={leadOpen}
        onClose={() => { setLeadOpen(false); setLeadTrainer(null); }}
        sourcePage="trainers"
        relatedTrainerId={leadTrainer?.id}
        preTitle={leadTrainer ? `${t.trainers_page.book}: ${leadTrainer.name}` : t.trainers_page.book}
      />
    </>
  );
}
