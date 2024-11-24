export const workflowLoggingMiddleware: WorkflowMiddleware = {
  beforeRun: (event: WorkflowEvent) => {
    console.log(`[Log] Starting workflow: ${event.meta.name}`);
    // print(event);
    // if (Math.random() * 0.5 > 0.25) {
    //   throw new Error("Error in beforeRun");
    // }
  },
  afterRun: (event: WorkflowEvent) => {
    console.log(`[Log] Workflow completed: ${event.meta.name}`);
    print(event.context);
  },
  onError: (event: WorkflowEvent, error: Error) => {
    console.error(
      `[Log] Workflow failed: ${event.meta.name}, Error: ${error.message}`
    );
  },
  onComplete: (event: WorkflowEvent) => {
    console.log(`[Log] Workflow cleanup: ${event.meta.name}`);
    print(event.context);
  },
};
