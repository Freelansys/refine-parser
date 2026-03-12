import { describe, it, expect } from "vitest";
import { SpecParser } from "../src/parser.js";
import { SpecLexer } from "../src/lexer.js";

const parser = new SpecParser();

function parseInput(text: string) {
  const lexingResult = SpecLexer.tokenize(text);
  parser.input = lexingResult.tokens;
  const cst = parser.specFile() as any;
  return { parser, cst };
}

describe("SpecParser", () => {
  describe("let declaration", () => {
    it("should parse let declaration with single field", () => {
      const testCase = "let test = (s: string)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse let declaration with multiple fields", () => {
      const testCase = "let test = (s: string, n: number)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse let declaration with multi-line fields", () => {
      const testCase = `
      let test = (
        s: string,
        n: number
      )`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("object declaration", () => {
    it("should parse empty object declaration", () => {
      const testCase = "object test { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse single-line object declaration", () => {
      const testCase = "object test { s: string, n: number }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse multi-line object declaration", () => {
      const testCase = `
      object test {
        s: string,
        n: number
      }
      `;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("exponential declaration", () => {
    it("should parse exponential declaration with single input and single output", () => {
      const testCase = "exponential exp from (s: string) to (n: number)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential declaration with multiple input and single output", () => {
      const testCase =
        "exponential exp from (s: string, n: number) to (m: number)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential declaration with single input and multiple output", () => {
      const testCase =
        "exponential exp from (s: string) to (n: number, b: bool)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential declaration with multiple input and multiple output", () => {
      const testCase =
        "exponential exp from (s: string, n: number) to (m: number, b: bool)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse multiline exponential declaration with multiple input and multiple input", () => {
      const testCase = `
      exponential exp
        from (s: string, n: number)
        to (m: number, b: bool)
      `;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("base types in exponential declarations", () => {
    it("should parse exponential declaration with base types", () => {
      const testCase = "exponential exp from (n: Number) to (s: String)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential declaration with mixed base and named types", () => {
      const testCase =
        "exponential exp from (n: Number, s: String) to (b: Bool, obj: MyObject)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("morphism declaration", () => {
    it("should parse empty morphism declaration", () => {
      const testCase = "morphism test: exp { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse morphism declaration that has a body", () => {
      const testCase = `morphism test: exp { "print 'hello' in the console" }`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse parametrized morphism declaration that has a multi-line body", () => {
      const testCase = `
      morphism test: exp {
        "add a to b"
        "print the result in the console"
      }
      `;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("constant declaration", () => {
    it("should parse single-line constant definition", () => {
      const testCase = `constant MyObj: obj { s = "some string", n = 23, m = 23.4, f = MyMorphism, e = 1e-2 }`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse multi-line constant definition", () => {
      const testCase = `
      constant MyObj: obj {
        s = "some string",
        n = 23,
        m = 23.4,
        f = MyMorphism,
        e = 1e-2
      }`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("subobject declaration", () => {
    it("should parse subobject declaration with a single constraint", () => {
      const testCase = `subobject Cat of Animal where "is cute"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with a single constraint in conjunctive form", () => {
      const testCase = `subobject Cat of Animal where all ( "is cute" )`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with a single constraint in disjunctive form", () => {
      const testCase = `subobject Cat of Animal where any ( "is cute" )`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with multiple constraints in conjunctive form", () => {
      const testCase = `subobject Cat of Animal where all ( "is cute", "has pointy ears" )`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with multiple constraints in disjunctive form", () => {
      const testCase = `subobject Cat of Animal where any ( "is cute", "has pointy ears" )`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse multi-line subobject declaration with multiple constraints", () => {
      const testCase = `
      subobject Cat of Animal where all (
        "is cute",
        "has pointy ears"
      )`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with complex constraints", () => {
      const testCase = `
      subobject Cat of Animal where all (
        "is cute",
        any ( "is brown", "is black" )
      )`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("error cases", () => {
    it("should fail when object declaration is missing opening brace", () => {
      const testCase = "object test s: string }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });

    it("should fail when object declaration is missing colon in field", () => {
      const testCase = "object test { s string }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });

    it("should fail when morphism declaration is missing colon", () => {
      const testCase = "morphism test exp { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });

    it("should fail when morphism declaration is missing type reference", () => {
      const testCase = "morphism test: { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });

    it("should fail when subobject declaration is missing 'of' keyword", () => {
      const testCase = "subobject Cat Animal { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });

    it("should fail when subobject declaration is missing parent type", () => {
      const testCase = "subobject Cat of { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });
  });
});
