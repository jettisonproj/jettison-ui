function trimGitSuffix(s: string) {
  if (s.endsWith(".git")) {
    return s.slice(0, -4);
  }
  return s;
}

export { trimGitSuffix };
