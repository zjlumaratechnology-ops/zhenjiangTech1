import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listAds, listAdCities, listMyAds, createAd, deleteAd } from "./queries/ads";

const adInput = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  category: z.enum([
    "translator",
    "sourcing_agent",
    "supplier",
    "housing",
    "legal",
    "education",
    "logistics",
    "other",
  ]),
  city: z.string().min(1).max(100),
  contact: z.string().min(3).max(255),
});

export const adsRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          city: z.string().optional(),
        })
        .optional(),
    )
    .query(({ input }) => listAds(input ?? {})),

  cities: publicQuery.query(() => listAdCities()),

  mine: authedQuery.query(({ ctx }) => listMyAds(ctx.user.id)),

  create: authedQuery
    .input(adInput)
    .mutation(({ ctx, input }) => createAd({ ...input, ownerId: ctx.user.id })),

  remove: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const ok = await deleteAd(input.id, ctx.user.id);
      if (!ok) {
        throw new Error("Ad not found or not yours");
      }
      return { ok };
    }),
});
