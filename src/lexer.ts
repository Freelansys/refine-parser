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
export const ExponentialTok = createToken({
  name: "ExponentialTok",
  pattern: /exponential\b/,
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
export const FromTok = createToken({ name: "FromTok", pattern: /from\b/ });
export const ToTok = createToken({ name: "ToTok", pattern: /to\b/ });
export const ConstantTok = createToken({
  name: "ConstantTok",
  pattern: /constant\b/,
});
export const WhereTok = createToken({ name: "WhereTok", pattern: /where\b/ });
export const AllTok = createToken({ name: "AllTok", pattern: /all\b/ });
export const AnyTok = createToken({ name: "AnyTok", pattern: /any\b/ });

// -----------------
// Base Types
// -----------------

export const NumberTok = createToken({
  name: "NumberTok",
  pattern: /Number\b/,
});
export const StringTok = createToken({
  name: "StringTok",
  pattern: /String\b/,
});
export const BoolTok = createToken({
  name: "BoolTok",
  pattern: /Bool\b/,
});
export const UnitTok = createToken({
  name: "UnitTok",
  pattern: /Unit\b/,
});

// -----------------
// Symbols
// -----------------

export const LCurly = createToken({ name: "LCurly", pattern: /{/ });
export const RCurly = createToken({ name: "RCurly", pattern: /}/ });
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
  ExponentialTok,
  MorphismTok,
  SubobjectTok,
  OfTok,
  FromTok,
  ToTok,
  ConstantTok,
  WhereTok,
  AllTok,
  AnyTok,

  NumberTok,
  StringTok,
  BoolTok,
  UnitTok,

  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Comma,
  Equals,

  SingleString,
  NumberLiteral,

  Identifier,
];

export const SpecLexer = new Lexer(allTokens);
