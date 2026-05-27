import { input } from "zod";
import { z, zodUndefinedModel } from "../../schema";
import { publicProcedure, router } from "../../trpc";

export const chaicodeRouter = router({
   getChaicode: publicProcedure.
   input(z.object({email: z.email()}))
   .output(z.object({ message: z.string()}))
   .query( async ({input}) => {
      return {
        message: `Hello Mr. ${input.email}`
      }
   })

});