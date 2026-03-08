export interface SpecFile {
  declarations: Declaration[];
}

export type Declaration =
  | ObjectDecl
  | ExponentialDecl
  | MorphismDecl
  | SubobjectDecl;

export interface ObjectDecl {
  kind: "ObjectDecl";
  name: string;
  fields: TypedBinding[];
}

export interface ExponentialDecl {
  kind: "ExponentialDecl";
  name: string;
  input: TypedBinding[];
  output: TypedBinding[];
}

export interface MorphismDecl {
  kind: "MorphismDecl";
  name: string;
  exponential: string;
  body: Statement[];
}

export interface SubobjectDecl {
  kind: "SubobjectDecl";
  name: string;
  parent: string;
  predicates: string[];
}

export interface TypedBinding {
  name: string;
  type: NamedType;
}

export interface NamedType {
  kind: "NamedType";
  name: string;
}

export interface Statement {
  kind: "StringLiteral";
  value: string;
}
