import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { signSessionToken } from "./kimi/session";
import {
  createLocalUser,
  findUserByUsername,
  touchLastSignIn,
} from "./queries/users";
import {
  hashPassword,
  verifyPassword,
  localUnionId,
  USERNAME_RE,
} from "./local-auth";

function setSessionCookie(ctx: {
  req: Request;
  resHeaders: Headers;
}, token: string) {
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

const credentialsInput = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32)
    .regex(USERNAME_RE, "Letters, numbers, _ . - only"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const authRouter = createRouter({
  me: authedQuery.query((opts) => {
    const { passwordHash: _hidden, ...safeUser } = opts.ctx.user;
    return safeUser;
  }),

  /** Self-hosted: create an account with username + password */
  localSignup: publicQuery
    .input(credentialsInput.extend({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const username = input.username.toLowerCase();
      const existing = await findUserByUsername(username);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That username is already taken",
        });
      }
      const user = await createLocalUser({
        username,
        passwordHash: hashPassword(input.password),
        name: input.name.trim(),
        unionId: localUnionId(username),
      });
      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: "local",
      });
      setSessionCookie(ctx, token);
      return { success: true, name: user.name };
    }),

  /** Self-hosted: sign in with username + password */
  localLogin: publicQuery
    .input(credentialsInput)
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUsername(input.username);
      if (
        !user ||
        !user.passwordHash ||
        !verifyPassword(input.password, user.passwordHash)
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Wrong username or password",
        });
      }
      await touchLastSignIn(user.id);
      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: "local",
      });
      setSessionCookie(ctx, token);
      return { success: true, name: user.name };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
