import type { ICstVisitor } from "chevrotain";
import type {
  SpecFile,
  Declaration,
  ObjectDecl,
  ExponentialDecl,
  MorphismDecl,
  ConstantDecl,
  ConstantBinding,
  ConstantValue,
  TypedBinding,
  SubobjectDecl,
  NamedType,
  Statement,
  PredicateExpression,
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
    if (ctx.constantDecl) {
      return this.visit(ctx.constantDecl[0]);
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
    const predicates: PredicateExpression = this.visit(ctx.predicateExpression[0]);
    return { kind: "SubobjectDecl", name, parent, predicates };
  }

  predicateExpression(ctx: any): PredicateExpression {
    if (ctx.predicateBlock) {
      return this.visit(ctx.predicateBlock);
    }
    if (ctx.SingleString){
      const rawValue = ctx.SingleString[0].image;
      return {
        kind: "Predicate",
        value: rawValue.substring(1, rawValue.length - 1)
      };
    }
    throw new Error("Unknown predicate expression type");
  }

  predicateBlock(ctx: any): PredicateExpression {
    const isAll = ctx.AllTok !== undefined;
    const children = ctx.predicateExpression.map((child: any) => this.visit(child));

    if (isAll) {
      return {
        kind: "Conjunction",
        value: children
      };
    } else {
      return {
        kind: "Disjunction",
        value: children
      };
    }
  }

  constantDecl(ctx: any): ConstantDecl {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.atomicType[0]);
    const bindings: ConstantBinding[] = this.visit(ctx.constantBlock[0]);
    return { kind: "ConstantDecl", name, type, bindings };
  }

  constantBlock(ctx: any): ConstantBinding[] {
    return this.visit(ctx.constantBindingList[0]);
  }

  constantBindingList(ctx: any): ConstantBinding[] {
    const bindings = ctx.constantBinding.map((b: any) => this.visit(b));
    return bindings;
  }

  constantBinding(ctx: any): ConstantBinding {
    const name = ctx.Identifier[0].image;
    const value = this.visit(ctx.constantValue[0]);
    return { name, value };
  }

  constantValue(ctx: any): ConstantValue {
    if (ctx.SingleString) {
      return { kind: "StringValue", value: ctx.SingleString[0].image };
    }
    if (ctx.NumberLiteral) {
      return {
        kind: "NumberValue",
        value: parseFloat(ctx.NumberLiteral[0].image),
      };
    }
    if (ctx.Identifier) {
      return { kind: "IdentifierValue", value: ctx.Identifier[0].image };
    }
    throw new Error("Unknown constant value type");
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
