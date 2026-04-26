// Crisp inline ROI Labs wordmark — no brackets, no background.
// Just the serif "ROI" with letter-spaced "LABS" beneath. Uses currentColor
// so callers control ink via parent CSS.

type Props = {
  className?: string;
  size?: number;
};

export default function Logo({ className = "", size = 30 }: Props) {
  const labsSize = size * 0.32;
  const labsSpacing = labsSize * 0.55;
  const labsTop = size * 0.12;

  return (
    <span
      className={`inline-flex flex-col items-center leading-none select-none ${className}`}
      aria-label="ROI Labs"
    >
      <span
        style={{
          fontFamily: "var(--font-logo-serif), 'DM Serif Display', Georgia, 'Times New Roman', serif",
          fontSize: size * 1.3,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "0",
          color: "currentColor",
        }}
      >
        ROI
      </span>
      <span
        style={{
          fontFamily: "var(--font-poppins), system-ui, sans-serif",
          fontSize: labsSize,
          fontWeight: 500,
          letterSpacing: labsSpacing,
          textIndent: labsSpacing,
          marginTop: labsTop,
          textTransform: "uppercase",
          lineHeight: 1,
          color: "currentColor",
        }}
      >
        Labs
      </span>
    </span>
  );
}
