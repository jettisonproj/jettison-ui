const Tabs = {
  summary: "summary",
  logs: "logs",
} as const;
type Tab = (typeof Tabs)[keyof typeof Tabs];
const DEFAULT_TAB = Tabs.summary;

export { Tabs, DEFAULT_TAB };
export type { Tab };
