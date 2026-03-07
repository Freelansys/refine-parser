import { CstParser } from "chevrotain";
import {
  allTokens,
  ObjectTok,
  MorphismTok,
  SubobjectTok,
  OfTok,
  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Comma,
  Arrow,
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
    this.CONSUME(Identifier);
    this.CONSUME(Colon);
    this.SUBRULE(this.typeExpr);

    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE(this.fieldDecl);
    });
  });

  private paramList = this.RULE("paramList", () => {
    this.SUBRULE(this.param);

    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE2(this.param);
    });
  });

  private param = this.RULE("param", () => {
    this.CONSUME(Identifier);
    this.CONSUME(Colon);
    this.SUBRULE(this.typeExpr);
  });

  private morphismDecl = this.RULE("morphismDecl", () => {
    this.CONSUME(MorphismTok);

    this.CONSUME(Identifier);

    this.CONSUME(LParen);

    this.OPTION(() => {
      this.SUBRULE(this.paramList);
    });

    this.CONSUME(RParen);

    this.CONSUME(Arrow);

    this.SUBRULE(this.typeExpr);

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

  private typeExpr = this.RULE("typeExpr", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.OPTION(() => {
            this.SUBRULE(this.paramTypeList);
          });
          this.CONSUME(RParen);
          this.CONSUME(Arrow);
          this.SUBRULE(this.typeExpr);
        },
      },
      {
        ALT: () => {
          this.SUBRULE(this.atomicType);
          this.OPTION2(() => {
            this.CONSUME2(Arrow);
            this.SUBRULE2(this.typeExpr);
          });
        },
      },
    ]);
  });

  private paramTypeList = this.RULE("paramTypeList", () => {
    this.SUBRULE(this.atomicType);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE2(this.atomicType);
    });
  });

  private atomicType = this.RULE("atomicType", () => {
    this.CONSUME(Identifier);
  });
}
