export const loggingMiddleware: JobMiddleware = {
  beforeRun: (event: JobEvent) => {
    console.log(`[Log] Starting job: ${event.meta.name}`);
    // print(event);
    if (Math.random() * 0.5 > 0.25) {
      throw new Error("Error in beforeRun");
    }
  },
  afterRun: (event: JobEvent) => {
    console.log(`[Log] Job completed: ${event.meta.name}`);
    print(event.context);
  },
  onError: (event: JobEvent, error: Error) => {
    console.error(
      `[Log] Job failed: ${event.meta.name}, Error: ${error.message}`
    );
  },
  onComplete: (event: JobEvent) => {
    console.log(`[Log] Job cleanup: ${event.meta.name}`);
    print(event.context);
  },
};
