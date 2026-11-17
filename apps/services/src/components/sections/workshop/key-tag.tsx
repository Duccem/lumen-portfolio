/**
 * The numbered key tag that hangs on every customer's keys: the site's one drawn object.
 * Flat shapes in the palette's own colours, the number set in the text face.
 */
export function KeyTag({
  id,
  tone = "crimson",
  className = "",
  swing = false,
  label = "Bay Seven",
}: {
  id: string;
  tone?: "crimson" | "paper" | "dark";
  className?: string;
  swing?: boolean;
  label?: string;
}) {
  const fill = tone === "crimson" ? "var(--accent)" : tone === "paper" ? "var(--field-1)" : "var(--surface-3)";
  const ink = tone === "paper" ? "var(--field-1-ink)" : "var(--ink)";
  const [prefix, digits] = id.includes("-") ? id.split("-") : ["", id];

  return (
    <svg
      viewBox="0 0 200 330"
      className={`${swing ? "tag-swing" : ""} ${className}`}
      role="img"
      aria-label={`Key tag number ${id}`}
    >
      {/* split ring */}
      <circle cx="100" cy="34" r="26" fill="none" stroke="var(--mid)" strokeWidth="6" />
      {/* tag body: a rectangle with a rounded head */}
      <path d="M30 120 a70 70 0 0 1 140 0 V300 a22 22 0 0 1 -22 22 H52 a22 22 0 0 1 -22 -22 Z" fill={fill} />
      {/* eyelet */}
      <circle cx="100" cy="92" r="14" fill="var(--bg)" />
      <circle cx="100" cy="92" r="14" fill="none" stroke={ink} strokeOpacity="0.25" strokeWidth="4" />
      <text x="100" y="168" textAnchor="middle" fill={ink} fontSize="22" fontFamily="var(--ff-text)" opacity="0.8">
        {label}
      </text>
      <text x="100" y="234" textAnchor="middle" fill={ink} fontSize="44" fontWeight="500" fontFamily="var(--ff-text)" style={{ fontVariantNumeric: "tabular-nums" }}>
        {digits}
      </text>
      {prefix ? (
        <text x="100" y="282" textAnchor="middle" fill={ink} fontSize="24" fontFamily="var(--ff-text)" opacity="0.8">
          {prefix}
        </text>
      ) : null}
    </svg>
  );
}
