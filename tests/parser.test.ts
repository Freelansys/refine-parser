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

function extractType(typeExprNode: any): string {
  if (!typeExprNode || !typeExprNode.children) {
    return typeExprNode?.image || "";
  }

  const children = typeExprNode.children;

  if (children.LParen) {
    let result = "(";
    if (children.paramTypeList) {
      const paramTypes =
        children.paramTypeList[0]?.children?.atomicType
          ?.map((a: any) => a?.children?.Identifier?.[0]?.image)
          .filter(Boolean) || [];
      result += paramTypes.join(", ");
    }
    result += ") -> ";
    result += extractType(children.typeExpr?.[0]);
    return result;
  }

  const atomicType = children.atomicType?.[0]?.children?.Identifier?.[0]?.image;
  if (!atomicType) return "";

  if (children.Arrow && children.typeExpr) {
    const returnType = extractType(children.typeExpr[0]);
    return `${atomicType} -> ${returnType}`;
  }

  return atomicType;
}

function extractFields(fieldDeclNode: any): any[] {
  const fields: any[] = [];
  if (!fieldDeclNode) return fields;

  const firstField = {
    name: fieldDeclNode.name,
    identifier: fieldDeclNode.children.Identifier?.[0]?.image,
    type: extractType(fieldDeclNode.children.typeExpr?.[0]),
  };
  fields.push(firstField);

  const nested = fieldDeclNode.children.fieldDecl;
  if (nested && nested.length > 0) {
    fields.push(...extractFields(nested[0]));
  }

  return fields;
}

