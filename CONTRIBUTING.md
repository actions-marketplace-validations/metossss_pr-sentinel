# Contributing to PR-Sentinel

Thank you for your interest in contributing to **PR-Sentinel**! 🚀

PR-Sentinel is an open-source project designed to reduce the maintenance burden for developers by automating pull request reviews, standards checks, and secret scanning.

## How Can You Contribute?

- **Report Bugs**: Open an issue describing what went wrong with reproduction steps.
- **Suggest Features**: We welcome ideas for new static checks, rule sets, or LLM integrations.
- **Submit Pull Requests**: Implement bug fixes, features, or documentation improvements.

## Development Workflow

1. **Fork and Clone** the repository.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run tests**:
   ```bash
   npm test
   ```
4. **Compile & Build Action**:
   Make sure to re-bundle the action before submitting:
   ```bash
   npm run build
   ```
5. **Commit your changes**:
   Please follow the [Conventional Commits](https://www.conventionalcommits.org/) convention:
   - `feat(analyzer): add check for Dockerfile security`
   - `fix(scanner): ignore false positive in markdown docs`
   - `docs: update setup instructions in README`

6. **Submit a Pull Request**:
   Fill in the PR template and wait for CI and automated reviews to pass.
