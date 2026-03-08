import { CstParser } from "chevrotain";
import {
  allTokens,
  ObjectTok,
  ExponentialTok,
  MorphismTok,
  SubobjectTok,
  OfTok,
  FromTok,
  ToTok,
  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Comma,
  Identifier,
  SingleString,
} from "./lexer.js";

export class SpecParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  public specFile = this.RULE("specFile", () => {
    this.MANY(() => {
      this.SUBRULE(this.declaration);
    });
  });

  private declaration = this.RULE("declaration", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.objectDecl) },
      { ALT: () => this.SUBRULE(this.exponentialDecl) },
      { ALT: () => this.SUBRULE(this.morphismDecl) },
      { ALT: () => this.SUBRULE(this.subobjectDecl) },
    ]);
  });

  private objectDecl = this.RULE("objectDecl", () => {
    this.CONSUME(ObjectTok);
    this.CONSUME(Identifier);

    this.OPTION(() => {
      this.CONSUME(LCurly);

      this.MANY(() => {
        this.SUBRULE(this.fieldDecl);
      });

      this.CONSUME(RCurly);
    });
  });

  private fieldDecl = this.RULE("fieldDecl", () => {
    this.SUBRULE(this.typedBindingList);
  });

  private exponentialDecl = this.RULE("exponentialDecl", () => {
    this.CONSUME(ExponentialTok);
    this.CONSUME(Identifier);
    this.CONSUME(FromTok);
    this.CONSUME(LParen);
    this.SUBRULE(this.typedBindingList);
    this.CONSUME(RParen);
    this.CONSUME(ToTok);
    this.CONSUME2(LParen);
    this.SUBRULE2(this.typedBindingList);
    this.CONSUME2(RParen);
  });

  private typedBindingList = this.RULE("typedBindingList", () => {
    this.SUBRULE(this.typedBinding);

    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE2(this.typedBinding);
    });
  });

  private typedBinding = this.RULE("typedBinding", () => {
    this.CONSUME(Identifier);
    this.CONSUME(Colon);
    this.SUBRULE(this.atomicType);
  });

  private morphismDecl = this.RULE("morphismDecl", () => {
    this.CONSUME(MorphismTok);
    this.CONSUME(Identifier);
    this.CONSUME(Colon);
    this.CONSUME2(Identifier);
    this.SUBRULE(this.block);
  });

  private block = this.RULE("block", () => {
    this.CONSUME(LCurly);

    this.MANY(() => {
      this.SUBRULE(this.statement);
    });

    this.CONSUME(RCurly);
  });

  private statement = this.RULE("statement", () => {
    this.CONSUME(SingleString);
  });

  private subobjectDecl = this.RULE("subobjectDecl", () => {
    this.CONSUME(SubobjectTok);

    this.CONSUME(Identifier);

    this.CONSUME(OfTok);

    this.CONSUME2(Identifier);

    this.OPTION(() => {
      this.SUBRULE(this.predicateBlock);
    });
  });

  private predicateBlock = this.RULE("predicateBlock", () => {
    this.CONSUME(LCurly);

    this.MANY(() => {
      this.SUBRULE(this.predicateStatement);
    });

    this.CONSUME(RCurly);
  });

  private predicateStatement = this.RULE("predicateStatement", () => {
    this.CONSUME(SingleString);
  });

  private atomicType = this.RULE("atomicType", () => {
    this.CONSUME(Identifier);
  });
}
