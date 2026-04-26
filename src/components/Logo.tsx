// Crisp inline ROI Labs wordmark. No image, no background — uses currentColor
// so callers control ink via parent CSS. Scales on the `size` prop (the pixel
// height of the ROI serif glyphs); everything else is derived.

type Props = {
  className?: string;
  size?: number;
};

export default function Logo({ className = "", size = 30 }: Props) {
  const bracketH = size * 1.15;
  const bracketW = size * 0.3;
  const bracketStroke = Math.max(1.5, size * 0.055);
  const gap = size * 0.12;
  const labsSize = size * 0.3;
  const labsSpacing = labsSize * 0.55;
  const labsTop = size * 0.12;

  return (
    <span
      className={`inline-flex flex-col items-center leading-none select-none ${className}`}
      aria-label="ROI Labs"
    >
      {/* Top line: [  ROI  ] */}
      <span
        className="inline-flex items-center"
        style={{ gap, lineHeight: 1 }}
      >
        <Bracket width={bracketW} height={bracketH} stroke={bracketStroke} side="left" />
        <span
          style={{
            fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, 'Times New Roman', serif",
            fontSize: size * 1.15,
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: "currentColor",
          }}
        >
          ROI
        </span>
        <Bracket width={bracketW} height={bracketH} stroke={bracketStroke} side="right" />
      </span>

      {/* Bottom line: L A B S */}
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

function Bracket({
  width,
  height,
  stroke,
  side,
}: {
  width: number;
  height: number;
  stroke: number;
  side: "left" | "right";
}) {
  // Inset by half-stroke so the line doesn't clip on the SVG edges
  const half = stroke / 2;
  const points =
    side === "left"
      ? `${width - half},${half} ${half},${half} ${half},${height - half} ${width - half},${height - half}`
      : `${half},${half} ${width - half},${half} ${width - half},${height - half} ${half},${height - half}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
    >
      <polyline points={points} />
    </svg>
  );
}
