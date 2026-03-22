export type SpexFile = {
  kind: "SpexFile",
  declarations: Declaration[]
}

export type Declaration =
  | ObjectDeclaration
  | InstanceDeclaration

export type ObjectDeclaration = {
  kind: "ObjectDeclaration"
  name: string
  object: ObjectExpression
}

export type InstanceDeclaration = {
  kind: "instanceDeclaration"
  name: string
  type: ObjectExpression
  instance: InstanceExpression
}

export type ObjectExpression = 
  | NamedObject
  | ProductObject
  | ExponentialObject
  | SubObject

export type InstanceExpression = 
  | Literal
  | NamedInstance
  | ProductInstance
  | ExponentialInstance
  | EvalExpression

export type NamedObject = {
  kind: "NamedObject"
  name: string
}

export type ProductObject = {
  kind: "ProductObject"
  fields: Record<string, ObjectExpression>
}

export type ExponentialObject = {
  kind: "ExponentialObject"
  base: ObjectExpression
  exponent: ObjectExpression
}

export type SubObject = {
  kind: "SubObject"
  base: ObjectExpression
  constraint: InstanceExpression
}

export type Literal =
  | StringLiteral
  | NumberLiteral
  | BoolLiteral
  | UnitLiteral

export type NamedInstance = {
  kind: "NamedInstance"
  name: string
}

export type ProductInstance = {
  kind: "ProductInstance"
  fields: Record<string, InstanceExpression>
}

export type ExponentialInstance =
  | Instruction
  | Composition
  | IfExpression
  | GivenExpression

export type EvalExpression = {
  kind: "EvalExpression"
  morphism: InstanceExpression
}

export type StringLiteral = {
  kind: "StringLiteral"
  value: string
}

export type NumberLiteral = {
  kind: "NumberLiteral"
  value: number
}

export type BoolLiteral = {
  kind: "BoolLiteral"
  value: boolean
}

export type UnitLiteral = {
  kind: "UnitLiteral"
  value: {}
}

export type Instruction = {
  kind: "Instruction"
  text: string
}

export type Composition = {
  kind: "Composition"
  steps: Step[]
}

export type IfExpression = {
  kind: "IfExpression"
  condition: InstanceExpression
  then: InstanceExpression
  else: InstanceExpression | null
}

export type GivenExpression = {
  kind: "GivenExpression"
  morphism: InstanceExpression
  instance: InstanceExpression
}

export type Step =
  | InstanceExpression
  | Declaration