import type { ICstVisitor } from "chevrotain";
import type {
  SpecFile,
  Declaration,
  ObjectDecl,
  ExponentialDecl,
  MorphismDecl,
  TypedBinding,
  SubobjectDecl,
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
    if (ctx.exponentialDecl) {
      return this.visit(ctx.exponentialDecl[0]);
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
    const fields: TypedBinding[] = ctx.fieldDecl
      ? this.visit(ctx.fieldDecl[0])
      : [];
    return { kind: "ObjectDecl", name, fields };
  }

  fieldDecl(ctx: any): TypedBinding[] {
    return this.visit(ctx.typedBindingList[0]);
  }

  exponentialDecl(ctx: any): ExponentialDecl {
    const name = ctx.Identifier[0].image;
    const input: TypedBinding[] = this.visit(ctx.typedBindingList[0]);
    const output: TypedBinding[] = this.visit(ctx.typedBindingList[1]);
    return { kind: "ExponentialDecl", name, input, output };
  }

  typedBindingList(ctx: any): TypedBinding[] {
    const bindings = ctx.typedBinding.map((b: any) => this.visit(b));
    return bindings;
  }

  typedBinding(ctx: any): TypedBinding {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.atomicType[0]);
    return { name, type };
  }

  morphismDecl(ctx: any): MorphismDecl {
    const name = ctx.Identifier[0].image;
    const exponential = ctx.Identifier[1].image;
    const body: Statement[] = ctx.block ? this.visit(ctx.block[0]) : [];
    return { kind: "MorphismDecl", name, exponential, body };
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
