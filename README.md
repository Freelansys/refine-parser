---
todo: to simplify the AST and parset, it would be good to unify LetStep and InstanceDeclaration
---

# Spex

Spex is a language designed for programming with LLMs. It addresses shortcomings of the chat interface commonly used in AI coding assistant tools.

In particular, Spex aims to solve the following problems:

- Instructions given to AI coding assistants contain valuable information, but this information is often lost among the noise produced during conversations.
- Professional software developers must adapt to a new mental model when programming through chat interfaces.
- Programs produced through chat interactions are difficult to reproduce because the exact prompts and their order are lost.
- Chat interfaces do not integrate well with existing software engineering tools such as version control systems.
- Referencing objects in the code base requires repetitive and verbose prompts.
- Because architecture and design are not persisted, AI agents must constantly read and reason about multiple files, leading to inefficient token usage.

The idea behind chat interfaces in AI coding tools is that _everyone_ should be able to code. While admirable, this approach often makes the tools inadequate for professional developers.

Spex acknowledges that in serious software projects it is neither wise nor feasible to replace programmers with machines. Instead, Spex integrates with the mental model and ecosystem of professional programmers, enabling them to be significantly more efficient.

For this reason, Spex syntax is intentionally close to common languages such as TypeScript and SQL.

Spex is modeled after a **topos** in category theory. Like any category, it consists of:

- objects
- morphisms
- identities
- composition

As a topos, it also introduces:

- product objects
- exponential objects
- a subobject classifier

## Objects

Objects in Spex are similar to types in common programming languages.

Objects can be declared and aliased:

```spex
object BaseObject = Number
object KeyValuePair = (s: String, n: Number)
object CountCharacters = String -> Number
object PositiveNumber = select Number where `it is positive`
```

### Basic Objects

A small set of basic objects exist in the category. All other objects are constructed from them using products or exponentials.

```
String
Number
Bool
Unit
```

- `Unit` is the **terminal object** in the category.
- `Bool` is the **subobject classifier**.

### Products

Products combine multiple objects into a single object.

Example:

```spex
(s: String, n: Number)
```

The identifiers `s` and `n` are **projections**. They behave like functions that extract the corresponding component from the product.

Example:

```
(n: Number)
```

This is equivalent to the product `Number × Unit`. Since `Unit` is the identity of the product, `(n: Number)` is essentially the same as `Number`.

The empty product:

```
()
```

is equivalent to `Unit`.

### Exponentials

Exponentials correspond to function types.

```
A -> B
```

Examples:

```spex
Unit -> Number
PositiveNumber -> Bool
(s: String, n: Number) -> Unit
(n: Number) -> (b: Bool)
```

Exponentials can appear inside other objects:

```spex
(f: String -> Unit, s: String) -> Unit
```

### Subobjects

A subobject selects a subset of instances from an object.

Example:

```spex
select String where [
  let ends_in_p_or_q: Bool = eval "the string ends in 'p' or 'q'",
  let is_short: Bool = eval "the string has less than 10 characters",
  "return true if the string ${ends_in_p_or_q} and ${is_short}"
]
```

Subobjects may be defined for:

- base objects
- products
- exponentials
- other subobjects

Subobjecting is a special feature of Spex that guides the implementation of the specification. For example, consider the following:

```spex
object NonNegativeNumber = select Number where "the number is greater or equals zero"

let sqrt: NonNegativeNumber -> NonNegativeNumber = "compute the squre root of the given number"
```

Many programming languages does not have a corresponding type for non-negative numbers. So when the agent is implementing the `sqrt` function it should write assertions to make sure the given number and the computed square root are both non-negative.

While subobjecting basic objects (and hence products) is straight forward, subobjecting exponentials is more nuanced. No programming language has a standard method to make assertions about functions as of this writing. Subobjecting exponentials as a result could only be left to judgment of the agent to some extent.

Consider the follwing specification:

```spex
object DistanceFunction = select (x: Number, y: Number) -> NonNegativeNumber where [
  let f: (x: Number, y: Number) -> NonNegativeNumber = eval "return the given morphism",

  let is_zero_when_equal = eval "for all x we have ${f}(x,x) == 0",

  let is_symmetric: Bool = eval "for all x,y we have ${f}(x,y) == ${f}(y,x)",

  let satisfies_triangle_inequality = eval "for all x,y,z ${f}(x,z) <= ${f}(x,y) + ${f}(y,z)",

  "return true if all of ${is_zero_when_equal}, ${is_symmetric} and ${satisfies_triangle_inequality} are true"
]

let abs: DistanceFunction = "compute the absolute value of subtracting ${x} from ${y}"
```

The agent has no method of proving `abs` is indeed an instance of `DistanceFunction` using most standard programming languages. So it has to make a judgment call to decide wether the provided instructions adhere to the conditions specified in the subobject or not. Best case scenario, it can write some tests to empirically assert the implementation is correct.

