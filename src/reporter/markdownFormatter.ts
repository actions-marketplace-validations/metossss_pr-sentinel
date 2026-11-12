import { ReviewReport } from '../types';

export function generateMarkdownReport(report: ReviewReport): string {
  const hasSecrets = report.secretsFound.length > 0;
  const statusBadge = hasSecrets
    ? '🚨 **Action Required: Security Secrets Detected**'
    : report.isApprovalRecommended
    ? '✅ **Quality Gate: Ready for Maintainer Review**'
    : '⚠️ **Quality Gate: Minor Revisions Recommended**';

  let md = `## 🛡️ PR-Sentinel Code Review\n\n`;
  md += `${statusBadge}\n\n`;

  // Summary Metrics Table
  md += `| Metric | Details |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Author** | @${report.author} |\n`;
  md += `| **Diff Stats** | \`${report.filesChanged}\` files changed (+${report.additions} / -${report.deletions}) |\n`;
  md += `| **Security Status** | ${hasSecrets ? `❌ **${report.secretsFound.length} secrets detected**` : '✅ Clean'} |\n\n`;

  // 1. Critical Secrets Section (if any)
  if (hasSecrets) {
    md += `### 🚨 Security Alert: Potential Secrets Detected\n`;
    md += `PR-Sentinel detected sensitive patterns in this diff. **Please revoke these credentials immediately and remove them from git history!**\n\n`;
    md += `| Type | File | Line | Obfuscated Match |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const secret of report.secretsFound) {
      md += `| \`${secret.type}\` | \`${secret.file}\` | \`L${secret.line}\` | \`${secret.snippet}\` |\n`;
    }
    md += `\n---\n\n`;
  }

  // 2. AI Review Section (if available)
  if (report.aiReview) {
    md += `### 🤖 AI Architectural Analysis\n\n`;
    md += `> ${report.aiReview.summary}\n\n`;

    if (report.aiReview.keyChanges.length > 0) {
      md += `#### 📌 Key Changes\n`;
      for (const item of report.aiReview.keyChanges) {
        md += `- ${item}\n`;
      }
      md += `\n`;
    }

    if (report.aiReview.potentialIssues.length > 0) {
      md += `#### 🔍 Observations & Potential Edge Cases\n`;
      for (const item of report.aiReview.potentialIssues) {
        md += `- ⚠️ ${item}\n`;
      }
      md += `\n`;
    }

    if (report.aiReview.suggestions.length > 0) {
      md += `#### 💡 Suggestions\n`;
      for (const item of report.aiReview.suggestions) {
        md += `- 💡 ${item}\n`;
      }
      md += `\n`;
    }

    if (report.aiReview.securityNotes.length > 0) {
      md += `#### 🔒 Security Notes\n`;
      for (const item of report.aiReview.securityNotes) {
        md += `- 🛡️ ${item}\n`;
      }
      md += `\n`;
    }
  }

  // 3. Standards & Hygiene
  md += `<details>\n<summary><b>📋 Repository Standards & PR Hygiene Checks</b></summary>\n\n`;
  md += `| Rule | Status | Details |\n`;
  md += `| :--- | :---: | :--- |\n`;
  for (const std of report.standards) {
    const icon = std.passed ? '✅' : (std.level === 'error' ? '❌' : '⚠️');
    md += `| **${std.rule}** | ${icon} | ${std.message} |\n`;
  }
  md += `\n</details>\n\n`;

  md += `---\n`;
  md += `*Generated automatically by [PR-Sentinel](https://github.com/marketplace/actions/pr-sentinel) — Open-source PR quality automation.*`;

  return md;
}
