import type { BaseTransportOptions, Transport, RunstartEvent } from "./types";

function headers(opts: BaseTransportOptions): HeadersInit {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (opts.apiKey) h["authorization"] = `Bearer ${opts.apiKey}`;
  return h;
}

export function defaultTransportFactory<TO extends BaseTransportOptions>(
  opts: TO
): Transport {
  return {
    async sendEvent(event: RunstartEvent) {
      if (!opts.endpoint)
        throw new Error("[runstart-io] Missing endpoint in transport options");

      if (!opts.apiKey) {
        throw new Error("[runstart-io] Missing apiKey in transport options");
      }

      if (opts.debug) {
        console.log("[runstart-io] sending event", event);
      }

      await fetch(opts.endpoint, {
        method: "POST",
        headers: headers(opts),
        body: JSON.stringify(event),
        keepalive: true,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`[runstart-io] collect failed: ${res.status} ${text}`);
        }
      });
    },
    async close() {
      return;
    },
  };
}
