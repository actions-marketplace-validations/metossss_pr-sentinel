import * as core from '@actions/core';
import * as github from '@actions/github';
import { scanDiffForSecrets } from './analyzer/secretScanner';
import { checkConventionalCommit } from './analyzer/conventionalCommit';
import { checkPRStandards } from './analyzer/standardsChecker';
import { runAIReview } from './analyzer/aiReviewer';
import { generateMarkdownReport } from './reporter/markdownFormatter';
import { ReviewReport, SecretFinding, StandardsFinding } from './types';

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token', { required: true });
    const openaiApiKey = core.getInput('openai-api-key');
    const openaiModel = core.getInput('openai-model') || 'gpt-4o-mini';
    const checkSecrets = core.getInput('check-secrets') !== 'false';
    const commentPR = core.getInput('comment-pr') !== 'false';
    const failOnSecrets = core.getInput('fail-on-secrets') === 'true';

    const context = github.context;
    if (!context.payload.pull_request) {
      core.setFailed('This action can only run on pull_request events.');
      return;
    }

    const pr = context.payload.pull_request;
    const prNumber = pr.number;
    const prTitle = pr.title || '';
    const prBody = pr.body || '';
    const author = pr.user?.login || 'unknown';

    const octokit = github.getOctokit(githubToken);

    core.info(`🛡️ PR-Sentinel analyzing PR #${prNumber}: "${prTitle}" by @${author}`);

    // Fetch PR files and diffs
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      per_page: 100
    });

    const secretsFound: SecretFinding[] = [];
    const diffSummaries: string[] = [];
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const file of files) {
      totalAdditions += file.additions;
      totalDeletions += file.deletions;

      // 1. Scan for secrets
      if (checkSecrets && file.patch) {
        const found = scanDiffForSecrets(file.patch, file.filename);
        secretsFound.push(...found);
      }

      // Collect concise patch summary for AI review
      if (file.patch) {
        const truncatedPatch = file.patch.length > 1500 
          ? file.patch.substring(0, 1500) + '\n... [truncated]' 
          : file.patch;
        diffSummaries.push(`--- ${file.filename} (+${file.additions}/-${file.deletions}) ---\n${truncatedPatch}`);
      }
    }

    // 2. Standards checks
    const standards: StandardsFinding[] = [
      checkConventionalCommit(prTitle),
      ...checkPRStandards(prBody, totalAdditions + totalDeletions)
    ];

    // 3. Optional AI review
    let aiReview;
    if (openaiApiKey && openaiApiKey.trim().length > 0) {
      core.info('🤖 Running AI semantic analysis with OpenAI...');
      aiReview = await runAIReview(
        openaiApiKey,
        openaiModel,
        prTitle,
        prBody,
        diffSummaries.slice(0, 15) // limit diffs to avoid token overflow
      );
    } else {
      core.info('ℹ️ OpenAI API key not provided; skipping AI semantic analysis.');
    }

    const isApprovalRecommended = 
      secretsFound.length === 0 && 
      !standards.some(s => s.level === 'error');

    const report: ReviewReport = {
      prNumber,
      prTitle,
      author,
      filesChanged: files.length,
      additions: totalAdditions,
      deletions: totalDeletions,
      secretsFound,
      standards,
      aiReview,
      isApprovalRecommended
    };

    const markdownComment = generateMarkdownReport(report);

    // 4. Post or update PR comment
    if (commentPR) {
      const COMMENT_TAG = '<!-- pr-sentinel-review-comment -->';
      const fullCommentBody = `${COMMENT_TAG}\n${markdownComment}`;

      // Search if a previous comment exists to update rather than spam
      const { data: comments } = await octokit.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber
      });

      const existingComment = comments.find(c => c.body?.includes(COMMENT_TAG));

      if (existingComment) {
        core.info(`Updating existing comment #${existingComment.id}`);
        await octokit.rest.issues.updateComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: existingComment.id,
          body: fullCommentBody
        });
      } else {
        core.info('Creating new review comment');
        await octokit.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: prNumber,
          body: fullCommentBody
        });
      }
    }

    // Set Action outputs
    core.setOutput('secrets-detected', secretsFound.length > 0);
    core.setOutput('review-status', isApprovalRecommended ? 'passed' : 'warning');

    if (secretsFound.length > 0 && failOnSecrets) {
      core.setFailed(`PR-Sentinel blocked this PR due to ${secretsFound.length} detected secret(s).`);
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    core.setFailed(`PR-Sentinel failed: ${msg}`);
  }
}

run();
