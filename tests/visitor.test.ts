import { describe, it, expect } from "vitest";
import { parseToAst } from "../src/visitor.js";
import type {
  SpecFile,
  ObjectDecl,
  MorphismDecl,
  SubobjectDecl,
  FieldDecl,
  Param,
  TypeExpr,
  Statement,
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

    it("should convert function type to AST", () => {
      const ast = parseToAst("object test { f: string -> number }");
      const decl = ast.declarations[0] as ObjectDecl;
      expect(decl.fields[0].type.kind).toBe("FunctionType");
      const funcType = decl.fields[0].type as any;
      expect(funcType.params).toHaveLength(1);
      expect(funcType.params[0].name).toBe("string");
      expect(funcType.returnType.name).toBe("number");
    });

    it("should convert parenthesized function type to AST", () => {
      const ast = parseToAst("object test { f: (string, number) -> bool }");
      const decl = ast.declarations[0] as ObjectDecl;
      expect(decl.fields[0].type.kind).toBe("FunctionType");
      const funcType = decl.fields[0].type as any;
      expect(funcType.params).toHaveLength(2);
      expect(funcType.params[0].name).toBe("string");
      expect(funcType.params[1].name).toBe("number");
      expect(funcType.returnType.name).toBe("bool");
    });
  });

  describe("morphism declaration", () => {
    it("should convert empty morphism declaration to AST", () => {
      const ast = parseToAst("morphism test() -> void { }");
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.kind).toBe("MorphismDecl");
      expect(decl.name).toBe("test");
      expect(decl.params).toHaveLength(0);
      expect(decl.returnType.name).toBe("void");
      expect(decl.body).toHaveLength(0);
    });

    it("should convert morphism declaration with parameter to AST", () => {
      const ast = parseToAst("morphism test(s: string) -> void { }");
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.params).toHaveLength(1);
      expect(decl.params[0].name).toBe("s");
      expect(decl.params[0].type.name).toBe("string");
    });

    it("should convert morphism declaration with multiple parameters to AST", () => {
      const ast = parseToAst("morphism test(a: number, b: string) -> void { }");
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.params).toHaveLength(2);
      expect(decl.params[0].name).toBe("a");
      expect(decl.params[0].type.name).toBe("number");
      expect(decl.params[1].name).toBe("b");
      expect(decl.params[1].type.name).toBe("string");
    });

    it("should convert morphism declaration with body to AST", () => {
      const ast = parseToAst('morphism test() -> void { "hello" }');
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.body).toHaveLength(1);
      expect(decl.body[0].kind).toBe("StringLiteral");
      expect(decl.body[0].value).toBe('"hello"');
    });

    it("should convert morphism declaration with multiple statements to AST", () => {
      const ast = parseToAst('morphism test() -> void { "hello" "world" }');
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.body).toHaveLength(2);
      expect(decl.body[0].value).toBe('"hello"');
      expect(decl.body[1].value).toBe('"world"');
    });

    it("should convert morphism declaration with function type parameter to AST", () => {
      const ast = parseToAst("morphism test(f: string -> bool) -> void { }");
      const decl = ast.declarations[0] as MorphismDecl;
      expect(decl.params[0].type.kind).toBe("FunctionType");
      const funcType = decl.params[0].type as any;
      expect(funcType.params[0].name).toBe("string");
      expect(funcType.returnType.name).toBe("bool");
    });
  });

  describe("subobject declaration", () => {
    it("should convert empty subobject declaration to AST", () => {
      const ast = parseToAst("subobject Cat of Animal { }");
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl.kind).toBe("SubobjectDecl");
      expect(decl.name).toBe("Cat");
      expect(decl.parent).toBe("Animal");
      expect(decl.predicates).toHaveLength(0);
    });

    it("should convert subobject declaration with predicate to AST", () => {
      const ast = parseToAst('subobject Cat of Animal { "is cute" }');
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl.predicates).toHaveLength(1);
      expect(decl.predicates[0]).toBe('"is cute"');
    });

    it("should convert subobject declaration with multiple predicates to AST", () => {
      const ast = parseToAst(
        'subobject Cat of Animal { "is cute" "has pointy ears" }',
      );
      const decl = ast.declarations[0] as SubobjectDecl;
      expect(decl.predicates).toHaveLength(2);
      expect(decl.predicates[0]).toBe('"is cute"');
      expect(decl.predicates[1]).toBe('"has pointy ears"');
    });
  });

  describe("multiple declarations", () => {
    it("should convert multiple declarations to AST", () => {
      const ast = parseToAst(`
        object Person { name: string, age: number }
        morphism greet(p: Person) -> void { "hello" }
        subobject Student of Person { "is enrolled" }
      `);
      expect(ast.declarations).toHaveLength(3);
      expect(ast.declarations[0].kind).toBe("ObjectDecl");
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
