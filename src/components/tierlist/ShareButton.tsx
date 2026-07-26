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
      className="rounded-full bg-green-600 px-6 py-2 text-white font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {copied ? t("copied") : t("share")}
    </button>
  );
}
