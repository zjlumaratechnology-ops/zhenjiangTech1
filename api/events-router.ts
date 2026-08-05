import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  listEvents,
  listCities,
  listMyEvents,
  createEvent,
  deleteEvent,
} from "./queries/events";

const eventInput = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  category: z.enum([
    "study",
    "business",
    "culture",
    "networking",
    "language",
    "sports",
    "other",
  ]),
  city: z.string().min(1).max(100),
  venue: z.string().min(1).max(255),
  eventDate: z.coerce.date(),
  contact: z.string().max(255).optional(),
  capacity: z.number().int().positive().max(100000).optional(),
});

export const eventsRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          city: z.string().optional(),
          upcomingOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(({ input }) => listEvents(input ?? {})),

  cities: publicQuery.query(() => listCities()),

  mine: authedQuery.query(({ ctx }) => listMyEvents(ctx.user.id)),

  create: authedQuery
    .input(eventInput)
    .mutation(({ ctx, input }) =>
      createEvent({ ...input, hostId: ctx.user.id }),
    ),

  remove: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const ok = await deleteEvent(input.id, ctx.user.id);
      if (!ok) {
        throw new Error("Event not found or not yours");
      }
      return { ok };
    }),
});
