export interface SpecFile {
  declarations: Declaration[];
}

export type Declaration = ObjectDecl | MorphismDecl | SubobjectDecl;

export interface ObjectDecl {
  kind: "ObjectDecl";
  name: string;
  fields: FieldDecl[];
}

export interface FieldDecl {
  name: string;
  type: TypeExpr;
}

export interface MorphismDecl {
  kind: "MorphismDecl";
  name: string;
  params: Param[];
  returnType: TypeExpr;
  body: Statement[];
}

export interface Param {
  name: string;
  type: TypeExpr;
}

export interface SubobjectDecl {
  kind: "SubobjectDecl";
  name: string;
  parent: string;
  predicates: string[];
}

export type TypeExpr = NamedType | FunctionType;

export interface NamedType {
  kind: "NamedType";
  name: string;
}

export interface FunctionType {
  kind: "FunctionType";
  params: TypeExpr[];
  returnType: TypeExpr;
}

export interface Statement {
  kind: "StringLiteral";
  value: string;
}
