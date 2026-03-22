import { describe, it, expect } from "vitest";
import { parseToAst } from "../src/visitor.js";
import type {
  ObjectDeclaration,
  SpexFile,
} from "../src/ast.js";

describe("SpecParserVisitor", () => {
  describe("object declaration", () => {
    it("should convert named object declaration to AST", () => {
      const testCase = "object MyObject = Number";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyObject",
        object: {
          kind: "NamedObject",
          name: "Number"
        }
      });
    });

    it("should convert product object declaration to AST", () => {
      const testCase = "object MyProduct = (n: Number, s: String)";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert product object declaration with trailing commas to AST", () => {
      const testCase = "object MyProduct = (n: Number, s: String,)";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert product object declaration with exponential objects to AST", () => {
      const testCase = "object MyProduct = (f: Number -> String, n: Number)";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert product object declaration with subobjects to AST", () => {
      const testCase = `object MyProduct = (p: select Number where "value is positive", n: Number)`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object declaration with named object to AST", () => {
      const testCase = "object MyExponential = Number -> Unit";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object declaration with product objects to AST", () => {
      const testCase = "object MyExponential = (n: Number) -> (s: String)";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object declaration with exponential objects to AST", () => {
      const testCase = "object MyExponential = (f: Number -> String, n: Number) -> String";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object declaration with subobjects to AST", () => {
      const testCase = `object MyExponential = select Number where "value is positive" -> select Number where "value is positive"`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert subobject declaration with named objects to AST", () => {
      const testCase = `object PositiveNumber = select Number where isPositive`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert subobject declaration with named objects and instruction condition to AST", () => {
      const testCase = `object PositiveNumber = select Number where "the number is positive"`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert subobject declaration with named objects and composition condition to AST", () => {
      const testCase = `object PositiveNumber = select Number where [
        let isPositive: Bool = "the number is positive",
        "return true if both \${isPositive} and odd"
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert subobject declaration with product objects to AST", () => {
      const testCase = `object MySubobject = select (n: Number, s: String) where "\${n} is positive"`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert subobject declaration with exponential objects to AST", () => {
      const testCase = `object MySubobject = select (n: Number, s: String) -> Bool where "logs the given input"`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert subobject declaration with subobjects to AST", () => {
      const testCase = `object MySubobject = select select Number where "value is positive" where "value is odd"`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });
  });

  describe("instance declaration", () => {
    it("should convert literal declaration to AST", () => {
      const testCase = "let test: Number = 1";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert eval expression declaration to AST", () => {
      const testCase = `let test: Number = eval "return 2"`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert eval with given expression declaration to AST", () => {
      const testCase = `let test: Number = eval "return \${a}" given { a: 2 }`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert named object instance declaration to AST", () => {
      const testCase = "let test: Number = last";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert product object instance declaration to AST", () => {
      const testCase = "let test: (s: String, n: Number) = { s: 'hello', n: 1 }";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert product object instance declaration with trailing commas to AST", () => {
      const testCase = "let test: (s: String, n: Number) = { s: 'hello', n: 1, }";
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance with named instance declaration to AST", () => {
      const testCase = `let test: String -> Number = countAs`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object named instance declaration to AST", () => {
      const testCase = `let test: String -> Number = countAs given { mul: Number }`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance instruction declaration to AST", () => {
      const testCase = `let test: String -> Number = "count 'a's in the string"`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance composition declaration with single instruction to AST", () => {
      const testCase = `let test: String -> Number = [
        "count 'a's in the string and return it"
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance composition declaration with multiple instruction to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance composition declaration with named instances to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        doThis,
        doThat given { s: String },
        "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance composition declaration with trailing commas to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        "return \${count}*2",
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance composition declaration with if expression to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance composition declaration with if and eval expression to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if eval "return true" then "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance composition declaration with if else expression to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then "return \${count}*2" else "return -1"
      ]`;
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });

    it("should convert exponential object instance nested composition declaration with if else expression to AST", () => {
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
      const ast = parseToAst(testCase);
      throw Error("not implemented")
    });
  });
});