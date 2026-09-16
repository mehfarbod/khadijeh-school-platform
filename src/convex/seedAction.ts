import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

export const seedDatabase = httpAction(async (ctx) => {
  const result = await ctx.runMutation(api.seed.seedAll);
  return new Response(JSON.stringify({ result }), {
    headers: { "Content-Type": "application/json" },
  });
});
