import { readFileSync } from "fs";
import { join } from "path";
import type { MonsterConfig } from "@/types";
import TierListPage from "@/components/tierlist/TierListPage";

export default async function TierListPageServer({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const raw = readFileSync(
    join(process.cwd(), "config/monsters.json"),
    "utf-8"
  );
  const { monsters }: { monsters: MonsterConfig[] } = JSON.parse(raw);

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
