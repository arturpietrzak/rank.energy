"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface Props {
  shareUrl: string;
  disabled?: boolean;
}

export default function ShareButton({ shareUrl, disabled }: Props) {
  const t = useTranslations("TierList");
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("list", shareUrl);
    const fullUrl = url.toString();

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  return (
    <button
      onClick={handleShare}
      disabled={disabled}
      className="relative min-w-[140px] inline-flex justify-center px-5 py-2 text-sm font-bold text-black uppercase tracking-wider bg-accent hover:bg-accent-dim transition-colors duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-accent"
      style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
    >
      {copied ? t("copied") : t("share")}
    </button>
  );
}
