import type { TaskEvent } from "nitropack/types";
import type { ZodSchema } from "zod";

declare global {
  /**
   * Metadata for a job.
   */
  interface JobMeta {
    name: string; // Unique name of the job
    description?: string; // Optional description
    schema?: ZodSchema; // Optional schema for payload validation
  }

  /**
   * Extended TaskEvent with metadata, payload, and context.
   */
  interface JobEvent<
    Payload = Record<string, any>,
    Context = Record<string, any>
  > extends TaskEvent {
    meta: JobMeta;
    payload: Payload;
    context: Context;
  }

  /**
   * Middleware interface for jobs, allowing partial overrides of Job methods.
   */
  export interface JobMiddleware<
    RT = unknown,
    Payload = Record<string, any>,
    Context = Record<string, any>
  > {
    beforeRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    run?: (event: JobEvent<Payload, Context>) => Promise<RT> | RT;
    afterRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    onError?: (
      event: JobEvent<Payload, Context>,
      error: Error
    ) => Promise<void> | void;
    onComplete?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
  }

  /**
   * Main Job interface.
   */
  interface Job<
    RT = unknown,
    Payload = Record<string, any>,
    Context = Record<string, any>
  > {
    meta: JobMeta;
    beforeRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    afterRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    onError?: (
      event: JobEvent<Payload, Context>,
      error: Error
    ) => Promise<void> | void;
    onComplete?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    run: (event: JobEvent<Payload, Context>) => Promise<RT>;
    middlewares?: JobMiddleware<RT, Payload, Context>[]; // Middleware array
  }

  /**
   * Metadata for a workflow.
   */
  interface WorkflowMeta {
    name: string; // Unique name of the workflow
    description?: string; // Optional description
    version?: string; // Optional version of the workflow
    schema?: ZodSchema; // Optional schema for payload validation
    jobs: (string | Job)[]; // Array of job names or job objects in the workflow
  }

  /**
   * Extended WorkflowEvent with metadata, payload, and context.
   */
  interface WorkflowEvent<
    Payload = Record<string, any>,
    Context = Record<string, any>
  > extends TaskEvent {
    meta: JobMeta;
    payload: Payload;
    context: Context;
  }

  /**
   * Middleware interface for workflows, allowing partial overrides of Workflow methods.
   */
  interface WorkflowMiddleware<
    RT = unknown,
    Payload = Record<string, any>,
    Context = Record<string, any>
  > {
    beforeRun?: (
      event: WorkflowEvent<Payload, Context>
    ) => Promise<void> | void;
    beforeJobRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    afterRun?: (event: WorkflowEvent<Payload, Context>) => Promise<void> | void;
    afterJobRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    onError?: (
      event: WorkflowEvent<Payload, Context>,
      error: Error
    ) => Promise<void> | void;
    onComplete?: (
      event: WorkflowEvent<Payload, Context>
    ) => Promise<void> | void;
  }

  /**
   * Main Workflow interface.
   */
  interface Workflow<
    RT = unknown,
    Payload = Record<string, any>,
    Context = Record<string, any>
  > {
    meta: WorkflowMeta;
    beforeRun?: (
      event: WorkflowEvent<Payload, Context>
    ) => Promise<void> | void;
    beforeJobRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    afterRun?: (event: WorkflowEvent<Payload, Context>) => Promise<void> | void;
    afterJobRun?: (event: JobEvent<Payload, Context>) => Promise<void> | void;
    onError?: (
      event: WorkflowEvent<Payload, Context>,
      error: Error
    ) => Promise<void> | void;
    onComplete?: (
      event: WorkflowEvent<Payload, Context>
    ) => Promise<void> | void;
    run: (event: WorkflowEvent<Payload, Context>) => Promise<RT>;
    middlewares?: WorkflowMiddleware<RT, Payload, Context>[]; // Middleware array
  }
}

export {};
