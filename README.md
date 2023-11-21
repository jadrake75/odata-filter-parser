# odata-filter-parser

Library for parsing and building and parsing OData filter strings.  Only compatible with a subset of functions defined in OData specification

* Supports OData specification V2 through V4 (partially)

## Using the Library
Full API documentation and examples is available on the [Documentation](https://github.com/jadrake75/odata-filter-parser/blob/master/doc/Intro.md) page.

To include the library in your application, you can either reference the `.js` files under the `dist` folder or use the JSPM / Node 
modular inclusion discussed on the [Documentation](https://github.com/jadrake75/odata-filter-parser/blob/master/doc/Intro.md) page.

### Compatibility
It is required to use a supported ES6 level of JavaScript (supported by all current browsers and NodeJS supported versions) with
version 0.4.0 or higher.


## Including the Library with Aurelia CLI
The new Aurelia CLI will have difficulty resolving the dependencies from the require statements and try and resolve odata-filter under src vs the distribution folder.  To resolve this, 
use the following configuration in the dependencies section of the aurelia.json file:
   
  ```
  {
     "name": "odata-filter-parser",
     "path": "../node_modules/odata-filter-parser",
     "main": "index"
  }
  ```

## Using the Library with TypeScript
Currently no types are available for Predicate, Operators and Parser so they may need to be declared locally.  Here is the workaround to do so in your project.

  * Add a directory under src called `@custom_types` if it doesn't exist
  * Create a `odata-filter-parser.d.ts` file with the following contents in this location

  ```
  import { Predicate, Operators, Parser } from 'odata-filter-parser'

  export { Predicate, Operators }
  export default Parser
  ```

   * Modify your compile options block (in a vuejs 3.x project this is likely the `tsconfig.app.json` file) to add the following (only showing the sections modified):

   ```
   "compilerOptions": {
      "paths": {
          "*": ["src/@custom_types/*"]
      }
   },
   "exclude": ["src/@custom_types/*"]
   ```

   
## Dependencies
This library has *no* third-party dependencies (outside of testing and building tools used by source).  No additional software is required.

## Platform Support
This library should work on all modern browsers that support HTML-5 EcmaScript 5 standard as well as V8 (used by NodeJS).

## Building The Library
To build the code, follow these steps.

  * Ensure that [NodeJS](http://nodejs.org) is installed.  This provides the platform on which the build tooling is run.
  * From the project folder, executue the following command:
  
  ```
  npm install
  ```
  * Ensure that [Gulp](http://gulpjs.com) is installed.  If you need to install it, use the following command (however 
  running `npm install` above should have installed a local copy):
  
  ```
  npm install -g gulp
  ```
  * To build the code, you can not run:
  
  ```
  gulp
  ```
  * You will find the built code under the `dist` folder.
  * See `gulpfile.js` for other tasks related to the generating of the library.

## Running Tests

To execute the tests with jest simply run

```
npm test
```

This will generate coverage information automatically.


## Submission Guidelines
Pull-Requests will be used for accepting bug fixes or feature requests, however please contact the owner prior to proposing
a pull-request for non-bug fixes to avoid unnecessary work and effort.  All submissions should provide test coverage and
conform with the eslint standards defined in the `.eslintrc` file.

## Deployment Information

Ensure a proper version is designated in the package.json that matches the commit on github.

Step 1. Update version in package.json

Step 2. Commit changes to github

Step 3. Create Tag of the release locally with

```
git tag -a <newVersion> -m "created tag <newVersion>"
```

Push tag to github

```
git push origin --tags
```

Step 4. Pack the solution for publishing

```
npm pack
```

Step 5. To deploy the module to npmjs use the following command (user access will be required)

```
npm publish
```

Step 6.  Optionally create a release in github using the tag and attach the .tgz used to publish to npmjs

