import OpenAI from 'openai';
import { AIReviewResult } from '../types';

export async function runAIReview(
  apiKey: string,
  model: string,
  prTitle: string,
  prBody: string,
  diffSummaries: string[]
): Promise<AIReviewResult> {
  const openai = new OpenAI({ apiKey });

  const prompt = `You are PR-Sentinel, an expert open-source maintainer and code reviewer.
Review the following Pull Request changes and provide constructive, actionable, and succinct feedback.

PR Title: ${prTitle}
PR Description: ${prBody || 'No description provided'}

Changes Diff Summary (truncated if too large):
${diffSummaries.join('\n\n')}

Respond STRICTLY in valid JSON matching this schema:
{
  "summary": "1-2 sentence high-level summary of what this PR accomplishes.",
  "keyChanges": ["Bullet point 1", "Bullet point 2"],
  "potentialIssues": ["Any potential bugs, edge cases, or performance considerations"],
  "suggestions": ["Concrete code improvement or maintainability suggestions"],
  "securityNotes": ["Security considerations or confirm no critical concerns detected"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite open-source senior maintainer performing a code review.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1200
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Received empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as AIReviewResult;
    return {
      summary: parsed.summary || 'Summary unavailable',
      keyChanges: Array.isArray(parsed.keyChanges) ? parsed.keyChanges : [],
      potentialIssues: Array.isArray(parsed.potentialIssues) ? parsed.potentialIssues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      securityNotes: Array.isArray(parsed.securityNotes) ? parsed.securityNotes : []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      summary: `Automated AI review could not be completed: ${errorMessage}`,
      keyChanges: [],
      potentialIssues: [],
      suggestions: [],
      securityNotes: []
    };
  }
}
