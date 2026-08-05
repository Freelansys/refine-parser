import { describe, it, expect } from 'vitest'
import { parseToAst, parseConstraint } from '../src/visitor.js'
import type {
  ObjectDeclaration,
  ImportDeclaration,
  ExportDeclaration,
  GenerateDeclaration,
  PackageDeclaration,
  EnumObject,
  Constraint,
} from '../src/ast.js'

describe('SpexParserVisitor', () => {
  describe('lexing errors', () => {
    it('should throw on unexpected characters', () => {
      expect(() => parseToAst('package module spex-parser as Main;')).toThrow(
        'Lexing errors: unexpected character: ->-<'
      )
    })

    it('should throw on unclosed block comments', () => {
      expect(() => parseToAst('create Foo as string; /* unclosed')).toThrow(/Lexing errors:/)
    })

    it('should not throw when the input lexes cleanly', () => {
      expect(() => parseToAst('create Foo as string;')).not.toThrow()
    })
  })

  describe('object declaration', () => {
    it('should convert named object declaration to AST', () => {
      const testCase = 'create MyObject as Number;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyObject',
        object: {
          kind: 'NamedObject',
          name: 'Number',
        },
      })
    })

    it('should convert product object declaration to AST', () => {
      const testCase = 'create MyProduct as (n: Number, s: String);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyProduct',
        object: {
          kind: 'ProductObject',
          fields: {
            n: { kind: 'NamedObject', name: 'Number' },
            s: { kind: 'NamedObject', name: 'String' },
          },
        },
      })
    })

    it('should convert product object declaration with trailing commas to AST', () => {
      const testCase = 'create MyProduct as (n: Number, s: String,);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyProduct',
        object: {
          kind: 'ProductObject',
          fields: {
            n: { kind: 'NamedObject', name: 'Number' },
            s: { kind: 'NamedObject', name: 'String' },
          },
        },
      })
    })

    it('should convert product object declaration with exponential objects to AST', () => {
      const testCase = 'create MyProduct as (f: Number -> String, n: Number);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyProduct',
        object: {
          kind: 'ProductObject',
          fields: {
            f: {
              kind: 'ExponentialObject',
              exponent: { kind: 'NamedObject', name: 'Number' },
              base: { kind: 'NamedObject', name: 'String' },
            },
            n: { kind: 'NamedObject', name: 'Number' },
          },
        },
      })
    })

    it('should convert product object declaration with subobjects to AST', () => {
      const testCase =
        'create MyProduct as (p: from Number select { value is positive }, n: Number);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyProduct',
        object: {
          kind: 'ProductObject',
          fields: {
            p: {
              kind: 'SubObject',
              base: { kind: 'NamedObject', name: 'Number' },
              constraint: {
                raw: 'value is positive',
                parts: [{ kind: 'ConstraintText', text: 'value is positive' }],
              },
            },
            n: { kind: 'NamedObject', name: 'Number' },
          },
        },
      })
    })

    it('should convert exponential object declaration with named object to AST', () => {
      const testCase = 'create MyExponential as Number -> Unit;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyExponential',
        object: {
          kind: 'ExponentialObject',
          exponent: { kind: 'NamedObject', name: 'Number' },
          base: { kind: 'NamedObject', name: 'Unit' },
        },
      })
    })

    it('should convert exponential object declaration with product objects to AST', () => {
      const testCase = 'create MyExponential as (n: Number) -> (s: String);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyExponential',
        object: {
          kind: 'ExponentialObject',
          exponent: {
            kind: 'ProductObject',
            fields: {
              n: { kind: 'NamedObject', name: 'Number' },
            },
          },
          base: {
            kind: 'ProductObject',
            fields: {
              s: { kind: 'NamedObject', name: 'String' },
            },
          },
        },
      })
    })

    it('should convert exponential object declaration with exponential objects to AST', () => {
      const testCase = 'create MyExponential as (f: Number -> String, n: Number) -> String;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyExponential',
        object: {
          kind: 'ExponentialObject',
          exponent: {
            kind: 'ProductObject',
            fields: {
              f: {
                kind: 'ExponentialObject',
                exponent: { kind: 'NamedObject', name: 'Number' },
                base: { kind: 'NamedObject', name: 'String' },
              },
              n: { kind: 'NamedObject', name: 'Number' },
            },
          },
          base: { kind: 'NamedObject', name: 'String' },
        },
      })
    })

    it('should convert exponential object declaration with subobjects to AST', () => {
      const testCase =
        'create MyExponential as from Number select { value is positive } -> from Number select { value is positive };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyExponential',
        object: {
          kind: 'ExponentialObject',
          exponent: {
            kind: 'SubObject',
            base: { kind: 'NamedObject', name: 'Number' },
            constraint: {
              raw: 'value is positive',
              parts: [{ kind: 'ConstraintText', text: 'value is positive' }],
            },
          },
          base: {
            kind: 'SubObject',
            base: { kind: 'NamedObject', name: 'Number' },
            constraint: {
              raw: 'value is positive',
              parts: [{ kind: 'ConstraintText', text: 'value is positive' }],
            },
          },
        },
      })
    })

    it('should convert subobject declaration with named objects to AST', () => {
      const testCase = 'create PositiveNumber as from Number select { isPositive };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'PositiveNumber',
        object: {
          kind: 'SubObject',
          base: { kind: 'NamedObject', name: 'Number' },
          constraint: {
            raw: 'isPositive',
            parts: [{ kind: 'ConstraintText', text: 'isPositive' }],
          },
        },
      })
    })

    it('should convert subobject declaration with text constraint to AST', () => {
      const testCase = 'create PositiveNumber as from Number select { the number is positive };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'PositiveNumber',
        object: {
          kind: 'SubObject',
          base: { kind: 'NamedObject', name: 'Number' },
          constraint: {
            raw: 'the number is positive',
            parts: [{ kind: 'ConstraintText', text: 'the number is positive' }],
          },
        },
      })
    })

    it('should convert subobject declaration with product objects to AST', () => {
      const testCase =
        'create MySubobject as from (n: Number, s: String) select { @n is positive };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MySubobject',
        object: {
          kind: 'SubObject',
          base: {
            kind: 'ProductObject',
            fields: {
              n: { kind: 'NamedObject', name: 'Number' },
              s: { kind: 'NamedObject', name: 'String' },
            },
          },
          constraint: {
            raw: '@n is positive',
            parts: [
              { kind: 'ConstraintReference', name: 'n' },
              { kind: 'ConstraintText', text: ' is positive' },
            ],
          },
        },
      })
    })

    it('should convert subobject declaration with exponential objects to AST', () => {
      const testCase =
        'create MySubobject as from (n: Number, s: String) -> Bool select { logs the given input };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MySubobject',
        object: {
          kind: 'SubObject',
          base: {
            kind: 'ExponentialObject',
            exponent: {
              kind: 'ProductObject',
              fields: {
                n: { kind: 'NamedObject', name: 'Number' },
                s: { kind: 'NamedObject', name: 'String' },
              },
            },
            base: { kind: 'NamedObject', name: 'Bool' },
          },
          constraint: {
            raw: 'logs the given input',
            parts: [{ kind: 'ConstraintText', text: 'logs the given input' }],
          },
        },
      })
    })

    it('should convert subobject declaration with subobjects to AST', () => {
      const testCase =
        'create MySubobject as from from Number select { value is positive } select { value is odd };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MySubobject',
        object: {
          kind: 'SubObject',
          base: {
            kind: 'SubObject',
            base: { kind: 'NamedObject', name: 'Number' },
            constraint: {
              raw: 'value is positive',
              parts: [{ kind: 'ConstraintText', text: 'value is positive' }],
            },
          },
          constraint: {
            raw: 'value is odd',
            parts: [{ kind: 'ConstraintText', text: 'value is odd' }],
          },
        },
      })
    })

    it('should convert basic object string to AST', () => {
      const testCase = 'create MyObject as string;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyObject',
        object: {
          kind: 'NamedObject',
          name: 'string',
        },
      })
    })

    it('should convert basic object number to AST', () => {
      const testCase = 'create MyObject as number;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyObject',
        object: {
          kind: 'NamedObject',
          name: 'number',
        },
      })
    })

    it('should convert basic object bool to AST', () => {
      const testCase = 'create MyObject as bool;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyObject',
        object: {
          kind: 'NamedObject',
          name: 'bool',
        },
      })
    })

    it('should convert basic object unit to AST', () => {
      const testCase = 'create MyObject as unit;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyObject',
        object: {
          kind: 'NamedObject',
          name: 'unit',
        },
      })
    })

    it('should convert basic object specification to AST', () => {
      const testCase = 'create MyObject as specification;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyObject',
        object: {
          kind: 'NamedObject',
          name: 'specification',
        },
      })
    })

    it('should convert basic object environment to AST', () => {
      const testCase = 'create MyObject as environment;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyObject',
        object: {
          kind: 'NamedObject',
          name: 'environment',
        },
      })
    })

    it('should convert array type declaration to AST', () => {
      const testCase = 'create MyArray as string[];'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyArray',
        object: {
          kind: 'ArrayObject',
          base: { kind: 'NamedObject', name: 'string' },
        },
      })
    })

    it('should convert array of product type to AST', () => {
      const testCase = 'create MyArray as (n: Number)[];'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'MyArray',
        object: {
          kind: 'ArrayObject',
          base: {
            kind: 'ProductObject',
            fields: {
              n: { kind: 'NamedObject', name: 'Number' },
            },
          },
        },
      })
    })

    it('should convert dotted name to AST', () => {
      const testCase =
        'create SignUp as (user: types.EmailAddress, pass: types.Password) -> string;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'SignUp',
        object: {
          kind: 'ExponentialObject',
          exponent: {
            kind: 'ProductObject',
            fields: {
              user: { kind: 'NamedObject', name: 'types.EmailAddress' },
              pass: { kind: 'NamedObject', name: 'types.Password' },
            },
          },
          base: { kind: 'NamedObject', name: 'string' },
        },
      })
    })
  })

  describe('import declaration', () => {
    it('should convert named import to AST', () => {
      const testCase = 'import EmailAddress from "types.spex";'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ImportDeclaration
      expect(decl).toEqual({
        kind: 'ImportDeclaration',
        name: 'EmailAddress',
        source: 'types.spex',
        alias: null,
      })
    })

    it('should convert named import with alias to AST', () => {
      const testCase = 'import EmailAddress from "types.spex" as Username;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ImportDeclaration
      expect(decl).toEqual({
        kind: 'ImportDeclaration',
        name: 'EmailAddress',
        source: 'types.spex',
        alias: 'Username',
      })
    })

    it('should convert module import to AST', () => {
      const testCase = 'import "types.spex" as types;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ImportDeclaration
      expect(decl).toEqual({
        kind: 'ImportDeclaration',
        name: null,
        source: 'types.spex',
        alias: 'types',
      })
    })

    it('should convert named import with single quoted source to AST', () => {
      const testCase = "import EmailAddress from 'types.spex' as Username;"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ImportDeclaration
      expect(decl).toEqual({
        kind: 'ImportDeclaration',
        name: 'EmailAddress',
        source: 'types.spex',
        alias: 'Username',
      })
    })

    it('should unescape escaped characters in import sources', () => {
      const testCase = "import EmailAddress from 'dir\\\\types.spex';"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ImportDeclaration
      expect(decl.source).toBe('dir\\types.spex')
    })
  })

  describe('export declaration', () => {
    it('should convert export declaration to AST', () => {
      const testCase = 'export EmailAddress;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ExportDeclaration
      expect(decl).toEqual({
        kind: 'ExportDeclaration',
        name: 'EmailAddress',
      })
    })
  })

  describe('generate declaration', () => {
    it('should convert generate declaration to AST', () => {
      const testCase = 'generate Main;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as GenerateDeclaration
      expect(decl).toEqual({
        kind: 'GenerateDeclaration',
        name: 'Main',
      })
    })
  })

  describe('enum object', () => {
    it('should convert enum object declaration to AST', () => {
      const testCase = "create myEnum as enum ('v1', 'v2');"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'myEnum',
        object: {
          kind: 'EnumObject',
          values: ['v1', 'v2'],
        },
      })
    })

    it('should convert single-value enum object to AST', () => {
      const testCase = "create Status as enum ('ACTIVE');"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'Status',
        object: {
          kind: 'EnumObject',
          values: ['ACTIVE'],
        },
      })
    })

    it('should convert enum object with mixed quote values to AST', () => {
      const testCase = "create myEnum as enum (\"v1\", 'v2');"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'myEnum',
        object: {
          kind: 'EnumObject',
          values: ['v1', 'v2'],
        },
      })
    })

    it('should convert enum object with escaped values to AST', () => {
      const testCase = "create myEnum as enum ('it\\'s', \"a \\\"b\\\"\", 'a\\\\b');"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'myEnum',
        object: {
          kind: 'EnumObject',
          values: ["it's", 'a "b"', 'a\\b'],
        },
      })
    })

    it('should convert enum object inside a product object to AST', () => {
      const testCase = "create Config as (kind: enum ('a', 'b'));"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          kind: { kind: 'EnumObject', values: ['a', 'b'] },
        },
      })
    })
  })

  describe('literal object', () => {
    it('should convert string literal object to AST', () => {
      const testCase = 'create Foo as "SpexFile";'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'Foo',
        object: {
          kind: 'StringLiteralObject',
          value: 'SpexFile',
        },
      })
    })

    it('should convert number literal object to AST', () => {
      const testCase = 'create Foo as 42;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'NumberLiteralObject',
        value: '42',
      })
    })

    it('should convert bool literal object to AST', () => {
      const ast = parseToAst('create Foo as true;')
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'BoolLiteralObject',
        value: true,
      })
    })

    it('should convert product of literal objects to AST', () => {
      const testCase = "create Foo as (name: \"John\", age: 42);"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          name: { kind: 'StringLiteralObject', value: 'John' },
          age: { kind: 'NumberLiteralObject', value: '42' },
        },
      })
    })

    it('should unescape string literal object values', () => {
      const testCase = "create Foo as 'it\\'s';"
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'StringLiteralObject',
        value: "it's",
      })
    })
  })

  describe('set object', () => {
    it('should convert union object to AST', () => {
      const testCase = 'create X as A UNION B;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetUnionObject',
        left: { kind: 'NamedObject', name: 'A' },
        right: { kind: 'NamedObject', name: 'B' },
      })
    })

    it('should convert intersect object to AST', () => {
      const testCase = 'create X as A INTERSECT B;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetIntersectionObject',
        left: { kind: 'NamedObject', name: 'A' },
        right: { kind: 'NamedObject', name: 'B' },
      })
    })

    it('should convert except object to AST', () => {
      const testCase = 'create X as A EXCEPT B;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetDifferenceObject',
        left: { kind: 'NamedObject', name: 'A' },
        right: { kind: 'NamedObject', name: 'B' },
      })
    })

    it('should convert chained set operations left-associatively', () => {
      const testCase = 'create X as A UNION B EXCEPT C;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetDifferenceObject',
        left: {
          kind: 'SetUnionObject',
          left: { kind: 'NamedObject', name: 'A' },
          right: { kind: 'NamedObject', name: 'B' },
        },
        right: { kind: 'NamedObject', name: 'C' },
      })
    })

    it('should preserve mixed operation order', () => {
      const testCase = 'create X as A EXCEPT B UNION C;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetUnionObject',
        left: {
          kind: 'SetDifferenceObject',
          left: { kind: 'NamedObject', name: 'A' },
          right: { kind: 'NamedObject', name: 'B' },
        },
        right: { kind: 'NamedObject', name: 'C' },
      })
    })

    it('should convert set operations with literals to AST', () => {
      const testCase = 'create X as string EXCEPT "root";'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetDifferenceObject',
        left: { kind: 'NamedObject', name: 'string' },
        right: { kind: 'StringLiteralObject', value: 'root' },
      })
    })

    it('should convert set operations in product fields to AST', () => {
      const testCase = 'create X as (a: A UNION B);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          a: {
            kind: 'SetUnionObject',
            left: { kind: 'NamedObject', name: 'A' },
            right: { kind: 'NamedObject', name: 'B' },
          },
        },
      })
    })
  })

  describe('coproduct object', () => {
    it('should convert pipe object to AST', () => {
      const testCase = 'create Shape as Point | Circle;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'CoproductObject',
        left: { kind: 'NamedObject', name: 'Point' },
        right: { kind: 'NamedObject', name: 'Circle' },
      })
    })

    it('should convert chained pipes left-associatively', () => {
      const testCase = 'create X as A | B | C;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'CoproductObject',
        left: {
          kind: 'CoproductObject',
          left: { kind: 'NamedObject', name: 'A' },
          right: { kind: 'NamedObject', name: 'B' },
        },
        right: { kind: 'NamedObject', name: 'C' },
      })
    })

    it('should bind arrow tighter than pipe', () => {
      const testCase = 'create X as A -> B | C;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'CoproductObject',
        left: {
          kind: 'ExponentialObject',
          base: { kind: 'NamedObject', name: 'B' },
          exponent: { kind: 'NamedObject', name: 'A' },
        },
        right: { kind: 'NamedObject', name: 'C' },
      })
    })

    it('should bind pipe tighter than set operations', () => {
      const testCase = 'create X as A UNION B | C;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetUnionObject',
        left: { kind: 'NamedObject', name: 'A' },
        right: {
          kind: 'CoproductObject',
          left: { kind: 'NamedObject', name: 'B' },
          right: { kind: 'NamedObject', name: 'C' },
        },
      })
    })

    it('should bind arrow tighter than set operations', () => {
      const testCase = 'create X as A -> B UNION C;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetUnionObject',
        left: {
          kind: 'ExponentialObject',
          base: { kind: 'NamedObject', name: 'B' },
          exponent: { kind: 'NamedObject', name: 'A' },
        },
        right: { kind: 'NamedObject', name: 'C' },
      })
    })

    it('should convert pipes in product fields to AST', () => {
      const testCase = 'create X as (a: A | B, b: C);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          a: {
            kind: 'CoproductObject',
            left: { kind: 'NamedObject', name: 'A' },
            right: { kind: 'NamedObject', name: 'B' },
          },
          b: { kind: 'NamedObject', name: 'C' },
        },
      })
    })

    it('should convert pipes with literals to AST', () => {
      const testCase = 'create X as string | "number";'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'CoproductObject',
        left: { kind: 'NamedObject', name: 'string' },
        right: { kind: 'StringLiteralObject', value: 'number' },
      })
    })
  })

  describe('parenthesized object', () => {
    it('should strip grouping parentheses from the AST', () => {
      const testCase = 'create X as (A | B);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'CoproductObject',
        left: { kind: 'NamedObject', name: 'A' },
        right: { kind: 'NamedObject', name: 'B' },
      })
    })

    it('should override arrow precedence with parentheses', () => {
      const testCase = 'create X as A -> (B | C);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ExponentialObject',
        base: {
          kind: 'CoproductObject',
          left: { kind: 'NamedObject', name: 'B' },
          right: { kind: 'NamedObject', name: 'C' },
        },
        exponent: { kind: 'NamedObject', name: 'A' },
      })
    })

    it('should group set operations with parentheses', () => {
      const testCase = 'create X as (A UNION B) EXCEPT C;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SetDifferenceObject',
        left: {
          kind: 'SetUnionObject',
          left: { kind: 'NamedObject', name: 'A' },
          right: { kind: 'NamedObject', name: 'B' },
        },
        right: { kind: 'NamedObject', name: 'C' },
      })
    })

    it('should apply array brackets to the whole group', () => {
      const testCase = 'create X as (A | B)[];'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ArrayObject',
        base: {
          kind: 'CoproductObject',
          left: { kind: 'NamedObject', name: 'A' },
          right: { kind: 'NamedObject', name: 'B' },
        },
      })
    })

    it('should convert the empty product to the unit object', () => {
      const testCase = 'create X as ();'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({ kind: 'NamedObject', name: 'unit' })
      expect(parseToAst('create X as unit;').declarations[0]).toEqual(decl)
    })
  })

  describe('unit elision', () => {
    it('should drop unit fields from a product', () => {
      const testCase = 'create X as (id: string, foo: unit);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          id: { kind: 'NamedObject', name: 'string' },
        },
      })
    })

    it('should collapse a product of only unit fields to the unit object', () => {
      const testCase = 'create X as (foo: unit, bar: unit);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({ kind: 'NamedObject', name: 'unit' })
    })

    it('should drop fields whose value is an empty product', () => {
      const testCase = 'create X as (id: string, foo: ());'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          id: { kind: 'NamedObject', name: 'string' },
        },
      })
    })

    it('should keep fields that are not the unit object', () => {
      const testCase = 'create X as (id: string, nothing: (a: unit, b: bool));'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          id: { kind: 'NamedObject', name: 'string' },
          nothing: {
            kind: 'ProductObject',
            fields: {
              b: { kind: 'NamedObject', name: 'bool' },
            },
          },
        },
      })
    })
  })

  describe('pattern object', () => {
    it('should convert a pattern object to AST', () => {
      const testCase = 'create X as /\\d+/i;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'PatternLiteralObject',
        source: '\\d+',
        flags: 'i',
      })
    })

    it('should keep the pattern source verbatim', () => {
      const testCase = 'create X as /\\/\\*[\\s\\S]*?\\*\\//;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'PatternLiteralObject',
        source: '\\/\\*[\\s\\S]*?\\*\\/',
        flags: '',
      })
    })

    it('should record empty flags', () => {
      const testCase = 'create X as /[a-zA-Z_][a-zA-Z0-9_]*/;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'PatternLiteralObject',
        source: '[a-zA-Z_][a-zA-Z0-9_]*',
        flags: '',
      })
    })

    it('should convert patterns in product fields to AST', () => {
      const testCase = 'create X as (name: string, pattern: /[a-z]+/i);'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'ProductObject',
        fields: {
          name: { kind: 'NamedObject', name: 'string' },
          pattern: { kind: 'PatternLiteralObject', source: '[a-z]+', flags: 'i' },
        },
      })
    })
  })

  describe('parseConstraint', () => {
    it('should parse plain text constraint with no references', () => {
      const result = parseConstraint('value is positive')
      expect(result).toEqual<Constraint>({
        raw: 'value is positive',
        parts: [{ kind: 'ConstraintText', text: 'value is positive' }],
      })
    })

    it('should parse constraint with single reference', () => {
      const result = parseConstraint('@n is positive')
      expect(result).toEqual<Constraint>({
        raw: '@n is positive',
        parts: [
          { kind: 'ConstraintReference', name: 'n' },
          { kind: 'ConstraintText', text: ' is positive' },
        ],
      })
    })

    it('should parse constraint with reference in the middle', () => {
      const result = parseConstraint('use @path for storage')
      expect(result).toEqual<Constraint>({
        raw: 'use @path for storage',
        parts: [
          { kind: 'ConstraintText', text: 'use ' },
          { kind: 'ConstraintReference', name: 'path' },
          { kind: 'ConstraintText', text: ' for storage' },
        ],
      })
    })

    it('should parse constraint with dotted references', () => {
      const result = parseConstraint('return @z.real^2 + @z.imag^2')
      expect(result).toEqual<Constraint>({
        raw: 'return @z.real^2 + @z.imag^2',
        parts: [
          { kind: 'ConstraintText', text: 'return ' },
          { kind: 'ConstraintReference', name: 'z.real' },
          { kind: 'ConstraintText', text: '^2 + ' },
          { kind: 'ConstraintReference', name: 'z.imag' },
          { kind: 'ConstraintText', text: '^2' },
        ],
      })
    })

    it('should parse constraint with multiple references', () => {
      const result = parseConstraint('call @LoadTodos using @path')
      expect(result).toEqual<Constraint>({
        raw: 'call @LoadTodos using @path',
        parts: [
          { kind: 'ConstraintText', text: 'call ' },
          { kind: 'ConstraintReference', name: 'LoadTodos' },
          { kind: 'ConstraintText', text: ' using ' },
          { kind: 'ConstraintReference', name: 'path' },
        ],
      })
    })

    it('should parse constraint with reference at start', () => {
      const result = parseConstraint('@validate the input')
      expect(result).toEqual<Constraint>({
        raw: '@validate the input',
        parts: [
          { kind: 'ConstraintReference', name: 'validate' },
          { kind: 'ConstraintText', text: ' the input' },
        ],
      })
    })

    it('should parse constraint with no @ symbols', () => {
      const result = parseConstraint('the user is authenticated')
      expect(result).toEqual<Constraint>({
        raw: 'the user is authenticated',
        parts: [{ kind: 'ConstraintText', text: 'the user is authenticated' }],
      })
    })

    it('should parse constraint with underscore in reference', () => {
      const result = parseConstraint('@todo_item is valid')
      expect(result).toEqual<Constraint>({
        raw: '@todo_item is valid',
        parts: [
          { kind: 'ConstraintReference', name: 'todo_item' },
          { kind: 'ConstraintText', text: ' is valid' },
        ],
      })
    })

    it('should parse empty constraint', () => {
      const result = parseConstraint('')
      expect(result).toEqual<Constraint>({
        raw: '',
        parts: [],
      })
    })

    it('should preserve raw text exactly', () => {
      const result = parseConstraint('  @foo  ')
      expect(result.raw).toBe('  @foo  ')
    })
  })

  describe('comments inside select constraints', () => {
    it('should keep comment markers in the constraint raw text', () => {
      const testCase = 'create Foo as from string select { are valid -- like emails };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SubObject',
        base: { kind: 'NamedObject', name: 'string' },
        constraint: {
          raw: 'are valid -- like emails',
          parts: [{ kind: 'ConstraintText', text: 'are valid -- like emails' }],
        },
      })
    })

    it('should extract references alongside comment markers', () => {
      const testCase = 'create Foo as from string select { match /* strict */ @pattern };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SubObject',
        base: { kind: 'NamedObject', name: 'string' },
        constraint: {
          raw: 'match /* strict */ @pattern',
          parts: [
            { kind: 'ConstraintText', text: 'match /* strict */ ' },
            { kind: 'ConstraintReference', name: 'pattern' },
          ],
        },
      })
    })
  })

  describe('escaped braces in select constraints', () => {
    it('should unescape an escaped close brace', () => {
      const testCase = 'create Foo as from string select { end with \\} };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SubObject',
        base: { kind: 'NamedObject', name: 'string' },
        constraint: {
          raw: 'end with }',
          parts: [{ kind: 'ConstraintText', text: 'end with }' }],
        },
      })
    })

    it('should unescape escaped open and close braces', () => {
      const testCase = 'create Foo as from string select { match \\{a\\} };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SubObject',
        base: { kind: 'NamedObject', name: 'string' },
        constraint: {
          raw: 'match {a}',
          parts: [{ kind: 'ConstraintText', text: 'match {a}' }],
        },
      })
    })

    it('should unescape escaped backslashes', () => {
      const testCase = 'create Foo as from string select { paths use \\\\ };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SubObject',
        base: { kind: 'NamedObject', name: 'string' },
        constraint: {
          raw: 'paths use \\',
          parts: [{ kind: 'ConstraintText', text: 'paths use \\' }],
        },
      })
    })

    it('should extract references next to escaped braces', () => {
      const testCase = 'create Foo as from string select { call @foo with \\} };'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as ObjectDeclaration
      expect(decl.object).toEqual({
        kind: 'SubObject',
        base: { kind: 'NamedObject', name: 'string' },
        constraint: {
          raw: 'call @foo with }',
          parts: [
            { kind: 'ConstraintText', text: 'call ' },
            { kind: 'ConstraintReference', name: 'foo' },
            { kind: 'ConstraintText', text: ' with }' },
          ],
        },
      })
    })
  })

  describe('package declaration', () => {
    it('should convert package executable declaration to AST', () => {
      const testCase = 'package executable myapp as Main;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as PackageDeclaration
      expect(decl).toEqual({
        kind: 'PackageDeclaration',
        packageType: 'EXECUTABLE',
        name: 'myapp',
        objectName: { kind: 'NamedObject', name: 'Main' },
      })
    })

    it('should convert package module declaration to AST', () => {
      const testCase = 'package module mylib as utils;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as PackageDeclaration
      expect(decl).toEqual({
        kind: 'PackageDeclaration',
        packageType: 'MODULE',
        name: 'mylib',
        objectName: { kind: 'NamedObject', name: 'utils' },
      })
    })

    it('should convert package executable with complex object to AST', () => {
      const testCase = 'package executable cli as (path: string) -> unit;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as PackageDeclaration
      expect(decl).toEqual({
        kind: 'PackageDeclaration',
        packageType: 'EXECUTABLE',
        name: 'cli',
        objectName: {
          kind: 'ExponentialObject',
          exponent: {
            kind: 'ProductObject',
            fields: { path: { kind: 'NamedObject', name: 'string' } },
          },
          base: { kind: 'NamedObject', name: 'unit' },
        },
      })
    })

    it('should convert package executable with dotted name to AST', () => {
      const testCase = 'package executable myapp as app.Main;'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as PackageDeclaration
      expect(decl).toEqual({
        kind: 'PackageDeclaration',
        packageType: 'EXECUTABLE',
        name: 'myapp',
        objectName: { kind: 'NamedObject', name: 'app.Main' },
      })
    })

    it('should convert package executable with array type to AST', () => {
      const testCase = 'package module mylib as string[];'
      const ast = parseToAst(testCase)
      const decl = ast.declarations[0] as PackageDeclaration
      expect(decl).toEqual({
        kind: 'PackageDeclaration',
        packageType: 'MODULE',
        name: 'mylib',
        objectName: { kind: 'ArrayObject', base: { kind: 'NamedObject', name: 'string' } },
      })
    })

    it('should convert mixed declarations with package to AST', () => {
      const testCase = 'create Main as Number;\npackage executable myapp as Main;'
      const ast = parseToAst(testCase)
      expect(ast.declarations).toHaveLength(2)
      const createDecl = ast.declarations[0] as ObjectDeclaration
      expect(createDecl).toEqual({
        kind: 'ObjectDeclaration',
        name: 'Main',
        object: { kind: 'NamedObject', name: 'Number' },
      })
      const packageDecl = ast.declarations[1] as PackageDeclaration
      expect(packageDecl).toEqual({
        kind: 'PackageDeclaration',
        packageType: 'EXECUTABLE',
        name: 'myapp',
        objectName: { kind: 'NamedObject', name: 'Main' },
      })
    })
  })
})
