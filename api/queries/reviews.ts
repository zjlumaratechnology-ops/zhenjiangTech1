import { getDb } from "./connection";
import { eventReviews, users, type InsertEventReview } from "@db/schema";
import { asc, eq } from "drizzle-orm";

export async function listReviews(eventId: number) {
  const rows = await getDb()
    .select({
      review: eventReviews,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(eventReviews)
    .leftJoin(users, eq(eventReviews.userId, users.id))
    .where(eq(eventReviews.eventId, eventId))
    .orderBy(asc(eventReviews.createdAt));

  return rows.map((r) => ({
    ...r.review,
    userName: r.userName,
    userAvatar: r.userAvatar,
  }));
}

export async function createReview(data: InsertEventReview) {
  const [{ id }] = await getDb().insert(eventReviews).values(data).$returningId();
  return getDb().query.eventReviews.findFirst({
    where: eq(eventReviews.id, id),
  });
}

export async function deleteReview(id: number, userId: number) {
  const existing = await getDb().query.eventReviews.findFirst({
    where: eq(eventReviews.id, id),
  });
  if (!existing || existing.userId !== userId) {
    return false;
  }
  await getDb().delete(eventReviews).where(eq(eventReviews.id, id));
  return true;
}
