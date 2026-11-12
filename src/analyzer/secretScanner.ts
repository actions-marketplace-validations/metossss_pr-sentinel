import { SecretFinding } from '../types';

interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: 'critical' | 'high' | 'medium';
}

const PATTERNS: SecretPattern[] = [
  {
    name: 'OpenAI API Key',
    regex: /sk-(?:live|proj)?[a-zA-Z0-9_-]{32,}/g,
    severity: 'critical'
  },
  {
    name: 'GitHub Token',
    regex: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,}/g,
    severity: 'critical'
  },
  {
    name: 'AWS Access Key',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    severity: 'critical'
  },
  {
    name: 'Private Key',
    regex: /-----BEGIN\s+(?:RSA|OPENSSH|EC|PGP|PRIVATE)\s+KEY-----/g,
    severity: 'critical'
  },
  {
    name: 'Slack Webhook / Token',
    regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
    severity: 'high'
  },
  {
    name: 'Potential Hardcoded Secret',
    regex: /(?:secret|password|passwd|api_key|apikey|auth_token)\s*[:=]\s*["']([A-Za-z0-9_\-.~!@#$%^&*]{8,})["']/i,
    severity: 'medium'
  }
];

export function scanDiffForSecrets(patch: string, filename: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = patch.split('\n');

  let currentLine = 0;
  for (const line of lines) {
    // Only inspect additions (lines starting with '+', but ignore '+++')
    if (line.startsWith('+') && !line.startsWith('+++')) {
      currentLine++;
      const content = line.substring(1);

      for (const pattern of PATTERNS) {
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(content);
        if (match) {
          // Obfuscate secret in report for safety
          const matchedText = match[0];
          const obfuscated = matchedText.length > 8 
            ? `${matchedText.substring(0, 4)}...${matchedText.substring(matchedText.length - 4)}`
            : '********';

          findings.push({
            type: pattern.name,
            file: filename,
            line: currentLine,
            snippet: obfuscated,
            severity: pattern.severity
          });
        }
      }
    }
  }

  return findings;
}
