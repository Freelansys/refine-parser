import { describe, it, expect } from 'vitest'
import { SpexParser } from '../src/parser.js'
import { SpexLexer } from '../src/lexer.js'

const parser = new SpexParser()

function parseInput(text: string) {
  const lexingResult = SpexLexer.tokenize(text)
  parser.input = lexingResult.tokens
  const cst = parser.spexFile() as any
  return { parser, cst }
}

describe('SpexParser', () => {
  describe('object declaration', () => {
    it('should parse named object declaration', () => {
      const testCase = 'create MyObject as Number;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse product object declaration', () => {
      const testCase = 'create MyProduct as (n: Number, s: String);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse product object declaration with trailing commas', () => {
      const testCase = 'create MyProduct as (n: Number, s: String,);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse product object declaration with exponential objects', () => {
      const testCase = 'create MyProduct as (f: Number -> String, n: Number);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse product object declaration with subobjects', () => {
      const testCase =
        'create MyProduct as (p: from Number select { value is positive }, n: Number);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse exponential object declaration with named object', () => {
      const testCase = 'create MyExponential as Number -> Unit;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse exponential object declaration with product objects', () => {
      const testCase = 'create MyExponential as (n: Number) -> (s: String);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse exponential object declaration with exponential objects', () => {
      const testCase = 'create MyExponential as (f: Number -> String, n: Number) -> String;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse exponential object declaration with subobjects', () => {
      const testCase =
        'create MyExponential as from Number select { value is positive } -> from Number select { value is positive };'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse subobject declaration with text constraint', () => {
      const testCase = 'create PositiveNumber as from Number select { are positive };'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse subobject declaration with product objects', () => {
      const testCase =
        'create MySubobject as from (n: Number, s: String) select { have a positive @n };'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse subobject declaration with exponential objects', () => {
      const testCase =
        'create MySubobject as from (n: Number, s: String) -> Bool select { log the given input };'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse subobject declaration with subobjects', () => {
      const testCase =
        'create MySubobject as from from Number select { value is positive } select { value is odd };'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse array type declaration', () => {
      const testCase = 'create MyArray as string[];'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse array of product type', () => {
      const testCase = 'create MyArray as (n: Number)[];'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse nested array type', () => {
      const testCase = 'create MyArray as string[][];'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse object declaration with dotted name', () => {
      const testCase =
        'create SignUp as (user: types.EmailAddress, pass: types.Password) -> string;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse basic object string', () => {
      const testCase = 'create MyObject as string;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse basic object number', () => {
      const testCase = 'create MyObject as number;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse basic object bool', () => {
      const testCase = 'create MyObject as bool;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse basic object unit', () => {
      const testCase = 'create MyObject as unit;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse basic objects in product fields', () => {
      const testCase = 'create Config as (name: string, count: number, active: bool);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should not allow overriding basic object string', () => {
      const testCase = 'create string as Number;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).not.toHaveLength(0)
    })

    it('should not allow overriding basic object number', () => {
      const testCase = 'create number as Number;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).not.toHaveLength(0)
    })

    it('should not allow overriding basic object bool', () => {
      const testCase = 'create bool as Number;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).not.toHaveLength(0)
    })

    it('should not allow overriding basic object unit', () => {
      const testCase = 'create unit as Number;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).not.toHaveLength(0)
    })
  })

  describe('import declaration', () => {
    it('should parse named import', () => {
      const testCase = 'import EmailAddress from "types.spex";'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse named import with alias', () => {
      const testCase = 'import EmailAddress from "types.spex" as Username;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse module import', () => {
      const testCase = 'import "types.spex" as types;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })
  })

  describe('export declaration', () => {
    it('should parse export declaration', () => {
      const testCase = 'export EmailAddress;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })
  })

  describe('generate declaration', () => {
    it('should parse generate declaration', () => {
      const testCase = 'generate Main;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })
  })

  describe('enum object', () => {
    it('should parse enum object declaration', () => {
      const testCase = "create myEnum as enum ('v1', 'v2');"
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse enum object declaration case-insensitively', () => {
      const testCase = "CREATE myEnum AS ENUM ('v1', 'v2');"
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse single-value enum object', () => {
      const testCase = "create Status as enum ('ACTIVE');"
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse enum object with double quoted values', () => {
      const testCase = 'create myEnum as enum ("v1", "v2");'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse enum object with mixed quote values', () => {
      const testCase = "create myEnum as enum (\"v1\", 'v2');"
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse enum object with escaped values', () => {
      const testCase = "create myEnum as enum ('it\\'s');"
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse enum object inside a product object', () => {
      const testCase = "create Config as (kind: enum ('a', 'b'));"
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse array of enum object', () => {
      const testCase = "create myEnum as enum ('a', 'b')[];"
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should not parse enum object without values', () => {
      const testCase = 'create myEnum as enum ();'
      const { parser } = parseInput(testCase)
      expect(parser.errors).not.toHaveLength(0)
    })

    it('should not parse enum object with a trailing comma', () => {
      const testCase = "create myEnum as enum ('v1',);"
      const { parser } = parseInput(testCase)
      expect(parser.errors).not.toHaveLength(0)
    })

    it('should not parse enum object without parentheses', () => {
      const testCase = 'create myEnum as enum;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).not.toHaveLength(0)
    })
  })

  describe('package declaration', () => {
    it('should parse package executable declaration', () => {
      const testCase = 'package executable myapp as Main;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package module declaration', () => {
      const testCase = 'package module mylib as utils;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package executable with exponential object', () => {
      const testCase = 'package executable cli as (path: string) -> unit;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package executable with dotted name', () => {
      const testCase = 'package executable myapp as app.Main;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package module with array type', () => {
      const testCase = 'package module mylib as string[];'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package executable with product type', () => {
      const testCase = 'package module mylib as (name: string, count: number);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package executable with subobject', () => {
      const testCase = 'package executable myapp as from string select { is a valid command };'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package declaration case-insensitively', () => {
      const testCase = 'PACKAGE EXECUTABLE myapp AS Main;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse mixed package and generate declarations', () => {
      const testCase = 'package executable myapp as Main;\ngenerate Main;'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse package declaration with complex nested type', () => {
      const testCase =
        'package module mylib as from (x: number, y: number) -> number select { computes distance };'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })
  })

  describe('comments', () => {
    it('should parse declarations separated by single-line comments', () => {
      const testCase = `
        -- domain model
        create Todo as (id: string, title: string);
        -- create a new todo
        create CreateTodo as (title: string) -> Todo;
      `
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse declarations separated by block comments', () => {
      const testCase = `
        /* storage layer */
        create LoadTodos as (path: string) -> Todo[];
        /* entry point */
        create Main as string[] -> unit;
      `
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse inline block comments within a product declaration', () => {
      const testCase = 'create Config as (name: string /* the name */, count: number);'
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse a file containing only comments', () => {
      const testCase = `
        -- this file is intentionally empty
        /* apart from these comments */
      `
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })

    it('should parse a block comment spanning a single-line comment', () => {
      const testCase = `
        create Foo as string;
        /* comment one
        -- not a real comment, still part of the block
        comment two */
        generate Main;
      `
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })
  })

  describe('multiple declarations', () => {
    it('should parse multiple declarations', () => {
      const testCase = `
        create Todo as (id: string, title: string, completed: bool);
        create EmailAddress as from string select { are email addresses };
        export EmailAddress;
        generate Main;
      `
      const { parser } = parseInput(testCase)
      expect(parser.errors).toHaveLength(0)
    })
  })
})
