import { describe, it, expect } from "vitest";
import {
  SpecLexer,
  ObjectTok,
  ProcessTok,
  SubobjectTok,
  OfTok,
  WhereTok,
  FunTok,
  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Arrow,
  Equals,
  Comma,
  Dot,
  Identifier,
  WhiteSpace,
} from "../src/lexer.js";

describe("SpecLexer", () => {
  describe("tokenization", () => {
    it("should tokenize keywords", () => {
      const result = SpecLexer.tokenize(
        "object process subobject of where fun",
      );
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "ObjectTok",
        "ProcessTok",
        "SubobjectTok",
        "OfTok",
        "WhereTok",
        "FunTok",
      ]);
    });

    it("should tokenize symbols", () => {
      const result = SpecLexer.tokenize("{}():->=,");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "LCurly",
        "RCurly",
        "LParen",
        "RParen",
        "Colon",
        "Arrow",
        "Equals",
        "Comma",
      ]);
    });

    it("should tokenize identifiers", () => {
      const result = SpecLexer.tokenize("foo bar _test _123 ABC");
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
      const result = SpecLexer.tokenize("foo   bar\t\nbaz");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual(
        Array(3).fill("Identifier"),
      );
    });

    it("should handle mixed input", () => {
      const result = SpecLexer.tokenize("object Foo { name: string }");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "ObjectTok",
        "Identifier",
        "LCurly",
        "Identifier",
        "Colon",
        "Identifier",
        "RCurly",
      ]);
    });

    it("should handle arrow token", () => {
      const result = SpecLexer.tokenize("->");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]?.tokenType.name).toBe("Arrow");
    });

    it("should handle dot token", () => {
      const result = SpecLexer.tokenize("foo.bar");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "Identifier",
        "Dot",
        "Identifier",
      ]);
    });

    it("should handle keywords before identifiers (longest match)", () => {
      const result = SpecLexer.tokenize("object objectfoo");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.map((t) => t.tokenType.name)).toEqual([
        "ObjectTok",
        "ObjectTok",
        "Identifier",
      ]);
    });
  });

  describe("error handling", () => {
    it("should return empty tokens for empty input", () => {
      const result = SpecLexer.tokenize("");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(0);
    });
  });
});
