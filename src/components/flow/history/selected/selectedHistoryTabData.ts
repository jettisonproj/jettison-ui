const Tabs = {
  summary: "summary",
  logs: "logs",
  artifacts: "artifacts",
} as const;
type Tab = (typeof Tabs)[keyof typeof Tabs];

const DEFAULT_TAB = Tabs.summary;

function getSelectedTab(tabValue: string | null): Tab {
  if (tabValue == null) {
    return DEFAULT_TAB;
  }
  return tabValue as Tab;
}

export { Tabs, getSelectedTab };
export type { Tab };
