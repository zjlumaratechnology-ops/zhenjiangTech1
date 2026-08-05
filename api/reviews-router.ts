import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listReviews, createReview, deleteReview } from "./queries/reviews";

export const reviewsRouter = createRouter({
  list: publicQuery
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(({ input }) => listReviews(input.eventId)),

  create: authedQuery
    .input(
      z.object({
        eventId: z.number().int().positive(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(3).max(2000),
      }),
    )
    .mutation(({ ctx, input }) =>
      createReview({ ...input, userId: ctx.user.id }),
    ),

  remove: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const ok = await deleteReview(input.id, ctx.user.id);
      if (!ok) {
        throw new Error("Review not found or not yours");
      }
      return { ok };
    }),
});
