import type { ICstVisitor } from "chevrotain";
import type {
  SpecFile,
  Declaration,
  ObjectDecl,
  FieldDecl,
  MorphismDecl,
  Param,
  SubobjectDecl,
  TypeExpr,
  NamedType,
  Statement,
} from "./ast.js";
import { SpecLexer } from "./lexer.js";
import { SpecParser } from "./parser.js";

const parserInstance = new SpecParser();
const BaseSpecVisitor = parserInstance.getBaseCstVisitorConstructor();

export class SpecParserVisitor
  extends BaseSpecVisitor
  implements ICstVisitor<any, any>
{
  constructor() {
    super();
    this.validateVisitor();
  }

  specFile(ctx: any): SpecFile {
    const declarations = ctx.declaration.map((decl: any) => this.visit(decl));
    return { declarations };
  }

  declaration(ctx: any): Declaration {
    if (ctx.objectDecl) {
      return this.visit(ctx.objectDecl[0]);
    }
    if (ctx.morphismDecl) {
      return this.visit(ctx.morphismDecl[0]);
    }
    if (ctx.subobjectDecl) {
      return this.visit(ctx.subobjectDecl[0]);
    }
    throw new Error("Unknown declaration type");
  }

  objectDecl(ctx: any): ObjectDecl {
    const name = ctx.Identifier[0].image;
    const fields: FieldDecl[] = ctx.fieldDecl ? this.visit(ctx.fieldDecl) : [];
    return { kind: "ObjectDecl", name, fields };
  }

  fieldDecl(ctx: any): FieldDecl[] {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.typeExpr[0]);

    const currentField: FieldDecl = { name, type };
    const results: FieldDecl[] = [currentField];

    if (ctx.fieldDecl && ctx.fieldDecl.length > 0) {
      const nestedFields = this.visit(ctx.fieldDecl[0]);
      results.push(...nestedFields);
    }

    return results;
  }

  paramList(ctx: any): Param[] {
    const params = ctx.param.map((p: any) => this.visit(p));
    return params;
  }

  param(ctx: any): Param {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.typeExpr[0]);
    return { name, type };
  }

  morphismDecl(ctx: any): MorphismDecl {
    const name = ctx.Identifier[0].image;
    const params: Param[] = ctx.paramList ? this.visit(ctx.paramList[0]) : [];
    const returnType = this.visit(ctx.typeExpr[0]);
    const body: Statement[] = this.visit(ctx.block[0]);
    return { kind: "MorphismDecl", name, params, returnType, body };
  }

  block(ctx: any): Statement[] {
    const statements = ctx.statement
      ? ctx.statement.map((s: any) => this.visit(s))
      : [];
    return statements;
  }

  statement(ctx: any): Statement {
    const value = ctx.SingleString[0].image;
    return { kind: "StringLiteral", value };
  }

  subobjectDecl(ctx: any): SubobjectDecl {
    const name = ctx.Identifier[0].image;
    const parent = ctx.Identifier[1].image;
    const predicates: string[] = ctx.predicateBlock
      ? this.visit(ctx.predicateBlock[0])
      : [];
    return { kind: "SubobjectDecl", name, parent, predicates };
  }

  predicateBlock(ctx: any): string[] {
    const statements = ctx.predicateStatement
      ? ctx.predicateStatement.map((s: any) => this.visit(s))
      : [];
    return statements;
  }

  predicateStatement(ctx: any): string {
    return ctx.SingleString[0].image;
  }

  typeExpr(ctx: any): TypeExpr {
    if (ctx.LParen) {
      const params: any[] = ctx.paramTypeList
        ? this.visit(ctx.paramTypeList[0])
        : [];
      const returnType = this.visit(ctx.typeExpr[0]);
      return { kind: "FunctionType", params, returnType };
    }

    const atomicType = this.visit(ctx.atomicType[0]);

    if (ctx.Arrow && ctx.typeExpr && ctx.typeExpr.length > 0) {
      const returnType = this.visit(ctx.typeExpr[0]);
      return { kind: "FunctionType", params: [atomicType], returnType };
    }

    return atomicType;
  }

  paramTypeList(ctx: any): TypeExpr[] {
    const types = ctx.atomicType.map((a: any) => this.visit(a));
    return types;
  }

  atomicType(ctx: any): NamedType {
    const name = ctx.Identifier[0].image;
    return { kind: "NamedType", name };
  }
}

export function parseToAst(text: string): SpecFile {
  const lexingResult = SpecLexer.tokenize(text);
  parserInstance.input = lexingResult.tokens;
  const cst = parserInstance.specFile();

  if (parserInstance.errors.length > 0) {
    throw new Error(
      `Parsing errors: ${JSON.stringify(parserInstance.errors, null, 2)}`,
    );
  }

  const visitor = new SpecParserVisitor();
  return visitor.visit(cst);
}
