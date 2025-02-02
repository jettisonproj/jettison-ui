const CONFIG_KEY = "jettison";

const defaultDisplayIsoTimestamps = false;

interface LocalStateObject {
  displayIsoTimestamps?: boolean;
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

  #saveToLocalStorage() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.#localState));
  }
}

const localState = new LocalState();
export { localState };
