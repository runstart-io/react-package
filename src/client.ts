import {
  type BaseTransportOptions,
  type Client,
  type CoreOptions,
  type Integration,
  type RunstartEvent,
} from "./types";
import { resolveStackParser } from "./stack";
import { defaultTransportFactory } from "./transport";

function resolveIntegrations(
  defaults: Integration[] | false | undefined,
  override?: Integration[] | ((d: Integration[]) => Integration[])
): Integration[] {
  const base = defaults === false ? [] : defaults ?? [];
  if (!override) return base;
  return typeof override === "function" ? override(base) : override;
}

export function initClient<
  TO extends BaseTransportOptions = BaseTransportOptions
>(options: CoreOptions<TO>): Client {
  const {
    defaultIntegrations,
    integrations,
    transport,
    stackParser,
    transportOptions,
    endpoint,
    release,
    environment,
    beforeSend,
    tags: baseTags,
    user: baseUser,
  } = options;

  if (!endpoint && !transportOptions?.endpoint) {
    throw new Error(
      "[runstart-io] You must set either options.endpoint or options.transportOptions.endpoint."
    );
  }

  const finalStackParser = resolveStackParser(stackParser);
  const finalIntegrations = resolveIntegrations(
    defaultIntegrations,
    integrations
  );

  const to = {
    ...(transportOptions as TO),
    endpoint,
    debug: transportOptions?.debug,
  } as TO;
  const tr = transport ? transport(to) : defaultTransportFactory(to);

  const processors: Array<(e: RunstartEvent) => RunstartEvent> = [];
  const api = {
    addEventProcessor: (fn: (e: RunstartEvent) => RunstartEvent) =>
      processors.push(fn),
  };
  for (const i of finalIntegrations) i.setup(api);

  let currentUser = baseUser ? { ...baseUser } : undefined;
  const tagBag: Record<string, string> = { ...(baseTags ?? {}) };

  function applyProcessors(evt: RunstartEvent): RunstartEvent {
    return processors.reduce((e, fn) => fn(e), evt);
  }

  async function send(evt: RunstartEvent) {
    evt.tags = { ...(evt.tags ?? {}), ...tagBag };
    if (currentUser) evt.user = { ...currentUser, ...(evt.user ?? {}) };

    const possiblyFiltered = beforeSend
      ? await Promise.resolve(beforeSend(evt))
      : evt;
    if (possiblyFiltered === null) return;
    const processed = applyProcessors(possiblyFiltered!);
    await tr.sendEvent(processed);
  }

  async function captureException(
    error: unknown,
    extra?: Record<string, unknown>
  ) {
    const name = (error as any)?.name ?? "Error";
    const msg = (error as any)?.message ?? String(error);
    const stack = (error as any)?.stack as string | undefined;

    const evt: RunstartEvent = {
      type: "exception",
      release,
      environment,
      errorName: name,
      message: msg,
      extra,
    };

    if (stack) {
      evt.stacktrace = finalStackParser.parse(stack);
    }

    await send(evt);
  }

  async function captureMessage(
    message: string,
    extra?: Record<string, unknown>,
    level: "info" | "warn" | "error" = "info"
  ) {
    const evt: RunstartEvent = {
      type: "message",
      release,
      environment,
      message,
      extra,
      tags: { level },
    };
    await send(evt);
  }

  async function close(timeoutMs?: number) {
    if (tr.close) await tr.close(timeoutMs);
  }

  function setUser(
    user: NonNullable<Client["setUser"]> extends (u: infer U) => any ? U : never
  ) {
    currentUser = { ...(user ?? {}) };
  }

  function setTag(key: string, value: string) {
    tagBag[key] = String(value);
  }

  return {
    captureException,
    captureMessage,
    addEventProcessor: api.addEventProcessor,
    setUser,
    setTag,
    close,
  };
}