describe("SpecParser", () => {
  describe("object declaration", () => {
    it("should parse empty object declaration", () => {
      const testCase = "object test { }";
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);
      expect(cst.name).toBe("specFile");
      expect(cst.children.declaration).toBeDefined();
      const declElement = cst.children.declaration[0];
      expect(declElement && "name" in declElement && declElement.name).toBe(
        "declaration",
      );
    });

    it("should parse single-line object declaration", () => {
      const testCase = "object test { s: string, n: number }";
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const objDecl = decl.children.objectDecl[0];
      expect(objDecl.name).toBe("objectDecl");
      expect(objDecl.children.ObjectTok[0].image).toBe("object");
      expect(objDecl.children.Identifier[0].image).toBe("test");

      const fieldDecls = extractFields(objDecl.children.fieldDecl[0]);
      expect(fieldDecls).toHaveLength(2);
      expect(fieldDecls[0].identifier).toBe("s");
      expect(fieldDecls[0].type).toBe("string");
      expect(fieldDecls[1].identifier).toBe("n");
      expect(fieldDecls[1].type).toBe("number");
    });

    it("should parse multi-line object declaration", () => {
      const testCase = `
      object test {
        s: string,
        n: number
      }
      `;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const objDecl = decl.children.objectDecl[0];
      expect(objDecl.name).toBe("objectDecl");
      expect(objDecl.children.ObjectTok[0].image).toBe("object");
      expect(objDecl.children.Identifier[0].image).toBe("test");

      const fieldDecls = extractFields(objDecl.children.fieldDecl[0]);
      expect(fieldDecls).toHaveLength(2);
      expect(fieldDecls[0].identifier).toBe("s");
      expect(fieldDecls[0].type).toBe("string");
      expect(fieldDecls[1].identifier).toBe("n");
      expect(fieldDecls[1].type).toBe("number");
    });

    it("should parse function types in object declaration", () => {
      const testCase = `
      object test {
        f: string -> number,
        g: (string, number) -> bool 
      }
      `;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const objDecl = decl.children.objectDecl[0];
      expect(objDecl.children.Identifier[0].image).toBe("test");

      const fieldDecls = extractFields(objDecl.children.fieldDecl[0]);
      expect(fieldDecls).toHaveLength(2);
      expect(fieldDecls[0].identifier).toBe("f");
      expect(fieldDecls[0].type).toBe("string -> number");
      expect(fieldDecls[1].identifier).toBe("g");
      expect(fieldDecls[1].type).toBe("(string, number) -> bool");
    });
  });

  describe("morphism declaration", () => {
    it("should parse empty morphism declaration", () => {
      const testCase = "morphism test() -> void { }";
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const morphismDecl = decl.children.morphismDecl[0];
      expect(morphismDecl.name).toBe("morphismDecl");
      expect(morphismDecl.children.MorphismTok[0].image).toBe("morphism");
      expect(morphismDecl.children.Identifier[0].image).toBe("test");
      expect(morphismDecl.children.Arrow[0].image).toBe("->");
    });

    it("should parse parametrized morphism declaration", () => {
      const testCase = "morphism test(s: string) -> void { }";
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const morphismDecl = decl.children.morphismDecl[0];
      const paramList = morphismDecl.children.paramList[0];
      expect(paramList.children.param).toHaveLength(1);
      expect(paramList.children.param[0].children.Identifier[0].image).toBe(
        "s",
      );
    });

    it("should parse morphism declaration that has a body", () => {
      const testCase = `morphism test() -> void { "print 'hello' in the console" }`;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const morphismDecl = decl.children.morphismDecl[0];
      const block = morphismDecl.children.block[0];
      expect(block.children.statement).toHaveLength(1);
      expect(block.children.statement[0].children.SingleString[0].image).toBe(
        `"print 'hello' in the console\"`,
      );
    });

    it("should parse parametrized morphism declaration that has a body", () => {
      const testCase =
        'morphism test(s: string) -> void { "print s in the console" }';
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const morphismDecl = decl.children.morphismDecl[0];
      const block = morphismDecl.children.block[0];
      expect(block.children.statement).toHaveLength(1);
    });

    it("should parse parametrized morphism declaration that has a multi-line body", () => {
      const testCase = `
      morphism test(a: number, b: number) -> void {
        "add a to b"
        "print the result in the console"
      }
      `;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const morphismDecl = decl.children.morphismDecl[0];
      const paramList = morphismDecl.children.paramList[0];
      expect(paramList.children.param).toHaveLength(2);

      const block = morphismDecl.children.block[0];
      expect(block.children.statement).toHaveLength(2);
      expect(block.children.statement[0].children.SingleString[0].image).toBe(
        '"add a to b"',
      );
      expect(block.children.statement[1].children.SingleString[0].image).toBe(
        '"print the result in the console"',
      );
    });

    it("should parse higher-order morphism declaration with single parameter", () => {
      const testCase = `
      morphism evaluate(f: string -> bool, s: string) -> bool {
        "return the result of evaluating f on s"
      }
      `;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const morphismDecl = decl.children.morphismDecl[0];
      expect(morphismDecl.children.Identifier[0].image).toBe("evaluate");

      const paramList = morphismDecl.children.paramList[0];
      expect(paramList.children.param).toHaveLength(2);
      expect(paramList.children.param[0].children.Identifier[0].image).toBe(
        "f",
      );
      expect(paramList.children.param[1].children.Identifier[0].image).toBe(
        "s",
      );
    });

    it("should parse higher-order morphism declaration with multiple parameter", () => {
      const testCase = `
      morphism evaluate(f: (string, number) -> bool, s: string, n: number) -> bool {
        "return the result of evaluating f on s and n"
      }
      `;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const morphismDecl = decl.children.morphismDecl[0];
      expect(morphismDecl.children.Identifier[0].image).toBe("evaluate");

      const paramList = morphismDecl.children.paramList[0];
      expect(paramList.children.param).toHaveLength(3);
      expect(paramList.children.param[0].children.Identifier[0].image).toBe(
        "f",
      );
      expect(paramList.children.param[1].children.Identifier[0].image).toBe(
        "s",
      );
      expect(paramList.children.param[2].children.Identifier[0].image).toBe(
        "n",
      );
    });
  });

  describe("subobject declaration", () => {
    it("should parse empty subobject declaration", () => {
      const testCase = "subobject Customer of Buyer { }";
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const subobjectDecl = decl.children.subobjectDecl[0];
      expect(subobjectDecl.name).toBe("subobjectDecl");
      expect(subobjectDecl.children.SubobjectTok[0].image).toBe("subobject");
    });

    it("should parse subobject declaration with a single constraint", () => {
      const testCase = `subobject Cat of Animal { "is cute" }`;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const subobjectDecl = decl.children.subobjectDecl[0];
      expect(subobjectDecl.children.Identifier[0].image).toBe("Cat");
      expect(subobjectDecl.children.OfTok[0].image).toBe("of");
      expect(subobjectDecl.children.Identifier[1].image).toBe("Animal");

      const predicateBlock = subobjectDecl.children.predicateBlock[0];
      expect(predicateBlock.children.predicateStatement).toHaveLength(1);
    });

    it("should parse subobject declaration with multiple constraints", () => {
      const testCase = `subobject Cat of Animal { "is cute" "has pointy ears" }`;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const subobjectDecl = decl.children.subobjectDecl[0];
      const predicateBlock = subobjectDecl.children.predicateBlock[0];
      expect(predicateBlock.children.predicateStatement).toHaveLength(2);
      expect(
        predicateBlock.children.predicateStatement[0].children.SingleString[0]
          .image,
      ).toBe('"is cute"');
      expect(
        predicateBlock.children.predicateStatement[1].children.SingleString[0]
          .image,
      ).toBe('"has pointy ears"');
    });

    it("should parse multi-line subobject declaration with multiple constraints", () => {
      const testCase = `
      subobject Cat of Animal {
        "is cute"
        "has pointy ears"
      }`;
      const { parser, cst } = parseInput(testCase);
      expect(parser.errors).toHaveLength(0);

      const decl = cst.children.declaration[0];
      const subobjectDecl = decl.children.subobjectDecl[0];
      const predicateBlock = subobjectDecl.children.predicateBlock[0];
      expect(predicateBlock.children.predicateStatement).toHaveLength(2);
    });
  });
});
