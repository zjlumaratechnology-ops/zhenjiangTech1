import { authRouter } from "./auth-router";
import { eventsRouter } from "./events-router";
import { reviewsRouter } from "./reviews-router";
import { adsRouter } from "./ads-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  events: eventsRouter,
  reviews: reviewsRouter,
  ads: adsRouter,
});

export type AppRouter = typeof appRouter;
