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
  describe("object declaration - valid", () => {
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

    it("should parse function types in object declaration", () => {
      const testCase = `
      object test {
        f: string -> number,
        g: (string, number) -> bool 
      }
      `;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("morphism declaration - valid", () => {
    it("should parse empty morphism declaration", () => {
      const testCase = "morphism test() -> void { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse parametrized morphism declaration", () => {
      const testCase = "morphism test(s: string) -> void { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse morphism declaration that has a body", () => {
      const testCase = `morphism test() -> void { "print 'hello' in the console" }`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse parametrized morphism declaration that has a body", () => {
      const testCase =
        'morphism test(s: string) -> void { "print s in the console" }';
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse parametrized morphism declaration that has a multi-line body", () => {
      const testCase = `
      morphism test(a: number, b: number) -> void {
        "add a to b"
        "print the result in the console"
      }
      `;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse higher-order morphism declaration with single parameter", () => {
      const testCase = `
      morphism evaluate(f: string -> bool, s: string) -> bool {
        "return the result of evaluating f on s"
      }
      `;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse higher-order morphism declaration with multiple parameter", () => {
      const testCase = `
      morphism evaluate(f: (string, number) -> bool, s: string, n: number) -> bool {
        "return the result of evaluating f on s and n"
      }
      `;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("subobject declaration - valid", () => {
    it("should parse empty subobject declaration", () => {
      const testCase = "subobject Customer of Buyer { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with a single constraint", () => {
      const testCase = `subobject Cat of Animal { "is cute" }`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with multiple constraints", () => {
      const testCase = `subobject Cat of Animal { "is cute" "has pointy ears" }`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse multi-line subobject declaration with multiple constraints", () => {
      const testCase = `
      subobject Cat of Animal {
        "is cute"
        "has pointy ears"
      }`;
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

    it("should fail when morphism declaration is missing arrow", () => {
      const testCase = "morphism test() void { }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });

    it("should fail when morphism declaration is missing closing parenthesis", () => {
      const testCase = "morphism test( -> void { }";
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

    it("should fail when type expression has mismatched parentheses", () => {
      const testCase = "object test { f: (string -> number }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });

    it("should fail when type expression is missing return type", () => {
      const testCase = "object test { f: string -> }";
      const { parser } = parseInput(testCase);
      expect(parser.errors.length).toBeGreaterThan(0);
    });
  });
});
