import { describe, it, expect } from 'vitest'
import { parseToAst, parseConstraint } from '../src/visitor.js'
import type {
  ObjectDeclaration,
  ImportDeclaration,
  ExportDeclaration,
  GenerateDeclaration,
  PackageDeclaration,
  Constraint,
} from '../src/ast.js'

describe('SpexParserVisitor', () => {
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
