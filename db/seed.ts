import { getDb } from "../api/queries/connection";
import { users, events } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed host account (community team)
  let hostId: number;
  const existing = await db.query.users.findFirst({
    where: eq(users.unionId, "chinabridge-team"),
  });
  if (existing) {
    hostId = existing.id;
  } else {
    const [{ id }] = await db
      .insert(users)
      .values({
        unionId: "chinabridge-team",
        name: "ChinaBridge Team",
        role: "user",
      })
      .$returningId();
    hostId = id;
  }

  // Skip if events already seeded
  const existingEvents = await db.query.events.findMany();
  if (existingEvents.length > 0) {
    console.log("Events already exist, skipping.");
    process.exit(0);
  }

  const inDays = (n: number, hour = 18) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  await db.insert(events).values([
    {
      hostId,
      title: "Yiwu Market Sourcing Trip — Guided Group Visit",
      description:
        "Join a small group of international buyers for a guided day at Yiwu International Trade City. We cover districts 1–2 (toys, jewelry, stationery), share negotiation tips, and help with translation. Meet at Yiwu railway station entrance at 9:00. Bring your passport and a shopping list!",
      category: "business",
      city: "Yiwu",
      venue: "Yiwu International Trade City, District 1 entrance",
      eventDate: inDays(14, 9),
      contact: "WeChat: chinabridge-yiwu",
      capacity: 15,
    },
    {
      hostId,
      title: "New Student Welcome Mixer — September Intake",
      description:
        "Just arrived for the autumn semester? Come meet fellow international students from 30+ countries, plus senior students who can answer questions about dorms, course registration, residence permits and life in Shanghai. Free snacks and drinks.",
      category: "study",
      city: "Shanghai",
      venue: "Fudan University, Handan Campus — International Students Center",
      eventDate: inDays(21, 18),
      contact: "WeChat: fudan-iso",
      capacity: 80,
    },
    {
      hostId,
      title: "Chinese–English Language Corner (Weekly)",
      description:
        "Our weekly language exchange: half the evening in Chinese, half in English. All levels welcome — beginners included. Board games and topic cards provided. A relaxed way to practice speaking and make local friends.",
      category: "language",
      city: "Beijing",
      venue: "Bridge Café, Wudaokou (near Tsinghua East Gate)",
      eventDate: inDays(7, 19),
      contact: "WeChat: bj-language-corner",
      capacity: 30,
    },
    {
      hostId,
      title: "Canton Fair Buyers' Networking Night",
      description:
        "Visiting Guangzhou for the Canton Fair? Meet other buyers, sourcing agents and freight forwarders. Swap supplier contacts, share shipping tips and find partners for your next order. Smart casual, cash bar.",
      category: "networking",
      city: "Guangzhou",
      venue: "Rooftop bar near Pazhou Exhibition Center",
      eventDate: inDays(30, 19),
      contact: "WhatsApp: +86 138 0000 0000",
      capacity: 60,
    },
  ]);

  console.log("Seeded 4 events.");
  process.exit(0);
}

seed();
