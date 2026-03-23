import { CstParser } from 'chevrotain'
import {
  allTokens,
  ObjectTok,
  SelectTok,
  WhereTok,
  ArrowTok,
  LCurly,
  RCurly,
  LBracket,
  RBracket,
  LParen,
  RParen,
  Colon,
  Comma,
  Dot,
  Equals,
  Identifier,
  StringLiteral,
  NumberLiteral,
  BoolLiteral,
  Instruction,
  LetTok,
  GivenTok,
  IfTok,
  ThenTok,
  ElseTok,
  EvalTok,
} from './lexer.js'

export class SpexParser extends CstParser {
  constructor() {
    super(allTokens)
    this.performSelfAnalysis()
  }

  public spexFile = this.RULE('spexFile', () => {
    this.MANY(() => {
      this.SUBRULE(this.declaration)
    })
  })

  private declaration = this.RULE('declaration', () => {
    this.OR([
      {
        GATE: this.BACKTRACK(this.objectDeclaration),
        ALT: () => this.SUBRULE(this.objectDeclaration),
      },
      {
        GATE: this.BACKTRACK(this.instanceDeclaration),
        ALT: () => this.SUBRULE(this.instanceDeclaration),
      },
    ])
  })

  private objectDeclaration = this.RULE('objectDeclaration', () => {
    this.CONSUME(ObjectTok)
    this.CONSUME(Identifier)
    this.CONSUME(Equals)
    this.SUBRULE(this.objectExpression)
  })

  private instanceDeclaration = this.RULE('instanceDeclaration', () => {
    this.CONSUME(LetTok)
    this.CONSUME(Identifier)
    this.CONSUME(Colon)
    this.SUBRULE(this.objectExpression)
    this.CONSUME(Equals)
    this.SUBRULE(this.instanceExpression)
  })

  private objectExpression = this.RULE('objectExpression', () => {
    this.SUBRULE(this.objectOperand, { LABEL: 'base' })
    this.OPTION(() => {
      this.CONSUME(ArrowTok)
      this.SUBRULE2(this.objectExpression, { LABEL: 'exponent' })
    })
  })

  private objectOperand = this.RULE('objectOperand', () => {
    this.OR([
      {
        GATE: this.BACKTRACK(this.subObject),
        ALT: () => this.SUBRULE(this.subObject),
      },
      {
        GATE: this.BACKTRACK(this.productObject),
        ALT: () => this.SUBRULE(this.productObject),
      },
      {
        ALT: () => this.SUBRULE(this.namedObject),
      },
    ])
  })

  private namedObject = this.RULE('namedObject', () => {
    this.CONSUME(Identifier)
  })

  private productObject = this.RULE('productObject', () => {
    this.CONSUME(LParen)
    this.MANY(() => {
      this.CONSUME(Identifier)
      this.CONSUME(Colon)
      this.SUBRULE(this.objectExpression)
      this.OPTION(() => this.CONSUME(Comma))
    })
    this.CONSUME(RParen)
  })

  private subObject = this.RULE('subObject', () => {
    this.CONSUME(SelectTok)
    this.SUBRULE(this.objectExpression, { LABEL: 'base' })
    this.CONSUME(WhereTok)
    this.SUBRULE2(this.instanceExpression, { LABEL: 'constraint' })
  })

  private instanceExpression = this.RULE('instanceExpression', () => {
    this.SUBRULE(this.instancePrimary, { LABEL: 'base' })
    this.MANY(() => {
      this.CONSUME(Dot)
      this.CONSUME(Identifier, { LABEL: 'property' })
    })
    this.MANY2(() => {
      this.CONSUME(GivenTok)
      this.SUBRULE(this.instanceExpression, { LABEL: 'givenInstance' })
    })
  })

  private instancePrimary = this.RULE('instancePrimary', () => {
    this.OR([
      {
        GATE: this.BACKTRACK(this.evalExpression),
        ALT: () => this.SUBRULE(this.evalExpression),
      },
      {
        GATE: this.BACKTRACK(this.ifExpression),
        ALT: () => this.SUBRULE(this.ifExpression),
      },
      {
        GATE: this.BACKTRACK(this.composition),
        ALT: () => this.SUBRULE(this.composition),
      },
      {
        GATE: this.BACKTRACK(this.productInstance),
        ALT: () => this.SUBRULE(this.productInstance),
      },
      {
        ALT: () => this.SUBRULE(this.literalOrNamedInstance),
      },
    ])
  })

  private literalOrNamedInstance = this.RULE('literalOrNamedInstance', () => {
    this.OR([
      { ALT: () => this.CONSUME(Instruction) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(BoolLiteral) },
      { ALT: () => this.CONSUME(Identifier) },
    ])
  })

  private productInstance = this.RULE('productInstance', () => {
    this.CONSUME(LCurly)
    this.MANY(() => {
      this.CONSUME(Identifier)
      this.CONSUME(Colon)
      this.SUBRULE(this.instanceExpression)
      this.OPTION(() => this.CONSUME(Comma))
    })
    this.CONSUME(RCurly)
  })

  private composition = this.RULE('composition', () => {
    this.CONSUME(LBracket)
    this.MANY(() => {
      this.OR([
        {
          GATE: this.BACKTRACK(this.localDeclaration),
          ALT: () => this.SUBRULE(this.localDeclaration),
        },
        {
          ALT: () => this.SUBRULE(this.instanceExpression),
        },
      ])
      this.OPTION(() => this.CONSUME(Comma))
    })
    this.CONSUME(RBracket)
  })

  private localDeclaration = this.RULE('localDeclaration', () => {
    this.OR([
      {
        GATE: this.BACKTRACK(this.localObjectDeclaration),
        ALT: () => this.SUBRULE(this.localObjectDeclaration),
      },
      {
        GATE: this.BACKTRACK(this.localInstanceDeclaration),
        ALT: () => this.SUBRULE(this.localInstanceDeclaration),
      },
    ])
  })

  private localObjectDeclaration = this.RULE('localObjectDeclaration', () => {
    this.CONSUME(ObjectTok)
    this.CONSUME(Identifier)
    this.CONSUME(Equals)
    this.SUBRULE(this.objectExpression)
  })

  private localInstanceDeclaration = this.RULE('localInstanceDeclaration', () => {
    this.CONSUME(LetTok)
    this.CONSUME(Identifier)
    this.CONSUME(Colon)
    this.SUBRULE(this.objectExpression)
    this.CONSUME(Equals)
    this.SUBRULE(this.instanceExpression)
  })

  private evalExpression = this.RULE('evalExpression', () => {
    this.CONSUME(EvalTok)
    this.SUBRULE(this.instanceExpression, { LABEL: 'morphism' })
  })

  private ifExpression = this.RULE('ifExpression', () => {
    this.CONSUME(IfTok)
    this.SUBRULE(this.instanceExpression, { LABEL: 'condition' })
    this.CONSUME(ThenTok)
    this.SUBRULE2(this.instanceExpression, { LABEL: 'then' })
    this.OPTION(() => {
      this.CONSUME(ElseTok)
      this.SUBRULE3(this.instanceExpression, { LABEL: 'else' })
    })
    this.OPTION2(() => this.CONSUME(Comma))
  })
}