## Instances

Every object contains instances.

Instances may be aliased:

```spex
let s: String = 'hello'

let print: String -> Unit =
  "print the given string in the console"
```

### Basic Object Instances

Instances of basic objects are **literals**.

Examples:

```spex
let s: String = 'hello'
let n: Number = 1.2
let b: Bool = true
```

The object `Unit` has exactly one instance:

```
{}
```

### Product Instances

Instances of product objects are written as JSON records:

```spex
let kvp: KeyValuePair = {
  s: 'pi',
  n: 3.1415
}
```

### Exponential Instances

Instances of exponential objects are **morphisms**.

Morphisms represent sequences of steps executed in order.

Example:

```spex
let trap: (f: Number -> Number) -> Number = [
  let int: Number = eval "approximate the integral of ${f} using the trapezoid rule",
  "return ${int}"
]
```

#### Instructions

Instructions represent natural-language steps. They are analogous to lambda expressions in a programming language.

They are written as double-quoted strings.

Example:

```spex
"print 'hello'"
```

Named instances can be referenced using interpolation:

```spex
[
  let hello: String = 'hello',
  "print ${hello}"
]
```

#### Composition

Morphisms may be composed.

Composition blocks are written using square brackets:

```spex
[
  "read the data from ${file}",
  "insert it in the table"
]
```

Steps inside a composition execute sequentially. It is possible to declare objects or instances in between steps which could be refrenced in the scope of the composition.

#### Given Expression

The `given` keyword is used to make a partial morphism from an exponential instance.

Example:

```spex
let add: (x: Number, y: Number) -> Number = "add ${x} to ${y}"

let increment: (x: Number) -> Number = functionNorm given { y: 1 }
```

#### If Expression

An `if` statement executes one of two branches based on a given `Bool` instance.

```spex
[
  let input: CliInput = eval "read the arguments from command line",

  if eval "${input.command} equals 'add'"
  then addTodo given { description: input.arg }
  else printHelp
]
```

### Eval Expression

The `eval` keyword is used to execute a morphism that has `Unit` as its domain.

Example

```spex
let hello: String = eval "return 'hello'"
```

`eval` and `given` could be chained together to execute a morphism with a domain other than `Unit`.

Example

```spex
let sum: Number = eval "add ${a} to ${b}" given { a: 1, b: 2 }
```

### Property Access

Property access allows referencing fields of product instances using dot notation.

```spex
let input: CliInput = eval "read command and arguments from cli"

let config: Config = eval "load configuration"

// Access properties with dot notation
let todo: Todo = eval "get todo with id ${input.arg1} from ${config.db}"
```

Nested property access is supported:

```spex
let path: String = config.database.path
```

Property access works with:

- Named instances: `input.arg1`
- Interpolated strings: `"${input.arg1}"`
- Product instances in `given` expressions

## Grammar

```
spexFile        ::= declaration*

declaration     ::= objectDeclaration | instanceDeclaration

objectDeclaration
                ::= 'object' Identifier '=' objectExpression

objectExpression
                ::= objectOperand ('->' objectExpression)?

objectOperand   ::= subObject | productObject | Identifier

productObject   ::= '(' (Identifier ':' objectExpression ',')* ')'

subObject       ::= 'select' objectExpression 'where' instanceExpression

instanceDeclaration
                ::= 'let' Identifier ':' objectExpression '=' instanceExpression

instanceExpression
                ::= instancePrimary ('.' Identifier)*

instancePrimary ::= evalExpression
                |   givenExpression
                |   ifExpression
                |   composition
                |   productInstance
                |   literalOrNamedInstance

literalOrNamedInstance
                ::= Instruction | StringLiteral | NumberLiteral | BoolLiteral | Identifier

productInstance ::= '{' (Identifier ':' instanceExpression ',')* '}'

composition     ::= '[' (localDeclaration | instanceExpression ',')* ']'

localDeclaration
                ::= objectDeclaration | instanceDeclaration

evalExpression  ::= 'eval' instanceExpression

givenExpression ::= literalOrNamedInstance givenExpressionSuffix

givenExpressionSuffix
                ::= 'given' (productInstance | literalOrNamedInstance)

ifExpression    ::= 'if' instanceExpression 'then' instanceExpression ('else' instanceExpression)? ','?
```

### Token Reference

| Token      | Pattern                                                                   | Description                    |
| ---------- | ------------------------------------------------------------------------- | ------------------------------ |
| Keywords   | `object`, `let`, `select`, `where`, `if`, `then`, `else`, `eval`, `given` | Language keywords              |
| Symbols    | `->`, `{}`, `[]`, `()`, `:`, `,`, `.`, `=`                                | Syntax delimiters              |
| Literals   | `"..."`, `'...'`, numbers, `true`/`false`                                 | String, number, boolean values |
| Identifier | `[a-zA-Z_][a-zA-Z0-9_]*`                                                  | Variable and type names        |
