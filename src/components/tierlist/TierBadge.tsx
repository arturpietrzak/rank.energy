"use client";

import { useTranslations } from "next-intl";
import type { TierSlug } from "@/types";

const TIER_STYLES: Record<TierSlug, { bg: string; text: string; glow: string }> = {
  "viking-berry": { bg: "bg-purple-700", text: "text-white", glow: "rgba(147,51,234,0.5)" },
  s: { bg: "bg-red-600", text: "text-white", glow: "rgba(239,68,68,0.5)" },
  a: { bg: "bg-orange-600", text: "text-white", glow: "rgba(249,115,22,0.5)" },
  b: { bg: "bg-yellow-600", text: "text-black", glow: "rgba(234,179,8,0.5)" },
  c: { bg: "bg-green-600", text: "text-white", glow: "rgba(34,197,94,0.5)" },
  d: { bg: "bg-blue-600", text: "text-white", glow: "rgba(59,130,246,0.5)" },
  "be-power": { bg: "bg-indigo-600", text: "text-white", glow: "rgba(99,102,241,0.5)" },
  unranked: { bg: "bg-zinc-700", text: "text-zinc-300", glow: "rgba(82,82,82,0.3)" },
};

interface Props {
  slug: TierSlug;
}

export default function TierBadge({ slug }: Props) {
  const t = useTranslations("Tiers");
  const style = TIER_STYLES[slug] ?? TIER_STYLES.unranked;

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}
      style={{
        clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
        boxShadow: `0 0 8px ${style.glow}`,
      }}
    >
      {t(slug)}
    </span>
  );
}
