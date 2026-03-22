import type { ICstVisitor } from "chevrotain";
import type {
  SpexFile,
  Declaration,
  ObjectDeclaration,
  InstanceDeclaration,
  ObjectExpression,
  InstanceExpression,
} from "./ast.js";
import { SpexLexer } from "./lexer.js";
import { SpexParser } from "./parser.js";

const parserInstance = new SpexParser();
const BaseSpexVisitor = parserInstance.getBaseCstVisitorConstructor();

// Helper function to extract string value from SingleString token
const getStringValue = (rawValue: string): string => {
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
