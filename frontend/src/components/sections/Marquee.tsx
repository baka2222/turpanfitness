/* Brand value marquee — presentational, words passed in (i18n) */
export default function Marquee({ items }: { items: readonly string[] }) {
  const Track = () => (
    <div className="marquee__track" aria-hidden="true">
      {items.map((word, i) => (
        <span key={i} className="flex items-center gap-12">
          <span
            className="font-display font-semibold tracking-tight whitespace-nowrap"
            style={{ fontSize: "clamp(1.5rem,3vw,2.6rem)", color: "rgba(255,255,255,0.92)" }}
          >
            {word}
          </span>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
        </span>
      ))}
    </div>
  );

  return (
    <section
      className="surface-dark relative overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="marquee py-7 md:py-9">
        <Track />
        <Track />
      </div>
      {/* edge fades */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-40 pointer-events-none" style={{ background: "linear-gradient(to right, var(--ink), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-24 md:w-40 pointer-events-none" style={{ background: "linear-gradient(to left, var(--ink), transparent)" }} />
    </section>
  );
}
