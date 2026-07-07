"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LeadModal from "@/components/ui/LeadModal";
import type { ScheduleSession } from "@/types";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { Clock, User, MapPin, X, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, BanIcon } from "lucide-react";

function getDatesForWeek(weekOffset: number): Date[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatWeekRange(dates: Date[], monthsShort: readonly string[]): string {
  const first = dates[0];
  const last = dates[6];
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} ${monthsShort[first.getMonth()]} ${first.getFullYear()}`;
  }
  return `${first.getDate()} ${monthsShort[first.getMonth()]} – ${last.getDate()} ${monthsShort[last.getMonth()]} ${last.getFullYear()}`;
}

export default function SchedulePage() {
  const { t, lang } = useLang();
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [leadModal, setLeadModal] = useState(false);

  const week = getDatesForWeek(weekOffset);

  useEffect(() => {
    setLoading(true);
    api.schedule(lang, { week_offset: String(weekOffset) })
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [lang, weekOffset]);

  const today = new Date();
  const todayDow = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const getSessionsForDay = (dayIndex: number) =>
    sessions
      .filter((s) => s.day_of_week === dayIndex)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const weekRange = formatWeekRange(week, t.schedule_page.months_short);

  return (
    <>
      <Navbar />
      <main className="pt-32 md:pt-40 pb-24 min-h-dvh" style={{ background: "var(--bg)" }}>
        <div className="container mx-auto px-4 md:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
                style={{ borderColor: "var(--border)", background: "var(--surface-el)" }}>
                <CalendarDays size={14} className="text-[var(--accent)]" />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text)" }}>
                  {t.schedule_page.eyebrow}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight" style={{ color: "var(--text)" }}>
                {t.schedule_page.title}
              </h1>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-x-0.5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">{t.schedule_page.prev_week}</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{weekRange}</span>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs font-bold px-3 py-1 rounded-full transition-all"
                  style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent)", border: "1px solid rgba(220,38,38,0.25)" }}
                >
                  {t.schedule_page.today}
                </button>
              )}
            </div>

            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-x-0.5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <span className="hidden sm:inline">{t.schedule_page.next_week}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="relative border rounded-3xl overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="overflow-x-auto pb-4 md:pb-0">
              <div className="min-w-[900px] grid grid-cols-7 divide-x" style={{ borderColor: "var(--border)" }}>
                {week.map((date, i) => {
                  const isToday = weekOffset === 0 && i === todayDow;
                  const daySessions = getSessionsForDay(i);

                  return (
                    <div key={i} className="flex flex-col h-full min-h-[560px]" style={{ background: "var(--bg)" }}>

                      {/* Day header */}
                      <div
                        className="sticky top-0 z-10 flex flex-col items-center py-4 border-b"
                        style={{
                          borderColor: "var(--border)",
                          background: isToday ? "rgba(220,38,38,0.06)" : "var(--bg)",
                        }}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-1"
                          style={{ color: isToday ? "var(--accent)" : "var(--text-faint)" }}>
                          {t.schedule_page.days_short[date.getDay()]}
                        </span>
                        <div className={`w-9 h-9 flex items-center justify-center rounded-full text-base font-black ${
                          isToday ? "text-white shadow-lg" : ""
                        }`}
                          style={isToday ? { background: "var(--accent)" } : { color: "var(--text)" }}>
                          {date.getDate()}
                        </div>
                      </div>

                      {/* Sessions */}
                      <div className="flex-1 p-2 space-y-2">
                        {loading ? (
                          Array.from({ length: 2 }).map((_, idx) => (
                            <div key={idx} className="w-full h-20 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
                          ))
                        ) : daySessions.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center py-8 opacity-30">
                            <div className="w-6 h-px mb-2" style={{ background: "var(--border)" }} />
                            <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>—</span>
                          </div>
                        ) : (
                          daySessions.map((s) => (
                            <button
                              key={`${s.slot_id}-${s.date}`}
                              onClick={() => !s.is_cancelled && setSelectedSession(s)}
                              className={`w-full text-left rounded-xl p-3 transition-all duration-200 ${
                                s.is_cancelled
                                  ? "cursor-default opacity-60"
                                  : "hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                              }`}
                              style={{
                                background: s.is_cancelled ? "var(--surface-el)" : "var(--surface)",
                                border: `1px solid ${s.is_cancelled ? "rgba(220,38,38,0.2)" : "var(--border)"}`,
                              }}
                            >
                              {/* Cancelled badge */}
                              {s.is_cancelled && (
                                <div className="flex items-center gap-1 mb-1.5">
                                  <BanIcon size={10} className="text-red-500 shrink-0" />
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">
                                    {t.schedule_page.cancelled}
                                  </span>
                                </div>
                              )}

                              {/* Time */}
                              <div className="font-bold text-xs mb-1.5"
                                style={{ color: s.is_cancelled ? "var(--text-faint)" : "var(--text)" }}>
                                {s.start_time.slice(0, 5)}
                                {s.end_time && <span className="font-normal opacity-60"> – {s.end_time.slice(0, 5)}</span>}
                              </div>

                              {/* Name */}
                              <h3 className={`font-semibold text-xs leading-snug mb-2 ${
                                s.is_cancelled ? "line-through opacity-60" : "group-hover:text-[var(--accent)]"
                              }`}
                                style={{ color: "var(--text)" }}>
                                {s.section_name}
                              </h3>

                              {/* Reason */}
                              {s.is_cancelled && s.cancel_reason && (
                                <p className="text-[10px] mb-2 leading-tight" style={{ color: "var(--text-faint)" }}>
                                  {s.cancel_reason}
                                </p>
                              )}

                              {/* Coach + Zone */}
                              {!s.is_cancelled && (
                                <div className="flex flex-col gap-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                                  <span className="flex items-center gap-1 truncate">
                                    <User size={10} className="shrink-0 opacity-60" />
                                    {s.coach.name}
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <MapPin size={10} className="shrink-0 opacity-60" />
                                    {s.zone.name}
                                  </span>
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Session detail modal */}
      {selectedSession && !selectedSession.is_cancelled && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSession(null); }}
        >
          <div className="absolute inset-0" style={{ background: "rgba(8,8,8,0.6)", backdropFilter: "blur(6px)" }} />
          <div
            className="relative w-full max-w-md rounded-3xl p-8"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(8,8,8,0.25)" }}
          >
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-[var(--surface-el)]"
              style={{ color: "var(--text-faint)" }}
            >
              <X size={18} />
            </button>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: selectedSession.category.color + "1A", color: selectedSession.category.color }}
            >
              {selectedSession.category.name}
            </div>
            <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: "var(--text)" }}>
              {selectedSession.section_name}
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
              {selectedSession.section_description}
            </p>

            <div className="space-y-3 mb-7 p-4 rounded-2xl border" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--text)" }}>
                <Clock size={16} className="text-[var(--accent)]" />
                <span>{selectedSession.start_time.slice(0, 5)} – {selectedSession.end_time.slice(0, 5)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--text)" }}>
                <User size={16} className="text-[var(--accent)]" />
                <span>{selectedSession.coach.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--text)" }}>
                <MapPin size={16} className="text-[var(--accent)]" />
                <span>{selectedSession.zone.name}</span>
              </div>
            </div>

            <button onClick={() => setLeadModal(true)} className="btn btn-primary w-full shadow-lg shadow-[var(--accent)]/20">
              {t.schedule_page.book_session}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <LeadModal
        open={leadModal}
        onClose={() => { setLeadModal(false); setSelectedSession(null); }}
        sourcePage="schedule"
        relatedSectionId={selectedSession?.section_id}
        preTitle={selectedSession ? `${t.schedule_page.book}: ${selectedSession.section_name}` : t.schedule_page.book}
      />

      <Footer />
    </>
  );
}
