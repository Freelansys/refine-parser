import { describe, it, expect } from "vitest";
import { SpexLexer } from "../src/lexer.js";

describe("SpecLexer", () => {
  describe("tokenization", () => {
    it("should tokenize keywords", () => {
      const result = SpexLexer.tokenize("object let select where if then else eval given");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "ObjectTok",
        "LetTok",
        "SelectTok",
        "WhereTok",
        "IfTok",
        "ThenTok",
        "ElseTok",
        "EvalTok",
        "GivenTok"
      ]);
    });

    it("should tokenize symbols", () => {
      const result = SpexLexer.tokenize("->{}[]():,");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "ArrowTok",
        "LCurly",
        "RCurly",
        "LBracket",
        "RBracket",
        "LParen",
        "RParen",
        "Colon",
        "Comma",
      ]);
    });

    it("should tokenize identifiers", () => {
      const result = SpexLexer.tokenize("foo bar _test _123 ABC");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual(
        Array(5).fill("Identifier"),
      );
      expect(result.tokens.map((t) => t.image)).toEqual([
        "foo",
        "bar",
        "_test",
        "_123",
        "ABC",
      ]);
    });

    it("should skip whitespace", () => {
      const result = SpexLexer.tokenize("foo   bar\t\nbaz");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual(
        Array(3).fill("Identifier"),
      );
    });

    it("should handle mixed input", () => {
      const result = SpexLexer.tokenize("object Foo ( name: string )");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "ObjectTok",
        "Identifier",
        "LParen",
        "Identifier",
        "Colon",
        "Identifier",
        "RParen",
      ]);
    });

    it("should handle keywords with word boundary", () => {
      const result = SpexLexer.tokenize("objectfoo fooobject letfoo foolet fooselect selectfoo fooif iffoo thenfoo foothen elsefoo fooelse");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        Array(12).fill("Identifier"),
      ]);
    });

    it("should tokenize single-quoted strings", () => {
      const result = SpexLexer.tokenize("'hello world'");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]?.tokenType.name).toBe("SingleString");
      expect(result.tokens[0]?.image).toBe("'hello world'");
    });

    it("should tokenize double-quoted instructions", () => {
      const result = SpexLexer.tokenize('"go"');
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]?.tokenType.name).toBe("Instruction");
      expect(result.tokens[0]?.image).toBe('"go"');
    });

    it("should tokenize numbers", () => {
      const result = SpexLexer.tokenize("-1 1 0.2 1e-2 .2");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(5);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        Array(5).fill("NumberLiteral"),
      ]);
      expect(result.tokens.map((t) => t.image)).toEqual([
        "-1",
        "1",
        "0.2",
        "1e-2",
        ".2",
      ]);
    });

    it("should tokenize booleans", () => {
      const result = SpexLexer.tokenize("true false");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "BoolLiteral",
        "BoolLiteral",
      ]);
      expect(result.tokens.map((t) => t.image)).toEqual([
        "true",
        "false",
      ]);
    });
  });

  describe("error handling", () => {
    it("should return empty tokens for empty input", () => {
      const result = SpexLexer.tokenize("");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(0);
    });
  });
});
