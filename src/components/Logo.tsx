// Wordmark-style ROI Labs logo built as inline HTML + SVG brackets.
// Uses currentColor so callers control ink via parent CSS (dark in light navbar,
// white in dark footer). No image file, no baked background.

type Props = {
  className?: string;
  size?: number;
};

export default function Logo({ className = "", size = 44 }: Props) {
  const roiSize = size * 0.82;
  const bracketWidth = size * 0.12;
  const bracketHeight = roiSize * 1.05;
  const labsSize = size * 0.22;

  return (
    <span
      className={`inline-flex flex-col items-center leading-none select-none ${className}`}
      style={{ color: "currentColor" }}
      aria-label="ROI Labs"
    >
      <span
        className="inline-flex items-center"
        style={{ gap: size * 0.14, lineHeight: 1 }}
      >
        <Bracket
          width={bracketWidth}
          height={bracketHeight}
          strokeWidth={Math.max(1.5, size * 0.035)}
          side="left"
        />
        <span
          style={{
            fontFamily: "'Times New Roman', Times, Georgia, serif",
            fontSize: roiSize,
            fontWeight: 400,
            letterSpacing: roiSize * 0.005,
            lineHeight: 1,
          }}
        >
          ROI
        </span>
        <Bracket
          width={bracketWidth}
          height={bracketHeight}
          strokeWidth={Math.max(1.5, size * 0.035)}
          side="right"
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-poppins), system-ui, sans-serif",
          fontSize: labsSize,
          fontWeight: 500,
          letterSpacing: labsSize * 0.5,
          marginTop: size * 0.14,
          marginLeft: labsSize * 0.5,
          textTransform: "uppercase",
          lineHeight: 1,
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
  strokeWidth,
  side,
}: {
  width: number;
  height: number;
  strokeWidth: number;
  side: "left" | "right";
}) {
  const points =
    side === "left"
      ? `${width},1 1,1 1,${height} ${width},${height}`
      : `0,1 ${width - 1},1 ${width - 1},${height} 0,${height}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden
    >
      <polyline points={points} strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}
