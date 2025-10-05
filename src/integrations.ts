import type { Integration, RunstartEvent } from "./types";

export const BreadcrumbsConsole: Integration = {
  name: "breadcrumbs-console",
  setup: ({ addEventProcessor }) => {
    addEventProcessor((e: RunstartEvent) => {
      const breadcrumbs = e.breadcrumbs ?? [];
      breadcrumbs.push({
        message: "event-processed",
        category: "sdk",
        level: "info",
        ts: Date.now(),
      });
      return { ...e, breadcrumbs };
    });
  },
};

export const GlobalTags = (tags: Record<string, string>): Integration => ({
  name: "global-tags",
  setup: ({ addEventProcessor }) => {
    addEventProcessor((e: RunstartEvent) => ({
      ...e,
      tags: { ...(e.tags ?? {}), ...tags },
    }));
  },
});
