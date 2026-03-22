import { CstParser } from "chevrotain";
import {
  allTokens,
  ObjectTok,
  SelectTok,
  WhereTok,
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
  Identifier,
  StringLiteral,
  NumberLiteral,
  BoolLiteral,
  Instruction,
  LetTok,
} from "./lexer.js";

export class SpexParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  public spexFile = this.RULE("spexFile", () => {
    this.MANY(() => {
      this.SUBRULE(this.declaration);
    });
  });

  private declaration = this.RULE("declaration", () => {
    throw new Error("not implemented");
  });
}
