import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser, User } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByUsername(username: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase()))
    .limit(1);
  return rows.at(0);
}

export async function createLocalUser(data: {
  username: string;
  passwordHash: string;
  name: string;
  unionId: string;
}): Promise<User> {
  const isOwner =
    !!env.ownerUnionId && data.unionId === env.ownerUnionId;
  const [{ id }] = await getDb()
    .insert(schema.users)
    .values({
      unionId: data.unionId,
      username: data.username.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
      role: isOwner ? "admin" : "user",
      lastSignInAt: new Date(),
    })
    .$returningId();
  const user = await getDb().query.users.findFirst({
    where: eq(schema.users.id, id),
  });
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function touchLastSignIn(userId: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, userId));
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}
