export interface SpecFile {
  declarations: Declaration[];
}

export type Declaration =
  | ObjectDecl
  | ExponentialDecl
  | MorphismDecl
  | ConstantDecl
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

export interface ConstantDecl {
  kind: "ConstantDecl";
  name: string;
  type: NamedType;
  bindings: ConstantBinding[];
}

export interface ConstantBinding {
  name: string;
  value: ConstantValue;
}

export type ConstantValue =
  | { kind: "StringValue"; value: string }
  | { kind: "NumberValue"; value: number }
  | { kind: "IdentifierValue"; value: string };

export interface SubobjectDecl {
  kind: "SubobjectDecl";
  name: string;
  parent: string;
  predicates: PredicateExpression;
}

export type PredicateExpression =
  | { kind: "Predicate"; value: string }
  | { kind: "Conjunction"; value: PredicateExpression[] }
  | { kind: "Disjunction"; value: PredicateExpression[] };

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
