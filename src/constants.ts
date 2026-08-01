import type { ObjectExpression } from './ast.js'

export type Constant =
  | { kind: 'StringConstant'; value: string }
  | { kind: 'NumberConstant'; value: string }
  | { kind: 'BoolConstant'; value: boolean }
  | { kind: 'ProductConstant'; fields: Record<string, Constant> }
  | { kind: 'FunctionConstant'; domain: Constant; codomain: Constant }

export function constantOf(expr: ObjectExpression): Constant | null {
  switch (expr.kind) {
    case 'StringLiteralObject':
      return { kind: 'StringConstant', value: expr.value }
    case 'NumberLiteralObject':
      return { kind: 'NumberConstant', value: expr.value }
    case 'BoolLiteralObject':
      return { kind: 'BoolConstant', value: expr.value }
    case 'ProductObject': {
      const fields: Record<string, Constant> = {}
      for (const [name, field] of Object.entries(expr.fields)) {
        const constant = constantOf(field)
        if (constant === null) {
          return null
        }
        fields[name] = constant
      }
      return { kind: 'ProductConstant', fields }
    }
    case 'ExponentialObject': {
      const domain = constantOf(expr.exponent)
      const codomain = constantOf(expr.base)
      if (domain === null || codomain === null) {
        return null
      }
      return { kind: 'FunctionConstant', domain, codomain }
    }
    default:
      return null
  }
}
