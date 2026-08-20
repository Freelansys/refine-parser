import type { ObjectExpression } from './ast.js'

export type Constant =
  | { kind: 'StringConstant'; value: string }
  | { kind: 'NumberConstant'; value: string }
  | { kind: 'BoolConstant'; value: boolean }
  | { kind: 'ProductConstant'; fields: Record<string, Constant> }
  | { kind: 'ExponentialConstant'; base: Constant; exponent: Constant }

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
      const base = constantOf(expr.base)
      const exponent = constantOf(expr.exponent)
      if (base === null || exponent === null) {
        return null
      }
      return { kind: 'ExponentialConstant', base, exponent }
    }
    default:
      return null
  }
}
