import test from 'node:test';
import assert from 'node:assert/strict';
import { scanDiffForSecrets } from '../src/analyzer/secretScanner.ts';
import { checkConventionalCommit } from '../src/analyzer/conventionalCommit.ts';
import { checkPRStandards } from '../src/analyzer/standardsChecker.ts';
import { generateMarkdownReport } from '../src/reporter/markdownFormatter.ts';

test('detects OpenAI and AWS keys in patch additions', () => {
  const fakeDiff = `
@@ -10,3 +10,5 @@
 const config = {};
+const OPENAI_KEY = "sk-live12345678901234567890123456789012";
+const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
-const old = 1;
`;
  const findings = scanDiffForSecrets(fakeDiff, 'src/config.ts');
  assert.equal(findings.length, 2);
  assert.equal(findings[0].type, 'OpenAI API Key');
  assert.equal(findings[1].type, 'AWS Access Key');
  assert.equal(findings[0].snippet.startsWith('sk-l'), true);
});

test('conventional commits validator', () => {
  assert.equal(checkConventionalCommit('feat(auth): add login route').passed, true);
  assert.equal(checkConventionalCommit('fix: typo in readme').passed, true);
  assert.equal(checkConventionalCommit('random commit title without prefix').passed, false);
});

test('PR standards checker checks length and linked issues', () => {
  const shortFindings = checkPRStandards('short', 100);
  assert.equal(shortFindings.find(f => f.rule === 'PR Description')?.passed, false);

  const goodFindings = checkPRStandards('This pull request introduces authentication. Fixes #42', 150);
  assert.equal(goodFindings.find(f => f.rule === 'PR Description')?.passed, true);
  assert.equal(goodFindings.find(f => f.rule === 'Linked Issue')?.passed, true);
});

test('Markdown report generates valid markdown without error', () => {
  const report = {
    prNumber: 42,
    prTitle: 'feat: add telemetry',
    author: 'octocat',
    filesChanged: 3,
    additions: 100,
    deletions: 20,
    secretsFound: [],
    standards: [
      { rule: 'Conventional Commits', passed: true, message: 'Valid', level: 'info' as const }
    ],
    aiReview: {
      summary: 'Adds telemetry layer.',
      keyChanges: ['Initialized client'],
      potentialIssues: [],
      suggestions: ['Add retry logic'],
      securityNotes: []
    },
    isApprovalRecommended: true
  };

  const md = generateMarkdownReport(report);
  assert.match(md, /PR-Sentinel Code Review/);
  assert.match(md, /@octocat/);
  assert.match(md, /Adds telemetry layer/);
});
