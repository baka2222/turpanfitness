"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

interface Props {
  open: boolean;
  onClose: () => void;
  sourcePage?: string;
  relatedTrainerId?: number;
  relatedCardId?: number;
  relatedSectionId?: number;
  preTitle?: string;
}

export default function LeadModal({
  open,
  onClose,
  sourcePage,
  relatedTrainerId,
  relatedCardId,
  relatedSectionId,
  preTitle,
}: Props) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setName(""); setPhone(""); setComment("");
      setSuccess(false); setError("");
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.submitLead({
        name, phone, comment,
        source_page: sourcePage,
        related_trainer_id: relatedTrainerId,
        related_card_id: relatedCardId,
        related_section_id: relatedSectionId,
      });
      setSuccess(true);
    } catch {
      setError(t.modal.error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90dvh] overflow-y-auto"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        <button
          onClick={onClose}
          className="t-close-btn absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-all"
          style={{ color: "var(--text-faint)" }}
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle size={56} className="mx-auto text-[#dc2626] mb-4" />
            <h3 className="font-display text-2xl font-semibold mb-2" style={{ color: "var(--text)" }}>
              {t.modal.success_title}
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              {t.modal.success_desc}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#dc2626] hover:bg-[#b91c1c] rounded-full text-sm font-semibold text-white transition-colors"
            >
              {t.modal.success_btn}
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-2xl font-semibold mb-1" style={{ color: "var(--text)" }}>
              {preTitle ?? t.modal.title}
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              {t.modal.desc}
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" htmlFor="lead-name" style={{ color: "var(--text-muted)" }}>
                  {t.modal.name_label} <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.modal.name_placeholder}
                  className="input-themed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" htmlFor="lead-phone" style={{ color: "var(--text-muted)" }}>
                  {t.modal.phone_label} <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.modal.phone_placeholder}
                  className="input-themed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" htmlFor="lead-comment" style={{ color: "var(--text-muted)" }}>
                  {t.modal.comment_label}
                </label>
                <textarea
                  id="lead-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.modal.comment_placeholder}
                  className="input-themed resize-none"
                />
              </div>

              {error && (
                <p className="text-[#ef4444] text-xs px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? t.modal.submitting : t.modal.submit}
              </button>

              <p className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
                {t.modal.privacy}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
