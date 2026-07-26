import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("TierList");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-base p-8">
      <div className="flex flex-col items-center gap-5">
        {/* Pulse bar — themed loader */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-8 bg-accent animate-bar-glow" style={{ animationDelay: "0s" }} />
          <div className="w-1.5 h-8 bg-accent animate-bar-glow" style={{ animationDelay: "0.15s" }} />
          <div className="w-1.5 h-8 bg-accent animate-bar-glow" style={{ animationDelay: "0.3s" }} />
          <div className="w-1.5 h-8 bg-accent animate-bar-glow" style={{ animationDelay: "0.45s" }} />
          <div className="w-1.5 h-8 bg-accent animate-bar-glow" style={{ animationDelay: "0.6s" }} />
        </div>
        <p className="font-mono text-xs text-text-muted uppercase tracking-[0.3em]">
          {t("loading")}
        </p>
      </div>
    </div>
  );
}
