import type { ICstVisitor } from "chevrotain";
import type {
  SpexFile,
  Declaration,
  ObjectDeclaration,
  InstanceDeclaration,
  ObjectExpression,
  InstanceExpression,
  NamedObject,
  ProductObject,
  ExponentialObject,
  SubObject,
  ProductInstance,
  IfExpression,
  GivenExpression,
  PropertyAccess,
  Step,
  Composition,
} from "./ast.js";
import { SpexLexer } from "./lexer.js";
import { SpexParser } from "./parser.js";

const parserInstance = new SpexParser();
const BaseSpexVisitor = parserInstance.getBaseCstVisitorConstructor();

const getStringValue = (rawValue: string): string => {
  return rawValue.substring(1, rawValue.length - 1);
};

const getInstructionValue = (rawValue: string): string => {
  return rawValue.substring(1, rawValue.length - 1);
};

export class SpexParserVisitor
  extends BaseSpexVisitor
  implements ICstVisitor<any, any>
{
  constructor() {
    super();
    this.validateVisitor();
  }

  spexFile(ctx: any): SpexFile {
    const declarations = ctx.declaration.map((decl: any) => this.visit(decl));
    return { kind: "SpexFile", declarations };
  }

  declaration(ctx: any): Declaration {
    if (ctx.objectDeclaration) {
      return this.visit(ctx.objectDeclaration);
    }
    return this.visit(ctx.instanceDeclaration);
  }

  objectDeclaration(ctx: any): ObjectDeclaration {
    return {
      kind: "ObjectDeclaration",
      name: ctx.Identifier[0].image,
      object: this.visit(ctx.objectExpression),
    };
  }

  instanceDeclaration(ctx: any): InstanceDeclaration {
    return {
      kind: "InstanceDeclaration",
      name: ctx.Identifier[0].image,
      type: this.visit(ctx.objectExpression),
      instance: this.visit(ctx.instanceExpression),
    };
  }

  objectExpression(ctx: any): ObjectExpression {
    if (ctx.base) {
      const exponent = this.visit(ctx.base);
      if (ctx.exponent) {
        return {
          kind: "ExponentialObject",
          base: this.visit(ctx.exponent),
          exponent,
        };
      }
      return exponent;
    }
    throw new Error("Invalid object expression");
  }

  objectOperand(ctx: any): ObjectExpression {
    if (ctx.subObject) {
      return this.visit(ctx.subObject);
    }
    if (ctx.productObject) {
      return this.visit(ctx.productObject);
    }
    return this.visit(ctx.namedObject);
  }

  namedObject(ctx: any): NamedObject {
    return {
      kind: "NamedObject",
      name: ctx.Identifier[0].image,
    };
  }

  productObject(ctx: any): ProductObject {
    const fields: Record<string, ObjectExpression> = {};
    for (let i = 0; i < ctx.Identifier.length; i++) {
      const name = ctx.Identifier[i].image;
      fields[name] = this.visit(ctx.objectExpression[i]);
    }
    return { kind: "ProductObject", fields };
  }

  subObject(ctx: any): SubObject {
    return {
      kind: "SubObject",
      base: this.visit(ctx.base),
      constraint: this.visit(ctx.constraint),
    };
  }

  instanceExpression(ctx: any): InstanceExpression {
    let expr = this.visit(ctx.base);
    if (ctx.GivenTok) {
      for (let i = 0; i < ctx.GivenTok.length; i++) {
        const givenInstance = this.visit(ctx.givenInstance[i]);
        expr = {
          kind: "GivenExpression",
          morphism: expr,
          instance: givenInstance,
        };
      }
    }
    if (ctx.property) {
      for (const prop of ctx.property) {
        expr = {
          kind: "PropertyAccess",
          object: expr,
          property: prop.image,
        };
      }
    }
    return expr;
  }

  instancePrimary(ctx: any): InstanceExpression {
    if (ctx.evalExpression) {
      return this.visit(ctx.evalExpression);
    }
    if (ctx.ifExpression) {
      return this.visit(ctx.ifExpression);
    }
    if (ctx.composition) {
      return this.visit(ctx.composition);
    }
    if (ctx.productInstance) {
      return this.visit(ctx.productInstance);
    }
    return this.visit(ctx.literalOrNamedInstance);
  }

  literalOrNamedInstance(ctx: any): any {
    if (ctx.Instruction) {
      return {
        kind: "Instruction",
        text: getInstructionValue(ctx.Instruction[0].image),
      };
    }
    if (ctx.StringLiteral) {
      return {
        kind: "StringLiteral",
        value: getStringValue(ctx.StringLiteral[0].image),
      };
    }
    if (ctx.NumberLiteral) {
      return {
        kind: "NumberLiteral",
        value: parseFloat(ctx.NumberLiteral[0].image),
      };
    }
    if (ctx.BoolLiteral) {
      return {
        kind: "BoolLiteral",
        value: ctx.BoolLiteral[0].image === "true",
      };
    }
    return {
      kind: "NamedInstance",
      name: ctx.Identifier[0].image,
    };
  }

  productInstance(ctx: any): ProductInstance {
    const fields: Record<string, InstanceExpression> = {};
    for (let i = 0; i < ctx.Identifier.length; i++) {
      const name = ctx.Identifier[i].image;
      fields[name] = this.visit(ctx.instanceExpression[i]);
    }
    return { kind: "ProductInstance", fields };
  }

  composition(ctx: any): Composition {
    const steps: Step[] = [];
    for (const localDecl of ctx.localDeclaration || []) {
      steps.push(this.visit(localDecl));
    }
    for (const expr of ctx.instanceExpression || []) {
      steps.push(this.visit(expr));
    }
    return { kind: "Composition", steps };
  }

  localDeclaration(ctx: any): Declaration {
    if (ctx.localObjectDeclaration) {
      return this.visit(ctx.localObjectDeclaration);
    }
    return this.visit(ctx.localInstanceDeclaration);
  }

  localObjectDeclaration(ctx: any): ObjectDeclaration {
    return {
      kind: "ObjectDeclaration",
      name: ctx.Identifier[0].image,
      object: this.visit(ctx.objectExpression),
    };
  }

  localInstanceDeclaration(ctx: any): InstanceDeclaration {
    return {
      kind: "InstanceDeclaration",
      name: ctx.Identifier[0].image,
      type: this.visit(ctx.objectExpression),
      instance: this.visit(ctx.instanceExpression),
    };
  }

  evalExpression(ctx: any): InstanceExpression {
    const morphism = this.visit(ctx.morphism);
    return {
      kind: "EvalExpression",
      morphism,
    };
  }

  ifExpression(ctx: any): IfExpression {
    return {
      kind: "IfExpression",
      condition: this.visit(ctx.condition),
      then: this.visit(ctx.then),
      else: ctx.else ? this.visit(ctx.else) : null,
    };
  }
}

export function parseToAst(text: string): SpexFile {
  const lexingResult = SpexLexer.tokenize(text);
  parserInstance.input = lexingResult.tokens;
  const cst = parserInstance.spexFile();

  if (parserInstance.errors.length > 0) {
    throw new Error(
      `Parsing errors: ${JSON.stringify(parserInstance.errors, null, 2)}`,
    );
  }

  const visitor = new SpexParserVisitor();
  return visitor.visit(cst);
}
