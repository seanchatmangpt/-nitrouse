import { ZodSchema } from "zod";
import { TaskPayload, TaskContext } from "nitropack/types";

// Helper function to wrap workflow middleware methods
function wrapWorkflowMiddleware<
  RT = unknown,
  Payload = Record<string, any>,
  Context = Record<string, any>,
  Hook extends keyof WorkflowMiddleware<
    RT,
    Payload,
    Context
  > = keyof WorkflowMiddleware<RT, Payload, Context>
>(
  middlewares: WorkflowMiddleware<RT, Payload, Context>[],
  methodName: Hook,
  fallback?: WorkflowMiddleware<RT, Payload, Context>[Hook]
): (event: WorkflowEvent<Payload, Context>, ...args: any[]) => Promise<void> {
  return async (event, ...args) => {
    for (const middleware of middlewares) {
      const method = middleware[methodName];
      if (method) {
        // @ts-ignore
        await method(event, ...args);
      }
    }
    if (fallback) {
      // @ts-ignore
      await fallback(event, ...args);
    }
  };
}

// Function to define a workflow with middleware and lifecycle hooks
export function defineWorkflow<
  RT = unknown,
  Payload = Record<string, any>,
  Context = Record<string, any>
>(def: Workflow<RT, Payload, Context>): Workflow<RT, Payload, Context> {
  if (typeof def.run !== "function") {
    throw new TypeError("Workflow must implement a `run` method!");
  }

  const middlewares: WorkflowMiddleware<RT, Payload, Context>[] =
    def.middlewares || [];

  const beforeRun = wrapWorkflowMiddleware(
    middlewares,
    "beforeRun",
    def.beforeRun
  );
  const afterRun = wrapWorkflowMiddleware(
    middlewares,
    "afterRun",
    def.afterRun
  );
  const onError = wrapWorkflowMiddleware(middlewares, "onError", def.onError);
  const onComplete = wrapWorkflowMiddleware(
    middlewares,
    "onComplete",
    def.onComplete
  );
  const beforeJobRun = wrapWorkflowMiddleware(
    middlewares,
    "beforeJobRun",
    def.beforeJobRun
  );
  const afterJobRun = wrapWorkflowMiddleware(
    middlewares,
    "afterJobRun",
    def.afterJobRun
  );

  return {
    ...def,
    async beforeRun(event: WorkflowEvent<Payload, Context>) {
      await beforeRun(event);
    },
    async afterRun(event: WorkflowEvent<Payload, Context>) {
      await afterRun(event);
    },
    async onError(event: WorkflowEvent<Payload, Context>, error: Error) {
      await onError(event, error);
    },
    async onComplete(event: WorkflowEvent<Payload, Context>) {
      await onComplete(event);
    },
    async beforeJobRun(event: JobEvent<Payload, Context>) {
      await beforeJobRun(event);
    },
    async afterJobRun(event: JobEvent<Payload, Context>) {
      await afterJobRun(event);
    },
    // @ts-ignore
    async run(event: WorkflowEvent<Payload, Context>) {
      const workflowEvent: WorkflowEvent<Payload, Context> = {
        ...event,
        meta: def.meta,
      };

      // Validate payload using schema, if provided
      try {
        const schema = def.meta.schema as ZodSchema<Payload>;
        workflowEvent.payload = schema.parse(event.payload);
      } catch (error) {
        return { result: "Failure", event: workflowEvent, error };
      }

      if (!def.meta.jobs || !def.meta.jobs.length) {
        return {
          result: "Failure",
          event: workflowEvent,
          error: new Error("Workflow must have at least one job defined!"),
        };
      }

      try {
        await this.beforeRun?.(workflowEvent);

        // Execute each job in the workflow
        for (const job of def.meta.jobs) {
          const jobEvent: JobEvent<Payload, Context> = {
            ...workflowEvent,
          };

          await this.beforeJobRun?.(jobEvent);

          if (typeof job === "string") {
            runTask(job, {
              payload: event.payload as TaskPayload,
              context: event.context as TaskContext,
            });
          } else {
            // @ts-ignore
            await job.run(jobEvent);
          }

          await this.afterJobRun?.(jobEvent);
        }

        await this.afterRun?.(workflowEvent);
      } catch (error) {
        await this.onError?.(workflowEvent, error as Error);
        return { result: "Failure", event: workflowEvent, error };
      } finally {
        await this.onComplete?.(workflowEvent);
      }

      return { result: "Success", event: workflowEvent };
    },
  };
}
