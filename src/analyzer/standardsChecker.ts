import { StandardsFinding } from '../types';

export function checkPRStandards(
  body: string | null | undefined,
  totalLinesChanged: number
): StandardsFinding[] {
  const findings: StandardsFinding[] = [];

  // 1. Description completeness
  const cleanBody = (body || '').trim();
  if (cleanBody.length < 20) {
    findings.push({
      rule: 'PR Description',
      passed: false,
      message: 'PR description is too brief or missing. A good description helps maintainers review faster.',
      level: 'warning'
    });
  } else {
    findings.push({
      rule: 'PR Description',
      passed: true,
      message: 'PR has a descriptive summary.',
      level: 'info'
    });
  }

  // 2. Issue link check
  const issueRegex = /(?:fixes|closes|resolves|refs?)\s+#\d+|https:\/\/github\.com\/[^/]+\/[^/]+\/(?:issues|pull)\/\d+/i;
  if (issueRegex.test(cleanBody)) {
    findings.push({
      rule: 'Linked Issue',
      passed: true,
      message: 'PR links to an existing issue or reference.',
      level: 'info'
    });
  } else {
    findings.push({
      rule: 'Linked Issue',
      passed: false,
      message: 'No linked issue detected. Consider adding `Fixes #<issue-id>` if applicable.',
      level: 'info'
    });
  }

  // 3. PR Size evaluation
  if (totalLinesChanged > 800) {
    findings.push({
      rule: 'PR Size',
      passed: false,
      message: `Large PR detected (${totalLinesChanged} lines). Consider splitting into smaller, focused pull requests for easier review.`,
      level: 'warning'
    });
  } else {
    findings.push({
      rule: 'PR Size',
      passed: true,
      message: `PR size is manageable (${totalLinesChanged} lines changed).`,
      level: 'info'
    });
  }

  return findings;
}
