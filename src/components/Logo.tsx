// ROI Labs wordmark — PNG with invert filter so the cream-backed asset
// flips to white-on-black, blending into the dark site background.

type Props = {
  className?: string;
  size?: number;
};

export default function Logo({ className = "", size = 44 }: Props) {
  const aspect = 297 / 246;
  const width = Math.round(size * aspect);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/roi-logo.png"
      alt="ROI Labs"
      width={width}
      height={size}
      className={className}
      style={{ height: size, width: "auto", filter: "invert(1) brightness(1.08)" }}
    />
  );
}
