export interface BaseTransportOptions {
  endpoint: string;
  apiKey: string;
  debug?: boolean;
}

export interface Transport {
  sendEvent: (event: RunstartEvent) => Promise<void>;
  close?: (timeoutMs?: number) => Promise<void>;
}

export type RunstartEvent =
  | {
      type: "exception";
      environment?: string;
      release?: string;
      message: string;
      errorName: string;
      stacktrace?: ParsedFrame[];
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
      user?: { id?: string; email?: string; username?: string };
      breadcrumbs?: Array<{
        message: string;
        category?: string;
        level?: "info" | "warn" | "error";
        ts?: number;
      }>;
    }
  | {
      type: "message";
      environment?: string;
      release?: string;
      message: string;
      level?: "info" | "warn" | "error";
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
      user?: { id?: string; email?: string; username?: string };
      breadcrumbs?: Array<{
        message: string;
        category?: string;
        level?: "info" | "warn" | "error";
        ts?: number;
      }>;
    };

export type ParsedFrame = {
  filename?: string;
  function?: string;
  lineno?: number;
  colno?: number;
  in_app?: boolean;
};

export type StackLineParser = (line: string) => ParsedFrame | null;

export interface StackParser {
  parse: (stack: string) => ParsedFrame[];
}

export interface Integration {
  name: string;
  setup: (api: {
    addEventProcessor(fn: (e: RunstartEvent) => RunstartEvent): void;
  }) => void;
}

export interface ClientOptions<
  TO extends BaseTransportOptions = BaseTransportOptions
> {
  endpoint: string;
  release?: string;
  environment?: string;
  transportOptions?: TO;
  beforeSend?: (
    event: RunstartEvent
  ) => RunstartEvent | null | Promise<RunstartEvent | null>;
  tags?: Record<string, string>;
  user?: { id?: string; email?: string; username?: string };
}

export interface CoreOptions<
  TO extends BaseTransportOptions = BaseTransportOptions
> extends Omit<
    Partial<ClientOptions<TO>>,
    "integrations" | "transport" | "stackParser"
  > {
  defaultIntegrations?: false | Integration[];
  integrations?:
    | Integration[]
    | ((integrations: Integration[]) => Integration[]);
  transport?: (transportOptions: TO) => Transport;
  stackParser?: StackParser | StackLineParser[];
}

export interface Client {
  captureException: (
    error: unknown,
    extra?: Record<string, unknown>
  ) => Promise<void>;
  captureMessage: (
    message: string,
    extra?: Record<string, unknown>,
    level?: "info" | "warn" | "error"
  ) => Promise<void>;
  addEventProcessor: (fn: (e: RunstartEvent) => RunstartEvent) => void;
  setUser: (user: NonNullable<ClientOptions["user"]>) => void;
  setTag: (key: string, value: string) => void;
  close: (timeoutMs?: number) => Promise<void>;
}
