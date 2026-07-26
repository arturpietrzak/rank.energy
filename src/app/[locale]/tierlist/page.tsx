import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { MonsterConfig } from "@/types";
import monstersData from "@/../config/monsters.json";
import TierListPage from "@/components/tierlist/TierListPage";

const monsters: MonsterConfig[] = monstersData.monsters;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TierList");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TierListPageServer({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const params = await searchParams;
  const sharedEncoded = params.list ?? null;

  const maxId = monsters.reduce((max, m) => Math.max(max, m.id), 0);

  return (
    <TierListPage
      monsters={monsters}
      sharedEncoded={sharedEncoded}
      maxId={maxId}
    />
  );
}
