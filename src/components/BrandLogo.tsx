import Image from "next/image";

type BrandLogoProps = {
  variant?: "color" | "white";
  className?: string;
};

/**
 * Official AmCham Cameroon logo (public/logo.png). On the navy footer it sits
 * on a white rounded chip so the navy/red wordmark stays legible.
 */
export function BrandLogo({ variant = "color", className = "" }: BrandLogoProps) {
  const img = (
    <Image
      src="/logo-trimmed.png"
      alt="AmCham Cameroon — American Chamber of Commerce in Cameroon"
      width={483}
      height={408}
      priority
      className="h-full w-auto object-contain"
    />
  );

  if (variant === "white") {
    return (
      <span className={`inline-flex items-center rounded-xl bg-white p-2 shadow-sm ${className}`}>
        {img}
      </span>
    );
  }
  return <span className={`inline-flex items-center ${className}`}>{img}</span>;
}
