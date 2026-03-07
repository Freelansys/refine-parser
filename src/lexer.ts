import { createToken, Lexer } from "chevrotain"

// -----------------
// Whitespace
// -----------------

export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
})

// -----------------
// Keywords
// -----------------

export const ObjectTok = createToken({ name: "ObjectTok", pattern: /object/ })
export const ProcessTok = createToken({ name: "ProcessTok", pattern: /process/ })
export const SubobjectTok = createToken({ name: "SubobjectTok", pattern: /subobject/ })
export const OfTok = createToken({ name: "OfTok", pattern: /of/ })
export const WhereTok = createToken({ name: "WhereTok", pattern: /where/ })
export const FunTok = createToken({ name: "FunTok", pattern: /fun/ })

// -----------------
// Symbols
// -----------------

export const LCurly = createToken({ name: "LCurly", pattern: /{/ })
export const RCurly = createToken({ name: "RCurly", pattern: /}/ })
export const LParen = createToken({ name: "LParen", pattern: /\(/ })
export const RParen = createToken({ name: "RParen", pattern: /\)/ })
export const Colon = createToken({ name: "Colon", pattern: /:/ })
export const Arrow = createToken({ name: "Arrow", pattern: /->/ })
export const Equals = createToken({ name: "Equals", pattern: /=/ })
export const Comma = createToken({ name: "Comma", pattern: /,/ })
export const Dot = createToken({ name: "Dot", pattern: /\./ })

// -----------------
// Identifiers
// -----------------

export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
})

// Order matters: keywords must come before Identifier
export const allTokens = [
  WhiteSpace,

  ObjectTok,
  ProcessTok,
  SubobjectTok,
  OfTok,
  WhereTok,
  FunTok,

  Arrow,
  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Equals,
  Comma,
  Dot,

  Identifier
]

export const SpecLexer = new Lexer(allTokens)