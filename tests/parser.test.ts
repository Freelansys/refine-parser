import { describe, it, expect } from "vitest";
import { SpexParser } from "../src/parser.js";
import { SpexLexer } from "../src/lexer.js";

const parser = new SpexParser();

function parseInput(text: string) {
  const lexingResult = SpexLexer.tokenize(text);
  parser.input = lexingResult.tokens;
  const cst = parser.spexFile() as any;
  return { parser, cst };
}

describe("SpecParser", () => {
  describe("object declaration", () => {
    it("should parse named object declaration", () => {
      const testCase = "object MyObject = Number";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object declaration", () => {
      const testCase = "object MyProduct = (n: Number, s: String)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object declaration with trailing commas", () => {
      const testCase = "object MyProduct = (n: Number, s: String,)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object declaration with exponential objects", () => {
      const testCase = "object MyProduct = (f: Number -> String, n: Number)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object declaration with subobjects", () => {
      const testCase = `object MyProduct = (p: select Number where "value is positive", n: Number)`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object declaration with named object", () => {
      const testCase = "object MyExponential = Number -> Unit";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object declaration with product objects", () => {
      const testCase = "object MyExponential = (n: Number) -> (s: String)";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object declaration with exponential objects", () => {
      const testCase = "object MyExponential = (f: Number -> String, n: Number) -> String";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object declaration with subobjects", () => {
      const testCase = `object MyExponential = select Number where "value is positive" -> select Number where "value is positive"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with named objects", () => {
      const testCase = `object PositiveNumber = select Number where isPositive`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with named objects and instruction condition", () => {
      const testCase = `object PositiveNumber = select Number where "the number is positive"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with named objects and composition condition", () => {
      const testCase = `object PositiveNumber = select Number where [
        let isPositive: Bool = "the number is positive",
        "return true if both \${isPositive} and odd"
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with product objects", () => {
      const testCase = `object MySubobject = select (n: Number, s: String) where "\${n} is positive"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with exponential objects", () => {
      const testCase = `object MySubobject = select (n: Number, s: String) -> Bool where "logs the given input"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse subobject declaration with subobjects", () => {
      const testCase = `object MySubobject = select select Number where "value is positive" where "value is odd"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });

  describe("instance declaration", () => {
    it("should parse literal declaration", () => {
      const testCase = "let test: Number = 1";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse named object instance declaration", () => {
      const testCase = "let test: Number = last";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object instance declaration", () => {
      const testCase = "let test: (s: String, n: Number) = { s: 'hello', n: 1 }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object instance declaration with trailing commas", () => {
      const testCase = "let test: (s: String, n: Number) = { s: 'hello', n: 1, }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance instruction declaration", () => {
      const testCase = `let test: String -> Number = "count 'a's in the string"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance composition declaration with single instruction", () => {
      const testCase = `let test: String -> Number = [
        "count 'a's in the string and return it"
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance composition declaration with multiple instruction", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        "return \${count}*2"
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance composition declaration with trailing commas", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        "return \${count}*2",
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance composition declaration with if expression", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then "return \${count}*2"
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance composition declaration with if and eval expression", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if eval "return true" then "return \${count}*2"
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance composition declaration with if else expression", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then "return \${count}*2" else "return -1"
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance nested composition declaration with if else expression", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then [
          "do something",
          "return \${count}*2"
        ] else [
          "do something else,
          "return -1",
        ]
      ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });
});
