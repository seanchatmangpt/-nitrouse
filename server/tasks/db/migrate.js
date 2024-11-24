import { z } from "zod";

export default defineJob({
  meta: {
    name: "seedDatabase",
    description: "Seed the database with initial data",
    schema: z.object({
      environment: z.string().default(process.env.NODE_ENV || "development"), // Default to NODE_ENV or "development"
    }),
  },
  async run(event) {
    return "Database seeded successfully";
  },
  middlewares: [loggingMiddleware, resultModifierMiddleware],
});


// runTask("db:migrate", { payload: { environment: "production" } });
