# Introduction

The odata-filter-parser library is a lightweight library used for the serialization and deserialization of odata `$filter` strings into a 
JavasScript object structure.  This is used by several projects under the [stamp-web](http://github.com/stamp-web) organization both
with NodeJS server modules (stamp-webservices) and client applications (stamp-web-aurelia).  If others find it of use they are more than
welcome to leverage it, but support will be limited.  Please see the list of [Operators](#Operators) below that are supported as well as [Functions](#Functions)
<p>
This library is compatible with the $filter syntax for V2 through V4 of OData but only supports as subset of functions and behaviors.

#### Dependencies
For dependency information see the note in the [README](https://github.com/jadrake75/odata-filter-parser/blob/master/README.md#Dependencies)

#### Install via JSPM
Assuming your project already supports npm and jspm, you can install the module via JSPM:

```
jpsm install odata-filter-parser
```

this will install the module into your `jspm_packages` folder and create any mappings in the `config.js`

#### Install via NPM
If you have a NodeJS project you can install the module directly from NPM:

```
npm install --save odata-filter-parser
```

this will install the module into the `node_modules` directory structure.

# Reference
Using the provided objects can be achieved using the require syntax.  By default, the required module `odata-filter-parser` returns three objects:

  * *Operators* (singleton)
  * *Predicate*
  * *Parser* (singleton)

Only the `Predicate` provides a constructor that can be used with `new Predicate()`.  To include the module use the following syntax:

```
var odataFilter = require('odata-filter-parser');
```

Or if only one of the objects is needed, you can access it directly:

```
var parser = require('odata-filter-parser').Parser;
```



## Operators
The following list of OData operators are supported by the parser and predicates

<p>
<table>
<tr><th> Operator constant  </th><th> OData operator        </th><th> Comments                          </th></tr>
<tr><td> EQUALS             </td><td> eq                    </td><td> equality evaluation               </td></tr>
<tr><td> AND                </td><td> and                   </td><td> logical and operation             </td></tr>
<tr><td> OR                 </td><td> or                    </td><td> logical _or_ operation            </td></tr>
<tr><td> GREATHER_THAN      </td><td> gt                    </td><td> greater than evaluation exclusive </td></tr>
<tr><td> GREATER_THAN_EQUAL </td><td> ge                    </td><td> greater than evaluation inclusive </td></tr>
<tr><td> LESS_THAN          </td><td> lt                    </td><td> less than evaluation exclusive    </td></tr>
<tr><td> LESS_THAN_EQUAL    </td><td> le                    </td><td> less than evaluation inclusive    </td></tr>
<tr><td> LIKE               </td><td> like                  </td><td> like expression                   </td></tr>
<tr><td> IS_NULL            </td><td> is null               </td><td> null or empty statement           </td></tr>
<tr><td> NOT_EQUAL          </td><td> ne                    </td><td> non-equality evaluation           </td></tr>
</table>


There are also a few functions available on Operators:

#### isUnary()
Whether the operator only involves one reference to return a boolean result.  `Operators.IS_NULL` is an example of a unary operation.

#### isLogical()
Whether the operator is used for logical "gate" operations such as `Operators.AND` and `Operators.OR`

## Predicate
The Predicate is a simple object with particular values and provides some useful utility functions for operating on the Predicate.

####serialize()
This is the primary use-case of the predicate which is the facilitate the serialization of the Predicate to a value OData filter string.
For compatibility all predicates will be wrapped by `()` to ensure cleaner processing and parsing by this library or other libraries.

##### Example serializing a simple predicate
```
    var p = new Predicate( {
        subject: 'name',
        operator: Operators.EQUALS,
        value: 'Jerry'
     });
     var s = p.serialize();
```
will result in `s` being the value `(name eq 'Jerry')`

#### flatten()
The flatten function will take a Predicate and will return and array of Predicates.  If the Predicate represents a logical operator such as `Operators.OR` or
`Operators.AND` it will use the subject and value of these predicates in a recursive fashion.

##### Example flattening a simple structure with a logical operator
```
{
    subject: {
        subject: 'name',
        operator: 'eq',
        value: 'Serena'
    },
    operator: 'and',
    value: {
        subject: 'age',
        operator: 'lt',
        value: 5
    }
}
```
will result in the following output (where each object in the array is a Predicate):
```
[
    {
        subject: 'name',
        operator: 'eq',
        value: 'Serena'
    }, {
        subject: 'age',
        operator: 'lt',
        value: 5
    }
]
```

## Parser
The parser is used to convert a string value representing a OData $filter string and convert this into a valid [Predicate](#Predicate) object (structure).

#### parse(filter:string)
Will parse the string and convert it to a `Predicate` object.  The object returned will be nested based on the structure of the $filter string. 
If the filter string is null or empty, a value of `null` will be returned.  When a predicate is created from the filter string, if the subject is not another
predicate it will be encoded as a string.  The value will be encoded either as a Predicate (for logical operations), a string, number or boolean. 

##### Example parsing a simple expression
Given a string `name eq 'Bob` the parse will result in a Predicate that looks like the following:
```
{
    subject: 'name',
    operator: 'eq',
    value: 'Bob'
}
```

##### Example parsing a more complex expression
Given the string `((name eq 'Serena') and (age lt 5))` the resulting Predicate looks like:
```
{
    subject: {
        subject: 'name',
        operator: 'eq',
        value: 'Serena'
    },
    operator: 'and',
    value: {
        subject: 'age',
        operator: 'lt',
        value: 5
    }
}
```
