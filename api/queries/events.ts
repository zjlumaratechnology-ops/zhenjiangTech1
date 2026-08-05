import { getDb } from "./connection";
import { events, users, type Event, type InsertEvent } from "@db/schema";
import { and, asc, desc, eq, gte, type SQL } from "drizzle-orm";

export interface EventFilters {
  category?: string;
  city?: string;
  upcomingOnly?: boolean;
}

export async function listEvents(filters: EventFilters = {}) {
  const conditions: SQL[] = [];
  if (filters.category) {
    conditions.push(
      eq(events.category, filters.category as Event["category"]),
    );
  }
  if (filters.city) {
    conditions.push(eq(events.city, filters.city));
  }
  if (filters.upcomingOnly) {
    conditions.push(gte(events.eventDate, new Date()));
  }

  const rows = await getDb()
    .select({
      event: events,
      hostName: users.name,
      hostAvatar: users.avatar,
    })
    .from(events)
    .leftJoin(users, eq(events.hostId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(events.eventDate), desc(events.createdAt))
    .limit(100);

  return rows.map((r) => ({
    ...r.event,
    hostName: r.hostName,
    hostAvatar: r.hostAvatar,
  }));
}

export async function listCities() {
  const rows = await getDb()
    .selectDistinct({ city: events.city })
    .from(events)
    .orderBy(asc(events.city));
  return rows.map((r) => r.city);
}

export async function listMyEvents(hostId: number) {
  return getDb()
    .select()
    .from(events)
    .where(eq(events.hostId, hostId))
    .orderBy(desc(events.createdAt));
}

export async function createEvent(data: InsertEvent) {
  const [{ id }] = await getDb().insert(events).values(data).$returningId();
  return getDb().query.events.findFirst({ where: eq(events.id, id) });
}

export async function deleteEvent(id: number, hostId: number) {
  const existing = await getDb().query.events.findFirst({
    where: eq(events.id, id),
  });
  if (!existing || existing.hostId !== hostId) {
    return false;
  }
  await getDb().delete(events).where(eq(events.id, id));
  return true;
}
