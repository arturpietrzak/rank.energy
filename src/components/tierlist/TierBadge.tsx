"use client";

import { useTranslations } from "next-intl";
import type { TierSlug } from "@/types";
import { TIERS } from "@/types";

interface Props {
  slug: TierSlug;
}

export default function TierBadge({ slug }: Props) {
  const t = useTranslations("Tiers");
  const meta = TIERS.find((tier) => tier.slug === slug);
  const color = meta?.color ?? "bg-gray-400";

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${color}`}
    >
      {t(slug)}
    </span>
  );
}
