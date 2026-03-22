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

export const LetTok = createToken({
  name: "LetTok",
  pattern: /let\b/,
});
export const ObjectTok = createToken({
  name: "ObjectTok",
  pattern: /object\b/,
});
export const SelectTok = createToken({ name: "SelectTok", pattern: /select\b/ });
export const WhereTok = createToken({ name: "WhereTok", pattern: /where\b/ });
export const IfTok = createToken({ name: "IfTok", pattern: /if\b/ });
export const ThenTok = createToken({ name: "ThenTok", pattern: /then\b/ });
export const ElseTok = createToken({ name: "ElseTok", pattern: /else\b/ });

// -----------------
// Symbols
// -----------------
export const ArrowTok = createToken({ name: "ArrowTok", pattern: /->/ });
export const LCurly = createToken({ name: "LCurly", pattern: /{/ });
export const RCurly = createToken({ name: "RCurly", pattern: /}/ });
export const LBracket = createToken({ name: "LCurly", pattern: /\[/ });
export const RBracket = createToken({ name: "RCurly", pattern: /\]/ });
export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const Colon = createToken({ name: "Colon", pattern: /:/ });
export const Comma = createToken({ name: "Comma", pattern: /,/ });
export const Equals = createToken({ name: "Equals", pattern: /=/ });

// -----------------
// Constants
// -----------------

export const SingleString = createToken({
  name: "SingleString",
  pattern: /"([^"\\]|\\.)*"/,
});

export const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/,
});

export const BoolLiteral = createToken({
  name: "NumberLiteral",
  pattern: /\b(true|false)\b/g,
});

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

  LetTok,
  ObjectTok,
  SelectTok,
  WhereTok,
  IfTok,
  ThenTok,
  ElseTok,

  ArrowTok,
  LCurly,
  RCurly,
  LBracket,
  RBracket,
  LParen,
  RParen,
  Colon,
  Comma,
  Equals,

  SingleString,
  NumberLiteral,
  BoolLiteral,

  Identifier,
];

export const SpexLexer = new Lexer(allTokens);
