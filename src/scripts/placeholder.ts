import sharp from "sharp";

// Clean, mostly-navy placeholders. Blue is the primary; red is a restrained
// accent; green/gold are used only as thin, subtle details.
const BASES: Record<string, string> = {
  navy: "#232E7D",
  red: "#1c246b", // still navy-dominant; "red" variants get a red accent bar
  green: "#20286f",
  mixed: "#232E7D",
  dark: "#1a2260",
};
const ACCENTS: Record<string, string> = {
  navy: "#E30613",
  red: "#E30613",
  green: "#009640",
  mixed: "#E30613",
  dark: "#E30613",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Clean navy placeholder: subtle emblem + thin red accent + label. No busy gradients. */
export async function makePlaceholder(
  width: number,
  height: number,
  label: string,
  variant: keyof typeof BASES = "navy",
): Promise<Buffer> {
  const base = BASES[variant];
  const accent = ACCENTS[variant];
  const fontSize = Math.round(Math.min(width, height) / 14);
  const cx = width / 2;
  const cy = height / 2;
  const emblem = Math.min(width, height) / 7;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="${base}"/>
    <!-- faint tonal band, single hue -->
    <rect width="${width}" height="${height}" fill="#ffffff" opacity="0.03"/>
    <rect x="0" y="0" width="${width}" height="4" fill="${accent}"/>
    <!-- restrained emblem: navy roundel + small accent star -->
    <circle cx="${cx}" cy="${cy - fontSize}" r="${emblem}" fill="#ffffff" opacity="0.06"/>
    <path d="${star(cx, cy - fontSize, emblem * 0.5)}" fill="#ffffff" opacity="0.5"/>
    <text x="${cx}" y="${cy + emblem + fontSize}" font-family="Arial, sans-serif" font-size="${fontSize}"
      font-weight="700" letter-spacing="1" fill="#FFFFFF" text-anchor="middle" opacity="0.9">${esc(label)}</text>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function star(cx: number, cy: number, s: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s : s / 2.4;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Member logo placeholder — navy roundel, clean. */
export async function makeLogo(name: string): Promise<Buffer> {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
    <rect width="300" height="150" fill="#FFFFFF"/>
    <rect x="8" y="8" width="284" height="134" rx="10" fill="#F5F7FA"/>
    <circle cx="150" cy="60" r="34" fill="#232E7D"/>
    <text x="150" y="72" font-family="Arial, sans-serif" font-size="30" font-weight="800"
      fill="#FFFFFF" text-anchor="middle">${esc(initials)}</text>
    <text x="150" y="120" font-family="Arial, sans-serif" font-size="17" font-weight="700"
      fill="#1A1D24" text-anchor="middle">${esc(name.slice(0, 24))}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Portrait avatar — navy, clean (red/green only as a thin base line). */
export async function makeAvatar(name: string, variant: "navy" | "red" | "green" = "navy"): Promise<Buffer> {
  const line = { navy: "#232E7D", red: "#E30613", green: "#009640" }[variant];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="480">
    <rect width="440" height="480" fill="#232E7D"/>
    <circle cx="220" cy="185" r="95" fill="#FFFFFF" opacity="0.10"/>
    <text x="220" y="215" font-family="Arial, sans-serif" font-size="90" font-weight="800"
      fill="#FFFFFF" text-anchor="middle" opacity="0.85">${esc(initials)}</text>
    <rect x="0" y="474" width="440" height="6" fill="${line}"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
