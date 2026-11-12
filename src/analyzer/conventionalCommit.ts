import { StandardsFinding } from '../types';

const CONVENTIONAL_REGEX = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\([a-zA-Z0-9_-]+\))?!?: .+$/;

export function checkConventionalCommit(title: string): StandardsFinding {
  const isConventional = CONVENTIONAL_REGEX.test(title.trim());

  if (isConventional) {
    return {
      rule: 'Conventional Commits',
      passed: true,
      message: 'PR title complies with Conventional Commits specification.',
      level: 'info'
    };
  }

  return {
    rule: 'Conventional Commits',
    passed: false,
    message: 'PR title should follow Conventional Commits (e.g., `feat(api): add auth endpoint` or `fix: resolve memory leak`).',
    level: 'warning'
  };
}
