import type { ICstVisitor } from 'chevrotain'
import type {
  SpexFile,
  Declaration,
  ObjectDeclaration,
  ImportDeclaration,
  ExportDeclaration,
  GenerateDeclaration,
  PackageDeclaration,
  ObjectExpression,
  NamedObject,
  ProductObject,
  SubObject,
  ArrayObject,
  Constraint,
  ConstraintPart,
} from './ast.js'
import { SpexLexer } from './lexer.js'
import { SpexParser } from './parser.js'

const parserInstance = new SpexParser()
const BaseSpexVisitor = parserInstance.getBaseCstVisitorConstructor()

export const REFERENCE_PATTERN = /@([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)*)/g

export function parseConstraint(raw: string): Constraint {
  const parts: ConstraintPart[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = REFERENCE_PATTERN.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'ConstraintText', text: raw.slice(lastIndex, match.index) })
    }
    parts.push({ kind: 'ConstraintReference', name: match[1]! })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < raw.length) {
    parts.push({ kind: 'ConstraintText', text: raw.slice(lastIndex) })
  }

  return { raw, parts }
}

export class SpexParserVisitor extends BaseSpexVisitor implements ICstVisitor<any, any> {
  constructor() {
    super()
    this.validateVisitor()
  }

  spexFile(ctx: any): SpexFile {
    const declarations = ctx.declaration.map((decl: any) => this.visit(decl))
    return { kind: 'SpexFile', declarations }
  }

  declaration(ctx: any): Declaration {
    if (ctx.packageDeclaration) {
      return this.visit(ctx.packageDeclaration)
    }
    if (ctx.objectDeclaration) {
      return this.visit(ctx.objectDeclaration)
    }
    if (ctx.importDeclaration) {
      return this.visit(ctx.importDeclaration)
    }
    if (ctx.exportDeclaration) {
      return this.visit(ctx.exportDeclaration)
    }
    return this.visit(ctx.generateDeclaration)
  }

  objectDeclaration(ctx: any): ObjectDeclaration {
    return {
      kind: 'ObjectDeclaration',
      name: ctx.Identifier[0].image,
      object: this.visit(ctx.objectExpression),
    }
  }

  objectExpression(ctx: any): ObjectExpression {
    if (ctx.base) {
      const exponent = this.visit(ctx.base)
      if (ctx.exponent) {
        return {
          kind: 'ExponentialObject',
          base: this.visit(ctx.exponent),
          exponent,
        }
      }
      return exponent
    }
    throw new Error('Invalid object expression')
  }

  objectOperand(ctx: any): ObjectExpression {
    let expr: ObjectExpression
    if (ctx.subObject) {
      expr = this.visit(ctx.subObject)
    } else if (ctx.productObject) {
      expr = this.visit(ctx.productObject)
    } else {
      expr = this.visit(ctx.namedObject)
    }
    if (ctx.LBracket) {
      for (let i = 0; i < ctx.LBracket.length; i++) {
        expr = { kind: 'ArrayObject', base: expr } as ArrayObject
      }
    }
    return expr
  }

  namedObject(ctx: any): NamedObject {
    let parts: string[]
    if (ctx.StringTok) {
      parts = [ctx.StringTok[0].image, ...(ctx.Identifier ?? []).map((id: any) => id.image)]
    } else if (ctx.NumberTok) {
      parts = [ctx.NumberTok[0].image, ...(ctx.Identifier ?? []).map((id: any) => id.image)]
    } else if (ctx.BoolTok) {
      parts = [ctx.BoolTok[0].image, ...(ctx.Identifier ?? []).map((id: any) => id.image)]
    } else if (ctx.UnitTok) {
      parts = [ctx.UnitTok[0].image, ...(ctx.Identifier ?? []).map((id: any) => id.image)]
    } else {
      parts = ctx.Identifier.map((id: any) => id.image)
    }
    return {
      kind: 'NamedObject',
      name: parts.join('.'),
    }
  }

  productObject(ctx: any): ProductObject {
    const fields: Record<string, ObjectExpression> = {}
    for (let i = 0; i < ctx.Identifier.length; i++) {
      const name = ctx.Identifier[i].image
      fields[name] = this.visit(ctx.objectExpression[i])
    }
    return { kind: 'ProductObject', fields }
  }

  subObject(ctx: any): SubObject {
    const rawText: string = ctx.SelectBlock[0].image
    const rawConstraint = rawText.slice(1, -1).trim()
    return {
      kind: 'SubObject',
      base: this.visit(ctx.base),
      constraint: parseConstraint(rawConstraint),
    }
  }

  importDeclaration(ctx: any): ImportDeclaration {
    if (ctx.namedImport) {
      return this.visit(ctx.namedImport)
    }
    return this.visit(ctx.moduleImport)
  }

  namedImport(ctx: any): ImportDeclaration {
    const name = ctx.Identifier[0].image
    const source = ctx.PathLiteral[0].image.slice(1, -1)
    const alias = ctx.Identifier[1] ? ctx.Identifier[1].image : null
    return {
      kind: 'ImportDeclaration',
      name,
      source,
      alias,
    }
  }

  moduleImport(ctx: any): ImportDeclaration {
    const source = ctx.PathLiteral[0].image.slice(1, -1)
    const alias = ctx.Identifier[0].image
    return {
      kind: 'ImportDeclaration',
      name: null,
      source,
      alias,
    }
  }

  exportDeclaration(ctx: any): ExportDeclaration {
    return {
      kind: 'ExportDeclaration',
      name: ctx.Identifier[0].image,
    }
  }

  packageDeclaration(ctx: any): PackageDeclaration {
    const packageType = ctx.ExecutableTok ? ('EXECUTABLE' as const) : ('MODULE' as const)
    return {
      kind: 'PackageDeclaration',
      packageType,
      name: ctx.Identifier[0].image,
      objectName: this.visit(ctx.objectExpression),
    }
  }

  generateDeclaration(ctx: any): GenerateDeclaration {
    return {
      kind: 'GenerateDeclaration',
      name: ctx.Identifier[0].image,
    }
  }
}

export function parseToAst(text: string): SpexFile {
  const lexingResult = SpexLexer.tokenize(text)

  if (lexingResult.errors.length > 0) {
    const details = lexingResult.errors
      .map((e) => {
        const where =
          e.line !== undefined && e.column !== undefined ? ` (line ${e.line}, column ${e.column})` : ''
        return e.message + where
      })
      .join('; ')
    throw new Error(`Lexing errors: ${details}`)
  }

  parserInstance.input = lexingResult.tokens
  const cst = parserInstance.spexFile()

  if (parserInstance.errors.length > 0) {
    throw new Error(`Parsing errors: ${JSON.stringify(parserInstance.errors, null, 2)}`)
  }

  const visitor = new SpexParserVisitor()
  return visitor.visit(cst)
}
