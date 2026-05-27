import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { userService } from "./services";

export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;
export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
    const { ctx } = options;

    const userToken = ctx.getCookie("token");
    if (!userToken) throw new Error("User is not logged in");

    const { id } = await userService.verifyAndDecodeUserToken(userToken);

    return options.next({
        ctx: {
            ...ctx,
            user: { id },
        },
    });
});

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

export const rateLimitedProcedure = tRPCContext.procedure.use(async (options) => {
    const { ctx } = options;
    const ip = ctx.ip;

    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > RATE_LIMIT_WINDOW) {
        record.count = 0;
        record.lastReset = now;
    }

    if (record.count >= MAX_REQUESTS) {
        throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests, please try again later.",
        });
    }

    record.count++;
    rateLimitMap.set(ip, record);

    return options.next();
});
