export type SpexFile = {
  kind: 'SpexFile'
  declarations: Declaration[]
}

export type Declaration =
  | ObjectDeclaration
  | ImportDeclaration
  | ExportDeclaration
  | GenerateDeclaration
  | PackageDeclaration

export type PackageKind = 'EXECUTABLE' | 'MODULE'

export type PackageDeclaration = {
  kind: 'PackageDeclaration'
  packageType: PackageKind
  name: string
  objectName: ObjectExpression
}

export type ObjectDeclaration = {
  kind: 'ObjectDeclaration'
  name: string
  object: ObjectExpression
}

export type ImportDeclaration = {
  kind: 'ImportDeclaration'
  name: string | null
  source: string
  alias: string | null
}

export type ExportDeclaration = {
  kind: 'ExportDeclaration'
  name: string
}

export type GenerateDeclaration = {
  kind: 'GenerateDeclaration'
  name: string
}

export type ObjectExpression =
  | NamedObject
  | ProductObject
  | ExponentialObject
  | SubObject
  | ArrayObject
  | EnumObject

export type NamedObject = {
  kind: 'NamedObject'
  name: string
}

export type ProductObject = {
  kind: 'ProductObject'
  fields: Record<string, ObjectExpression>
}

export type ExponentialObject = {
  kind: 'ExponentialObject'
  base: ObjectExpression
  exponent: ObjectExpression
}

export type ConstraintReference = {
  kind: 'ConstraintReference'
  name: string
}

export type ConstraintText = {
  kind: 'ConstraintText'
  text: string
}

export type ConstraintPart = ConstraintReference | ConstraintText

export type Constraint = {
  raw: string
  parts: ConstraintPart[]
}

export type SubObject = {
  kind: 'SubObject'
  base: ObjectExpression
  constraint: Constraint
}

export type ArrayObject = {
  kind: 'ArrayObject'
  base: ObjectExpression
}

export type EnumObject = {
  kind: 'EnumObject'
  values: string[]
}
