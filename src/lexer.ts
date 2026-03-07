import { createToken, Lexer } from "chevrotain";

// -----------------
// Whitespace
// -----------------

export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// -----------------
// Keywords
// -----------------

export const ObjectTok = createToken({
  name: "ObjectTok",
  pattern: /object\b/,
});
export const MorphismTok = createToken({
  name: "MorphismTok",
  pattern: /morphism\b/,
});
export const SubobjectTok = createToken({
  name: "SubobjectTok",
  pattern: /subobject\b/,
});
export const OfTok = createToken({ name: "OfTok", pattern: /of\b/ });

// -----------------
// Constants
// -----------------

export const SingleString = createToken({
  name: "SingleString",
  pattern: /"([^"\\]|\\.)*"/,
});
export const TripleString = createToken({
  name: "TripleString",
  pattern: /"""[\s\S]*?"""/,
});

// -----------------
// Symbols
// -----------------

export const LCurly = createToken({ name: "LCurly", pattern: /{/ });
export const RCurly = createToken({ name: "RCurly", pattern: /}/ });
export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const Colon = createToken({ name: "Colon", pattern: /:/ });
export const Arrow = createToken({ name: "Arrow", pattern: /->/ });
export const Equals = createToken({ name: "Equals", pattern: /=/ });
export const Comma = createToken({ name: "Comma", pattern: /,/ });
export const Dot = createToken({ name: "Dot", pattern: /\./ });

// -----------------
// Identifiers
// -----------------

export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

// Order matters: keywords must come before Identifier
export const allTokens = [
  WhiteSpace,

  ObjectTok,
  MorphismTok,
  SubobjectTok,
  OfTok,

  Arrow,
  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Equals,
  Comma,
  Dot,

  TripleString,
  SingleString,

  Identifier,
];

export const SpecLexer = new Lexer(allTokens);
