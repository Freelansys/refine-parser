export interface SpecFile {
  declarations: Declaration[]
}

export type Declaration =
  | ObjectDecl
  | ProcessDecl
  | SubobjectDecl

export interface ObjectDecl {
  kind: "ObjectDecl"
  name: string
  fields: FieldDecl[]
}

export interface FieldDecl {
  name: string
  type: TypeExpr
}

export interface ProcessDecl {
  kind: "ProcessDecl"
  name: string
  type: TypeExpr
  body: Expr
}

export interface SubobjectDecl {
  kind: "SubobjectDecl"
  name: string
  parent: string
  predicate: Expr
}

export type TypeExpr =
  | NamedType
  | FunctionType

export interface NamedType {
  kind: "NamedType"
  name: string
}

export interface FunctionType {
  kind: "FunctionType"
  from: TypeExpr
  to: TypeExpr
}

export type Expr =
  | IdentifierExpr
  | LambdaExpr

export interface IdentifierExpr {
  kind: "Identifier"
  name: string
}

export interface LambdaExpr {
  kind: "Lambda"
  param: string
  body: Expr
}