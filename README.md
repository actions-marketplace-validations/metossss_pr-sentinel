<p align="center">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/actions/actions.png" width="80" alt="PR-Sentinel Logo" />
</p>

<h1 align="center">PR-Sentinel 🛡️</h1>

<p align="center">
  <strong>Automated, AI-Augmented Pull Request Reviewer & Quality Gatekeeper for Open Source Repositories.</strong>
</p>

<p align="center">
  <a href="https://github.com"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com"><img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg" alt="Node Version"></a>
  <a href="https://github.com"><img src="https://img.shields.io/badge/typescript-5.x-blue.svg" alt="TypeScript"></a>
  <a href="https://github.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

## 💡 Why PR-Sentinel?

Open source maintainers spend countless hours triaging pull requests, verifying commit conventions, reminding contributors to link issues, and ensuring accidental secrets or API keys are not committed.

**PR-Sentinel** is built specifically for open-source maintainers. It acts as an automated first-responder on your repository:
1. **Scans diffs for accidentally leaked API keys & tokens** (OpenAI, AWS, GitHub PATs, private keys) *before* they get merged into git history.
2. **Enforces open source hygiene** (Conventional Commits, detailed descriptions, linked issues, and PR size guardrails).
3. **Generates AI semantic architectural reviews** (via OpenAI / Codex) if an API key is provided, providing actionable summaries and highlighting edge cases.
4. **Idempotent PR Comments**: Updates its existing review comment instead of spamming contributors on every commit.

---

## 🚀 Quick Start

Create a workflow file in your repository at `.github/workflows/pr-review.yml`:

```yaml
name: PR Sentinel Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run PR-Sentinel
        uses: metossss/pr-sentinel@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }} # Optional: enables AI semantic review
          fail-on-secrets: 'true'
```

---

## ⚙️ Configuration & Inputs

| Input | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `github-token` | GitHub token for reading PR diffs and posting comments | **Yes** | `${{ github.token }}` |
| `openai-api-key` | OpenAI API key to enable semantic code reviews | No | `""` |
| `openai-model` | OpenAI model identifier | No | `'gpt-4o-mini'` |
| `check-secrets` | Scan pull request diffs for leaked secrets & credentials | No | `'true'` |
| `fail-on-secrets` | Fail the GitHub Action run if sensitive secrets are found | No | `'false'` |
| `comment-pr` | Post or update an automated review summary comment | No | `'true'` |

### Outputs

| Output | Description |
| :--- | :--- |
| `secrets-detected` | `true` if sensitive credentials or tokens were discovered in the diff |
| `review-status` | Quality gate outcome (`passed` or `warning`) |

---

## 📋 Example PR Review Output

When a contributor opens or updates a Pull Request, PR-Sentinel generates a clean, structured comment:

```markdown
## 🛡️ PR-Sentinel Code Review

✅ **Quality Gate: Ready for Maintainer Review**

| Metric | Details |
| :--- | :--- |
| **Author** | @contributor |
| **Diff Stats** | `4` files changed (+120 / -15) |
| **Security Status** | ✅ Clean |

### 🤖 AI Architectural Analysis
> Adds authentication middleware and rate-limiting safeguards to the API gateway.

#### 📌 Key Changes
- Integrated JWT token validator.
- Added in-memory token bucket rate limiting.

#### 🔍 Observations & Potential Edge Cases
- ⚠️ Ensure clock drift tolerance is configured for token expiration checks.

#### 💡 Suggestions
- 💡 Consider caching decoded public keys to minimize verification overhead.

<details>
<summary><b>📋 Repository Standards & PR Hygiene Checks</b></summary>

| Rule | Status | Details |
| :--- | :---: | :--- |
| **Conventional Commits** | ✅ | PR title complies with Conventional Commits specification. |
| **PR Description** | ✅ | PR has a descriptive summary. |
| **Linked Issue** | ✅ | PR links to an existing issue or reference. |
| **PR Size** | ✅ | PR size is manageable (135 lines changed). |

</details>
```

---

## 🛠️ Local Development & Contributing

1. **Clone the repo:**
   ```bash
   git clone https://github.com/metossss/pr-sentinel.git
   cd pr-sentinel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run unit tests:**
   ```bash
   npm test
   ```

4. **Build distribution bundle:**
   ```bash
   npm run build
   ```

Contributions are welcome! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
