export { SpexLexer } from './lexer.js'
export { SpexParser } from './parser.js'
export { SpexParserVisitor, parseToAst } from './visitor.js'
export type {
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
  PropertyAccess,
  Literal,
  NamedInstance,
  StringLiteral,
  NumberLiteral,
  BoolLiteral,
  UnitLiteral,
  Instruction,
  Composition,
  EvalExpression,
  GivenExpression,
  IfExpression,
  Step,
} from './ast.js'
