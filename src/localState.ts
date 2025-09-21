const CONFIG_KEY = "jettison";

const defaultDisplayIsoTimestamps = false;
const defaultRecentRepos: string[] = [];

interface LocalStateObject {
  displayIsoTimestamps?: boolean;

  // List of strings in the form `${repoOrg}/${repoName}`
  recentRepos?: string[];
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

  getRecentRepos() {
    return this.#localState.recentRepos ?? defaultRecentRepos;
  }

  addRecentRepo(repoOrg: string, repoName: string) {
    const repoOrgName = `${repoOrg}/${repoName}`;
    const recentRepos = this.getRecentRepos();
    if (recentRepos.length > 0 && recentRepos[0] == repoOrgName) {
      return;
    }

    // Use an ordered Set to get a new list, with the namespaceNamePath
    // as the first item
    const orderedRecentRepos = new Set([repoOrgName, ...recentRepos]);

    this.#localState.recentRepos = [...orderedRecentRepos];
    this.#saveToLocalStorage();
  }

  deleteRecentRepo(repoOrg: string, repoName: string) {
    const repoOrgName = `${repoOrg}/${repoName}`;
    const recentRepos = this.getRecentRepos();

    const n = recentRepos.length;
    for (let i = 0; i < n; i += 1) {
      if (recentRepos[i] === repoOrgName) {
        this.#localState.recentRepos = [
          ...recentRepos.slice(0, i),
          ...recentRepos.slice(i + 1),
        ];
        this.#saveToLocalStorage();
      }
    }
  }

  #saveToLocalStorage() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.#localState));
  }
}

const localState = new LocalState();
export { localState };
