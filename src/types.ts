export interface SecretFinding {
  type: string;
  file: string;
  line: number;
  snippet: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface StandardsFinding {
  rule: string;
  passed: boolean;
  message: string;
  level: 'error' | 'warning' | 'info';
}

export interface AIReviewResult {
  summary: string;
  keyChanges: string[];
  potentialIssues: string[];
  suggestions: string[];
  securityNotes: string[];
}

export interface ReviewReport {
  prNumber: number;
  prTitle: string;
  author: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  secretsFound: SecretFinding[];
  standards: StandardsFinding[];
  aiReview?: AIReviewResult;
  isApprovalRecommended: boolean;
}
