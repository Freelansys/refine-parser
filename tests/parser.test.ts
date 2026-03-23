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
      const testCase =
        "object MyExponential = (f: Number -> String, n: Number) -> String";
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

    it("should parse eval expression declaration", () => {
      const testCase = `let test: Number = eval "return 2"`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse eval with given expression declaration", () => {
      const testCase = `let test: Number = eval "return \${a}" given { a: 2 }`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse named object instance declaration", () => {
      const testCase = "let test: Number = last";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object instance declaration", () => {
      const testCase =
        "let test: (s: String, n: Number) = { s: 'hello', n: 1 }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse product object instance declaration with trailing commas", () => {
      const testCase =
        "let test: (s: String, n: Number) = { s: 'hello', n: 1, }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object instance with named instance declaration", () => {
      const testCase = `let test: String -> Number = countAs`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse exponential object named instance declaration", () => {
      const testCase = `let test: String -> Number = countAs given { mul: Number }`;
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

    it("should parse exponential object instance composition declaration with named instances", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        doThis,
        doThat given { s: String },
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

    it("should parse property access on named instance", () => {
      const testCase = "let test: String = input.arg1";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse nested property access", () => {
      const testCase = "let test: String = foo.bar.baz";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse property access in product instance", () => {
      const testCase = "let test: (s: String) = { s: config.path }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse given with named instance", () => {
      const testCase = "let test: String -> Number = countAs given db";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse given with product instance", () => {
      const testCase =
        "let test: String -> Number = countAs given { db: Database }";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse if expression with trailing comma", () => {
      const testCase = `let test: Number = [ if true then x, y ]`;
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse given with string literal", () => {
      const testCase = 'let test: String -> Number = f given "the input"';
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse given with property access", () => {
      const testCase = "let test: String -> Number = f given config.db";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse given with eval expression", () => {
      const testCase = 'let test: String -> Number = f given eval "get value"';
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse given with if expression", () => {
      const testCase =
        "let test: String -> Number = f given if cond then a else b";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse given with composition", () => {
      const testCase =
        'let test: String -> Number = f given [ "step 1", "step 2" ]';
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });

    it("should parse chained given", () => {
      const testCase = "let test: A -> D = f given g given h";
      const { parser } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
    });
  });
});
