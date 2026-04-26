// ROI Labs wordmark — uses the original asset (cropped to remove the brackets,
// background made transparent, ink remapped to white). The PNG is the exact
// font from the brand asset, so the logo matches the source material.
//
// `size` = pixel height of the wordmark (ROI + LABS combined).

type Props = {
  className?: string;
  size?: number;
};

const ASPECT = 144 / 98; // width / height of the tight-stack wordmark

export default function Logo({ className = "", size = 56 }: Props) {
  const width = Math.round(size * ASPECT);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/roi-logo.png"
      alt="ROI Labs"
      width={width}
      height={size}
      className={className}
      style={{ display: "block", height: size, width: "auto" }}
    />
  );
}
