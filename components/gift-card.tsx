import { BrandLogo } from "@/components/brand-logo";
import { brandOf } from "@/lib/catalog";

export function GiftCard({ brand, value, region }: { brand: string; value?: number; region?: string }) {
  const info = brandOf(brand);
  const colorful = info.slug === "apple" || info.slug === "google-play";
  return (
    <div className={`gcard gcard--${info.slug}`} aria-hidden="true">
      <BrandLogo brand={info.slug} className="gcard-watermark" />
      <div className="gcard-top">
        <BrandLogo brand={info.slug} className="gcard-logo" multicolor={colorful} />
        {region ? <span className="gcard-tag">{region}</span> : null}
      </div>
      <div className="gcard-bottom">
        <div className="gcard-words">
          <span className="gcard-word">{info.word}</span>
          <span className="gcard-sub">{info.label}</span>
        </div>
        {value ? <span className="gcard-value">${value % 1 ? value.toFixed(2) : value}</span> : null}
      </div>
    </div>
  );
}
