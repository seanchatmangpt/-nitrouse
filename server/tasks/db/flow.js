import { z } from "zod";
import migrate from "./migrate";

export default defineWorkflow({
  meta: {
    name: "helloWorld",
    description: "Hello World with initial data",
    schema: z.object({
      environment: z.string().default(process.env.NODE_ENV || "development"), // Default to NODE_ENV or "development"
    }),
    jobs: ["db:migrate", migrate, "db:migrate"],
  },
  async run(event) {
    return "World seeded successfully";
  },
  middlewares: [workflowLoggingMiddleware],
});


runTask("db:flow", { payload: { environment: "production" } });
