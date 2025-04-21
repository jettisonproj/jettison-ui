const CONFIG_KEY = "jettison";

const defaultDisplayIsoTimestamps = false;
const defaultRecentFlows: string[] = [];

interface LocalStateObject {
  displayIsoTimestamps?: boolean;

  // List of strings in the form `${namespace}/${name}`
  recentFlows?: string[];
}

/**
 * Provides an abstraction over localStorage. Supports defaults
 * that can be updated.
 */
class LocalState {
  #localState: LocalStateObject;

  constructor() {
    const savedItem = localStorage.getItem(CONFIG_KEY);
    if (savedItem) {
      this.#localState = JSON.parse(savedItem) as LocalStateObject;
    } else {
      this.#localState = {};
    }
  }

  getDisplayIsoTimestamps() {
    return this.#localState.displayIsoTimestamps ?? defaultDisplayIsoTimestamps;
  }

  setDisplayIsoTimestamps(displayIsoTimestamps: boolean) {
    this.#localState.displayIsoTimestamps = displayIsoTimestamps;
    this.#saveToLocalStorage();
  }

  getRecentFlows() {
    return this.#localState.recentFlows ?? defaultRecentFlows;
  }

  addRecentFlow(namespace: string, name: string) {
    const namespaceNamePath = `${namespace}/${name}`;
    const recentFlows = this.getRecentFlows();
    if (recentFlows.length > 0 && recentFlows[0] == namespaceNamePath) {
      return;
    }

    // Use an ordered Set to get a new list, with the namespaceNamePath
    // as the first item
    const orderedRecentFlows = new Set([namespaceNamePath, ...recentFlows]);

    this.#localState.recentFlows = [...orderedRecentFlows];
    this.#saveToLocalStorage();
  }

  #saveToLocalStorage() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.#localState));
  }
}

const localState = new LocalState();
export { localState };
