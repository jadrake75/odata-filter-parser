# Guidelines for AI Agents

Welcome! This document outlines the patterns, best practices, and guidelines for agentic development in the `odata-filter-parser` repository.

---

## 1. Test Execution

### How to Run Tests
- **All tests:**
  ```bash
  npm test
  ```
- **Single test file:**
  ```bash
  npx vitest run test/unit/operator.spec.js
  ```
- **Build assets:**
  ```bash
  npm run build
  ```

---

## 2. ESLint Rules
Ensure all ESLint checks pass by running:
```bash
npm run eslint
```
The recommended Jest lint rules are fully enabled. Avoid introducing `done` callbacks or conditional expects.


---

## 3. Maintenance of AGENTS.md
After completing any development or debugging task, the agent must evaluate whether to update this document (`AGENTS.md`) with new patterns, learnings, environment details, or best practices discovered during the activity, without needing explicit instructions from the user.

---

## 4. Managing Dependency Vulnerabilities (npm audit)
When addressing npm audit vulnerability reports for nested dependencies, use npm `overrides` in `package.json` to force upgrading the vulnerable packages to a secure version.
Avoid using `npm audit fix --force` if it introduces breaking changes (such as downgrading packages or changing major versions of direct dependencies like `jest`).

---

## 5. TypeScript Support
Type definitions for `odata-filter-parser` are maintained in [index.d.ts](file:///D:/src/odata-filter-parser/index.d.ts) and exported via `"types": "index.d.ts"` in [package.json](file:///D:/src/odata-filter-parser/package.json). Any changes to public API signatures (`Predicate`, `Operators`, `Parser`) should be updated in `index.d.ts`.

---

## 6. Build and Configuration Files (.mjs)
The project uses ES module configuration files tracked in version control:
- `tsup.config.mjs`: Bundler configuration for generating `dist/odata-parser.js` and `dist/odata-parser-min.js`.
- `vitest.config.mjs`: Vitest test runner configuration.
- `eslint.config.mjs`: ESLint flat configuration file.

When adding new `.mjs` configuration files, always ensure they are added to git tracking.



