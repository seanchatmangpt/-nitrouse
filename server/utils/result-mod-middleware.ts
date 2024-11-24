export const resultModifierMiddleware: JobMiddleware = {
  afterRun: (event) => {
    console.log(`[Log] Modifying result for job: ${event.meta.name}`);
    event.context.result = "Modified result";
    event.context.timestamp = Date.now();
  },
};
