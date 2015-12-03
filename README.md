# odata-filter-parser

Library for parsing and building OData filter strings


  .
<hr>
## API

The library exports the following objects listed below:

1. **Parser** - The OData filter parser
2. **Operators** - The OData filter operators
3. **Prediate** - An object representing statements with subject, operator and value

### Parser

  * parse( string ) - Will parse the OData filter string into a series of tokens with left and right values and a type operator.
  
<hr>  
## Running Tests

To exist the tests with mocha simply run

```
npm test
```

Or execute them as a mocha job within your IDE

### Code Coverage

You can generate code coverage results using istanbul.  To do so install istanbul globally with

```
npm install -g istanbul
```

Next, to produce coverage results use the following on windows (note the _mocha and fullpath is required at least in my environment)

```
istanbul cover c:\users\<your-userame>\AppData\Roaming\npm\node_modules\mocha\bin\_mocha -- --ui bdd -R spec
```

The results will be in the coverage folder

  .

<hr>

## Deployment Information

To deploy the module to npm use the following command (user access will be required)

```
npm publish
```


