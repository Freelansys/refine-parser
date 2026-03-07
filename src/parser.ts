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

    const $ = this as any;

    $.RULE("specFile", () => {
      $.MANY(() => {
        $.SUBRULE($.declaration);
      });
    });

    $.RULE("declaration", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.objectDecl) },
        { ALT: () => $.SUBRULE($.morphismDecl) },
        { ALT: () => $.SUBRULE($.subobjectDecl) },
      ]);
    });

    $.RULE("objectDecl", () => {
      $.CONSUME(ObjectTok);
      $.CONSUME(Identifier);

      $.OPTION(() => {
        $.CONSUME(LCurly);

        $.MANY(() => {
          $.SUBRULE($.fieldDecl);
        });

        $.CONSUME(RCurly);
      });
    });

    $.RULE("fieldDecl", () => {
      $.CONSUME(Identifier);
      $.CONSUME(Colon);
      $.SUBRULE($.typeExpr);

      $.MANY(() => {
        $.CONSUME(Comma);
        $.SUBRULE($.fieldDecl);
      });
    });

    $.RULE("paramList", () => {
      $.SUBRULE($.param);

      $.MANY(() => {
        $.CONSUME(Comma);
        $.SUBRULE2($.param);
      });
    });

    $.RULE("param", () => {
      $.CONSUME(Identifier);
      $.CONSUME(Colon);
      $.SUBRULE($.typeExpr);
    });

    $.RULE("morphismDecl", () => {
      $.CONSUME(MorphismTok);

      $.CONSUME(Identifier);

      $.CONSUME(LParen);

      $.OPTION(() => {
        $.SUBRULE($.paramList);
      });

      $.CONSUME(RParen);

      $.CONSUME(Arrow);

      $.SUBRULE($.typeExpr);

      $.SUBRULE($.block);
    });

    $.RULE("block", () => {
      $.CONSUME(LCurly);

      $.MANY(() => {
        $.SUBRULE($.statement);
      });

      $.CONSUME(RCurly);
    });

    $.RULE("statement", () => {
      $.CONSUME(SingleString);
    });

    $.RULE("subobjectDecl", () => {
      $.CONSUME(SubobjectTok);

      $.CONSUME(Identifier);

      $.CONSUME(OfTok);

      $.CONSUME2(Identifier);

      $.OPTION(() => {
        $.SUBRULE($.predicateBlock);
      });
    });

    $.RULE("predicateBlock", () => {
      $.CONSUME(LCurly);

      $.MANY(() => {
        $.SUBRULE($.predicateStatement);
      });

      $.CONSUME(RCurly);
    });

    $.RULE("predicateStatement", () => {
      $.CONSUME(SingleString);
    });

    $.RULE("typeExpr", () => {
      $.SUBRULE($.atomicType);

      $.OPTION(() => {
        $.CONSUME(Arrow);
        $.SUBRULE2($.typeExpr);
      });
    });

    $.RULE("atomicType", () => {
      $.CONSUME(Identifier);
    });

    this.performSelfAnalysis();
  }
}
