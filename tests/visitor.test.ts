import { describe, it, expect } from "vitest";
import { parseToAst } from "../src/visitor.js";
import type {
  SpecFile,
  ObjectDecl,
  ExponentialDecl,
  MorphismDecl,
  SubobjectDecl,
  ConstantDecl,
} from "../src/ast.js";

describe("SpecParserVisitor", () => {
  describe("object declaration", () => {
    it("should convert empty object declaration to AST", () => {
      const ast = parseToAst("object test { }");
      expect(ast.declarations).toHaveLength(1);
      const decl = ast.declarations[0] as ObjectDecl;
      expect(decl.kind).toBe("ObjectDecl");
      expect(decl.name).toBe("test");
      expect(decl.fields).toHaveLength(0);
    });

    it("should convert object declaration with single field to AST", () => {
      const ast = parseToAst("object test { s: string }");
      const decl = ast.declarations[0] as ObjectDecl;
      expect(decl.fields).toHaveLength(1);
      expect(decl.fields[0].name).toBe("s");
      expect(decl.fields[0].type.kind).toBe("NamedType");
      expect(decl.fields[0].type.name).toBe("string");
    });

    it("should convert object declaration with multiple fields to AST", () => {
      const ast = parseToAst("object test { s: string, n: number }");
      const decl = ast.declarations[0] as ObjectDecl;
      expect(decl.fields).toHaveLength(2);
      expect(decl.fields[0].name).toBe("s");
      expect(decl.fields[0].type.name).toBe("string");
      expect(decl.fields[1].name).toBe("n");
      expect(decl.fields[1].type.name).toBe("number");
    });
  });

  describe("exponential declaration", () => {
    it("should convert exponential declaration with single input and output to AST", () => {
      const ast = parseToAst("exponential exp from (s: string) to (n: number)");
      const decl = ast.declarations[0] as ExponentialDecl;
      expect(decl.kind).toBe("ExponentialDecl");
      expect(decl.name).toBe("exp");
      expect(decl.input).toHaveLength(1);
      expect(decl.input[0].name).toBe("s");
      expect(decl.input[0].type.name).toBe("string");
      expect(decl.output).toHaveLength(1);
      expect(decl.output[0].name).toBe("n");
      expect(decl.output[0].type.name).toBe("number");
    });

    it("should convert exponential declaration with multiple inputs to AST", () => {
      const ast = parseToAst(
        "exponential exp from (s: string, n: number) to (m: number)",
      );
      const decl = ast.declarations[0] as ExponentialDecl;
      expect(decl.input).toHaveLength(2);
      expect(decl.input[0].name).toBe("s");
      expect(decl.input[1].name).toBe("n");
      expect(decl.output).toHaveLength(1);
    });

    it("should convert exponential declaration with multiple outputs to AST", () => {
      const ast = parseToAst(
        "exponential exp from (s: string) to (n: number, b: bool)",
      );
      const decl = ast.declarations[0] as ExponentialDecl;
      expect(decl.input).toHaveLength(1);
      expect(decl.output).toHaveLength(2);
      expect(decl.output[0].name).toBe("n");
      expect(decl.output[0].type.name).toBe("number");
      expect(decl.output[1].name).toBe("b");
      expect(decl.output[1].type.name).toBe("bool");
    });
  });

  describe("constant declaration", () => {
    it("should convert constant definition to AST and verify all bindings including values", () => {
      const testCase = `
      constant MyObj: obj {
        s = "some string",
        n = 23,
        m = 23.4,
        f = MyMorphism,
        e = 1e-2
      }`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ConstantDecl;
      expect(decl.kind).toBe("ConstantDecl");
      expect(decl.name).toBe("MyObj");
      expect(decl.type.name).toBe("obj");
      expect(decl.bindings).toHaveLength(5);
      expect(decl.bindings[0].name).toBe("s");
      expect(decl.bindings[0].value.kind).toBe("StringValue");
      expect(decl.bindings[0].value.value).toBe("some string");
      expect(decl.bindings[1].name).toBe("n");
      expect(decl.bindings[1].value.kind).toBe("NumberValue");
      expect(decl.bindings[1].value.value).toBe(23);
      expect(decl.bindings[2].name).toBe("m");
      expect(decl.bindings[2].value.kind).toBe("NumberValue");
      expect(decl.bindings[2].value.value).toBe(23.4);
      expect(decl.bindings[3].name).toBe("f");
      expect(decl.bindings[3].value.kind).toBe("IdentifierValue");
      expect(decl.bindings[3].value.value).toBe("MyMorphism");
      expect(decl.bindings[4].name).toBe("e");
      expect(decl.bindings[4].value.kind).toBe("NumberValue");
      expect(decl.bindings[4].value.value).toBe(1e-2);
    });
  });

  describe("morphism declaration", () => {
    it("should convert empty morphism declaration to AST", () => {
      const ast = parseToAst("morphism test: exp { }");
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.kind).toBe("MorphismDecl");
      expect(decl.name).toBe("test");
      expect(decl.exponential).toBe("exp");
      expect(decl.body).toHaveLength(0);
    });

    it("should convert morphism declaration with body to AST", () => {
      const ast = parseToAst('morphism test: exp { "hello" }');
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.body).toHaveLength(1);
      expect(decl.body[0].kind).toBe("StringLiteral");
      expect(decl.body[0].value).toBe("hello");
    });

    it("should convert morphism declaration with multiple statements to AST", () => {
      const ast = parseToAst('morphism test: exp { "hello" "world" }');
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.body).toHaveLength(2);
      expect(decl.body[0].value).toBe("hello");
      expect(decl.body[1].value).toBe("world");
    });
  });

  describe("subobject declaration", () => {
    it("should convert subobject declaration with a single constraint to AST", () => {
      const ast = parseToAst(`subobject Cat of Animal where "is cute"`);
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl).toEqual({
        kind: "SubobjectDecl",
        name: "Cat",
        parent: "Animal",
        predicates: {
          kind: "Predicate",
          value: "is cute",
        },
      });
    });

    it("should convert subobject declaration with a single constraint in conjunctive form to AST", () => {
      const ast = parseToAst(`subobject Cat of Animal where all ( "is cute" )`);
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl).toEqual({
        kind: "SubobjectDecl",
        name: "Cat",
        parent: "Animal",
        predicates: {
          kind: "Conjunction",
          value: [
            {
              kind: "Predicate",
              value: "is cute",
            },
          ],
        },
      });
    });

    it("should convert subobject declaration with a single constraint in disjunctive form to AST", () => {
      const ast = parseToAst(`subobject Cat of Animal where any ( "is cute" )`);
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl).toEqual({
        kind: "SubobjectDecl",
        name: "Cat",
        parent: "Animal",
        predicates: {
          kind: "Disjunction",
          value: [
            {
              kind: "Predicate",
              value: "is cute",
            },
          ],
        },
      });
    });

    it("should convert subobject declaration with multiple constraints in conjunctive form to AST", () => {
      const ast = parseToAst(
        `subobject Cat of Animal where all ( "is cute", "has pointy ears" )`,
      );
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl).toEqual({
        kind: "SubobjectDecl",
        name: "Cat",
        parent: "Animal",
        predicates: {
          kind: "Conjunction",
          value: [
            {
              kind: "Predicate",
              value: "is cute",
            },
            {
              kind: "Predicate",
              value: "has pointy ears",
            },
          ],
        },
      });
    });

    it("should convert subobject declaration with multiple constraints in disjunctive form to AST", () => {
      const ast = parseToAst(
        `subobject Cat of Animal where any ( "is cute", "has pointy ears" )`,
      );
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl).toEqual({
        kind: "SubobjectDecl",
        name: "Cat",
        parent: "Animal",
        predicates: {
          kind: "Disjunction",
          value: [
            {
              kind: "Predicate",
              value: "is cute",
            },
            {
              kind: "Predicate",
              value: "has pointy ears",
            },
          ],
        },
      });
    });

    it("should convert subobject declaration with complex constraints to AST", () => {
      const ast = parseToAst(
        `subobject Cat of Animal where all (
          "is cute",
          any ("is brown", "is black")
        )`,
      );
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl).toEqual({
        kind: "SubobjectDecl",
        name: "Cat",
        parent: "Animal",
        predicates: {
          kind: "Conjunction",
          value: [
            {
              kind: "Predicate",
              value: "is cute",
            },
            {
              kind: "Disjunction",
              value: [
                {
                  kind: "Predicate",
                  value: "is brown",
                },
                {
                  kind: "Predicate",
                  value: "is black",
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe("base types in object declarations", () => {
    it("should convert object declaration with base types to AST", () => {
      const ast = parseToAst("object test { n: Number, s: String }");
      const decl = ast.declarations[0] as ObjectDecl;
      expect(decl.fields).toHaveLength(2);
      expect(decl.fields[0].name).toBe("n");
      expect(decl.fields[0].type.name).toBe("Number");
      expect(decl.fields[1].name).toBe("s");
      expect(decl.fields[1].type.name).toBe("String");
    });

    it("should convert object declaration with mixed base and named types to AST", () => {
      const ast = parseToAst(
        "object test { n: Number, s: String, obj: MyObject }",
      );
      const decl = ast.declarations[0] as ObjectDecl;
      expect(decl.fields).toHaveLength(3);
      expect(decl.fields[0].name).toBe("n");
      expect(decl.fields[0].type.name).toBe("Number");
      expect(decl.fields[1].name).toBe("s");
      expect(decl.fields[1].type.name).toBe("String");
      expect(decl.fields[2].name).toBe("obj");
      expect(decl.fields[2].type.name).toBe("MyObject");
    });
  });

  describe("exponential declaration", () => {
    it("should convert exponential declaration with single input and output to AST", () => {
      const ast = parseToAst("exponential exp from (s: string) to (n: number)");
      const decl = ast.declarations[0] as ExponentialDecl;
      expect(decl.kind).toBe("ExponentialDecl");
      expect(decl.name).toBe("exp");
      expect(decl.input).toHaveLength(1);
      expect(decl.input[0].name).toBe("s");
      expect(decl.input[0].type.name).toBe("string");
      expect(decl.output).toHaveLength(1);
      expect(decl.output[0].name).toBe("n");
      expect(decl.output[0].type.name).toBe("number");
    });

    it("should convert exponential declaration with multiple inputs to AST", () => {
      const ast = parseToAst(
        "exponential exp from (s: string, n: number) to (m: number)",
      );
      const decl = ast.declarations[0] as ExponentialDecl;
      expect(decl.input).toHaveLength(2);
      expect(decl.input[0].name).toBe("s");
      expect(decl.input[1].name).toBe("n");
      expect(decl.output).toHaveLength(1);
    });

    it("should convert exponential declaration with multiple outputs to AST", () => {
      const ast = parseToAst(
        "exponential exp from (s: string) to (n: number, b: bool)",
      );
      const decl = ast.declarations[0] as ExponentialDecl;
      expect(decl.input).toHaveLength(1);
      expect(decl.output).toHaveLength(2);
      expect(decl.output[0].name).toBe("n");
      expect(decl.output[0].type.name).toBe("number");
      expect(decl.output[1].name).toBe("b");
      expect(decl.output[1].type.name).toBe("bool");
    });

    it("should convert exponential declaration with base types to AST", () => {
      const ast = parseToAst("exponential exp from (n: Number) to (s: String)");
      const decl = ast.declarations[0] as ExponentialDecl;
      expect(decl.input).toHaveLength(1);
      expect(decl.input[0].name).toBe("n");
      expect(decl.input[0].type.name).toBe("Number");
      expect(decl.output).toHaveLength(1);
      expect(decl.output[0].name).toBe("s");
      expect(decl.output[0].type.name).toBe("String");
    });
  });

  describe("multiple declarations", () => {
    it("should convert multiple declarations to AST", () => {
      const ast = parseToAst(`
        exponential exp from (s: string) to (n: number)
        morphism test: exp { "hello" }
        subobject Student of Person where "is enrolled"
      `);
      expect(ast.declarations).toHaveLength(3);
      expect(ast.declarations[0].kind).toBe("ExponentialDecl");
      expect(ast.declarations[1].kind).toBe("MorphismDecl");
      expect(ast.declarations[2].kind).toBe("SubobjectDecl");
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid syntax", () => {
      expect(() => parseToAst("object test { s: }")).toThrow();
    });
  });
});
