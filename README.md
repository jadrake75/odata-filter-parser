# odata-filter-parser

Library for building and parsing OData filter strings. Supports a subset of functions defined in the OData specification V2 through V4.

## Using the Library

Full API documentation and examples are available on the [Documentation](https://github.com/jadrake75/odata-filter-parser/blob/master/doc/Intro.md) page.

### Compatibility
Supports modern Node.js environments and browsers.

### Including the Library

#### CommonJS
```javascript
const { Parser, Predicate, Operators } = require('odata-filter-parser');

const predicate = Parser.parse("name eq 'John'");
console.log(predicate.serialize()); // (name eq 'John')
```

#### ES Modules / TypeScript
```typescript
import { Parser, Predicate, Operators } from 'odata-filter-parser';

const predicate = Parser.parse("name eq 'John'");
console.log(predicate?.serialize()); // (name eq 'John')
```

## Using the Library with TypeScript

`odata-filter-parser` includes built-in TypeScript type definitions (`index.d.ts`) exported out of the box. No manual type declarations or `@custom_types` workarounds are needed.

Simply import `Parser`, `Predicate`, and `Operators` directly in your TypeScript project:

```typescript
import { Parser, Predicate, Operators } from 'odata-filter-parser';

// Parse an OData filter string
const predicate: Predicate | null = Parser.parse("date ge datetimeoffset'2023-01-01T00:00:00Z'");

// Construct predicates programmatically
const p1 = new Predicate({ subject: 'age', operator: Operators.GREATER_THAN, value: 21 });
const p2 = new Predicate({ subject: 'status', operator: Operators.EQUALS, value: 'active' });
const combined = Predicate.concat(Operators.AND, p1, p2);

console.log(combined.serialize()); // ((age gt 21) and (status eq 'active'))
```

## Operators Reference

The library provides predefined `Operators` constants for constructing and parsing OData filter expressions:

| Constant Name | Keyword | Type | Description |
| :--- | :--- | :--- | :--- |
| `Operators.EQUALS` | `'eq'` | Comparison | Evaluates whether a property is equal to a specified value. |
| `Operators.NOT_EQUAL` | `'ne'` | Comparison | Evaluates whether a property is not equal to a specified value. |
| `Operators.GREATER_THAN` | `'gt'` | Comparison | Evaluates whether a property value is strictly greater than a specified value. |
| `Operators.GREATER_THAN_EQUAL` | `'ge'` | Comparison | Evaluates whether a property value is greater than or equal to a specified value. |
| `Operators.LESS_THAN` | `'lt'` | Comparison | Evaluates whether a property value is strictly less than a specified value. |
| `Operators.LESS_THAN_EQUAL` | `'le'` | Comparison | Evaluates whether a property value is less than or equal to a specified value. |
| `Operators.AND` | `'and'` | Logical | Logical binary conjunction that evaluates to true if both logical expressions are true. |
| `Operators.OR` | `'or'` | Logical | Logical binary disjunction that evaluates to true if either logical expression is true. |
| `Operators.NOT` | `'not'` | Logical | Logical unary prefix operator that negates a logical expression. |
| `Operators.IN` | `'in'` | Membership | Determines whether a value is a member of a discrete set of values. |
| `Operators.HAS` | `'has'` | Flags / Bitmask | Determines whether a property contains a specific enumeration flag or bitwise mask. |
| `Operators.LIKE` | `'like'` | String Extension | Wildcard string matching operator that translates to standard OData string functions (`contains`, `startswith`, `endswith`). |
| `Operators.IS_NULL` | `'is null'` | Extension | Unary postfix operator that determines whether a property is null. |

## Functions Reference

The library provides `Functions` constants for string matching functions supported in OData filter expressions:

| Constant Name | Keyword | Description |
| :--- | :--- | :--- |
| `Functions.CONTAINS` | `'contains'` | Checks if a string property contains a specified substring. |
| `Functions.STARTSWITH` | `'startswith'` | Checks if a string property starts with a specified prefix substring. |
| `Functions.ENDSWITH` | `'endswith'` | Checks if a string property ends with a specified suffix substring. |
| `Functions.ENDSWIDTH` | `'endswith'` | Legacy constant retained for backward compatibility (deprecated). |

## Including the Library with Aurelia CLI
If using Aurelia CLI, configure the dependency in `aurelia.json`:

```json
{
   "name": "odata-filter-parser",
   "path": "../node_modules/odata-filter-parser",
   "main": "index"
}
```

## Dependencies

### Runtime
This library has **zero runtime dependencies** (the `dependencies` section in `package.json` is empty), ensuring zero transitive dependency conflicts and a lightweight bundle.

### Development Tooling
All build and testing utilities are scoped strictly to `devDependencies`:
- **tsup**: Bundler (powered by `esbuild`)
- **Vitest**: Test runner
- **TypeScript**: Type definitions and compilation support
- **ESLint**: Code quality and linting rules

None of these development tools are required or installed when consuming `odata-filter-parser` in your application.

## Platform Support
Works on all modern browsers and Node.js runtimes.

## Building The Library
The project uses `tsup` (powered by `esbuild`) for fast zero-config bundling.

To build the unminified (`dist/odata-parser.js`) and minified (`dist/odata-parser-min.js`) library bundles:

```bash
npm run build
```

## Running Tests

Tests are powered by [Vitest](https://vitest.dev/).

To run all unit tests:
```bash
npm test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

## Linting

To run ESLint across the codebase:
```bash
npm run eslint
```

## Submission Guidelines
Pull requests are welcome for bug fixes or feature requests. Please contact the owner prior to proposing a pull request for major non-bug changes. All submissions should provide test coverage and pass ESLint checks (`npm run eslint`).

## Deployment Information

1. Update version in `package.json` matching the release tag.
2. Commit changes.
3. Create release tag:
   ```bash
   git tag -a <newVersion> -m "created tag <newVersion>"
   git push origin --tags
   ```
4. Pack and publish:
   ```bash
   npm pack
   npm publish
   ```
