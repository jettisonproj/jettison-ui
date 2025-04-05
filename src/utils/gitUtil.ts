function appendGitSuffix(s: string) {
  if (s.endsWith(".git")) {
    return s;
  }
  return `${s}.git`;
}

export { appendGitSuffix };
