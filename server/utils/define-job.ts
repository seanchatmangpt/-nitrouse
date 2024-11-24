import { ZodSchema } from "zod";

export function wrapWithMiddleware<
  RT = unknown,
  Payload = Record<string, any>,
  Context = Record<string, any>,
  Hook extends keyof JobMiddleware<RT, Payload, Context> = keyof JobMiddleware<
    RT,
    Payload,
    Context
  >
>(
  middlewares: JobMiddleware<RT, Payload, Context>[],
  methodName: Hook,
  fallback?: JobMiddleware<RT, Payload, Context>[Hook]
): (event: JobEvent<Payload, Context>, ...args: any[]) => Promise<void> {
  return async (event, ...args) => {
    for (const middleware of middlewares) {
      const method = middleware[methodName];
      if (method) {
        // @ts-ignore
        await method(event, ...args); // No more type-specific `result` or `error` handling
      }
    }
    if (fallback) {
      // @ts-ignore
      await fallback(event, ...args);
    }
  };
}

export function defineJob<
  RT = unknown,
  Payload = Record<string, any>,
  Context = Record<string, any>
>(def: Job<RT, Payload, Context>): Job<RT, Payload, Context> {
  if (typeof def.run !== "function") {
    throw new TypeError("Job must implement a `run` method!");
  }

  const middlewares: JobMiddleware<RT, Payload, Context>[] =
    def.middlewares || [];

  const beforeRun = wrapWithMiddleware(middlewares, "beforeRun", def.beforeRun);
  const afterRun = wrapWithMiddleware(middlewares, "afterRun", def.afterRun);
  const onError = wrapWithMiddleware(middlewares, "onError", def.onError);
  const onComplete = wrapWithMiddleware(
    middlewares,
    "onComplete",
    def.onComplete
  );

  return {
    ...def,
    async beforeRun(event: JobEvent<Payload, Context>) {
      await beforeRun(event);
    },
    async afterRun(event: JobEvent<Payload, Context>) {
      await afterRun(event);
    },
    async onError(event: JobEvent<Payload, Context>, error: Error) {
      await onError(event, error);
    },
    async onComplete(event: JobEvent<Payload, Context>) {
      await onComplete(event);
    },
    // @ts-ignore
    async run(event: JobEvent<Payload, Context>) {
      const jobEvent: JobEvent<Payload, Context> = { ...event, meta: def.meta };

      // Validate payload using schema, if provided
      if (def.meta.schema) {
        const schema = def.meta.schema as ZodSchema<Payload>;
        jobEvent.payload = schema.parse(event.payload);
      }

      try {
        await this.beforeRun?.(jobEvent);

        const result = await def.run(jobEvent);

        // Allow middleware to modify the event
        await this.afterRun?.(jobEvent);
      } catch (error) {
        await this.onError?.(jobEvent, error as Error);

        return { result: "Failure", event: jobEvent, error };
      } finally {
        await this.onComplete?.(jobEvent);
      }
      return { result: "Success", event: jobEvent };
    },
  };
}
