import { getDb } from "./connection";
import { ads, users, type Ad, type InsertAd } from "@db/schema";
import { and, asc, desc, eq, type SQL } from "drizzle-orm";

export interface AdFilters {
  category?: string;
  city?: string;
}

export async function listAds(filters: AdFilters = {}) {
  const conditions: SQL[] = [];
  if (filters.category) {
    conditions.push(eq(ads.category, filters.category as Ad["category"]));
  }
  if (filters.city) {
    conditions.push(eq(ads.city, filters.city));
  }

  const rows = await getDb()
    .select({
      ad: ads,
      ownerName: users.name,
      ownerAvatar: users.avatar,
    })
    .from(ads)
    .leftJoin(users, eq(ads.ownerId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(ads.createdAt))
    .limit(100);

  return rows.map((r) => ({
    ...r.ad,
    ownerName: r.ownerName,
    ownerAvatar: r.ownerAvatar,
  }));
}

export async function listAdCities() {
  const rows = await getDb()
    .selectDistinct({ city: ads.city })
    .from(ads)
    .orderBy(asc(ads.city));
  return rows.map((r) => r.city);
}

export async function listMyAds(ownerId: number) {
  return getDb()
    .select()
    .from(ads)
    .where(eq(ads.ownerId, ownerId))
    .orderBy(desc(ads.createdAt));
}

export async function createAd(data: InsertAd) {
  const [{ id }] = await getDb().insert(ads).values(data).$returningId();
  return getDb().query.ads.findFirst({ where: eq(ads.id, id) });
}

export async function deleteAd(id: number, ownerId: number) {
  const existing = await getDb().query.ads.findFirst({
    where: eq(ads.id, id),
  });
  if (!existing || existing.ownerId !== ownerId) {
    return false;
  }
  await getDb().delete(ads).where(eq(ads.id, id));
  return true;
}
