import { describe, it, expect } from "vitest";
import { parseToAst } from "../src/visitor.js";
import type { ObjectDeclaration, InstanceDeclaration } from "../src/ast.js";

describe("SpecParserVisitor", () => {
  describe("object declaration", () => {
    it("should convert named object declaration to AST", () => {
      const testCase = "object MyObject = Number";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyObject",
        object: {
          kind: "NamedObject",
          name: "Number",
        },
      });
    });

    it("should convert product object declaration to AST", () => {
      const testCase = "object MyProduct = (n: Number, s: String)";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyProduct",
        object: {
          kind: "ProductObject",
          fields: {
            n: { kind: "NamedObject", name: "Number" },
            s: { kind: "NamedObject", name: "String" },
          },
        },
      });
    });

    it("should convert product object declaration with trailing commas to AST", () => {
      const testCase = "object MyProduct = (n: Number, s: String,)";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyProduct",
        object: {
          kind: "ProductObject",
          fields: {
            n: { kind: "NamedObject", name: "Number" },
            s: { kind: "NamedObject", name: "String" },
          },
        },
      });
    });

    it("should convert product object declaration with exponential objects to AST", () => {
      const testCase = "object MyProduct = (f: Number -> String, n: Number)";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyProduct",
        object: {
          kind: "ProductObject",
          fields: {
            f: {
              kind: "ExponentialObject",
              exponent: { kind: "NamedObject", name: "Number" },
              base: { kind: "NamedObject", name: "String" },
            },
            n: { kind: "NamedObject", name: "Number" },
          },
        },
      });
    });

    it("should convert product object declaration with subobjects to AST", () => {
      const testCase = `object MyProduct = (p: select Number where "value is positive", n: Number)`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyProduct",
        object: {
          kind: "ProductObject",
          fields: {
            p: {
              kind: "SubObject",
              base: { kind: "NamedObject", name: "Number" },
              constraint: { kind: "Instruction", text: "value is positive" },
            },
            n: { kind: "NamedObject", name: "Number" },
          },
        },
      });
    });

    it("should convert exponential object declaration with named object to AST", () => {
      const testCase = "object MyExponential = Number -> Unit";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyExponential",
        object: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "Number" },
          base: { kind: "NamedObject", name: "Unit" },
        },
      });
    });

    it("should convert exponential object declaration with product objects to AST", () => {
      const testCase = "object MyExponential = (n: Number) -> (s: String)";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyExponential",
        object: {
          kind: "ExponentialObject",
          exponent: {
            kind: "ProductObject",
            fields: {
              n: { kind: "NamedObject", name: "Number" },
            },
          },
          base: {
            kind: "ProductObject",
            fields: {
              s: { kind: "NamedObject", name: "String" },
            },
          },
        },
      });
    });

    it("should convert exponential object declaration with exponential objects to AST", () => {
      const testCase =
        "object MyExponential = (f: Number -> String, n: Number) -> String";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyExponential",
        object: {
          kind: "ExponentialObject",
          exponent: {
            kind: "ProductObject",
            fields: {
              f: {
                kind: "ExponentialObject",
                exponent: { kind: "NamedObject", name: "Number" },
                base: { kind: "NamedObject", name: "String" },
              },
              n: { kind: "NamedObject", name: "Number" },
            },
          },
          base: { kind: "NamedObject", name: "String" },
        },
      });
    });

    it("should convert exponential object declaration with subobjects to AST", () => {
      const testCase = `object MyExponential = select Number where "value is positive" -> select Number where "value is positive"`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MyExponential",
        object: {
          kind: "ExponentialObject",
          exponent: {
            kind: "SubObject",
            base: { kind: "NamedObject", name: "Number" },
            constraint: { kind: "Instruction", text: "value is positive" },
          },
          base: {
            kind: "SubObject",
            base: { kind: "NamedObject", name: "Number" },
            constraint: { kind: "Instruction", text: "value is positive" },
          },
        },
      });
    });

    it("should convert subobject declaration with named objects to AST", () => {
      const testCase = `object PositiveNumber = select Number where isPositive`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "PositiveNumber",
        object: {
          kind: "SubObject",
          base: { kind: "NamedObject", name: "Number" },
          constraint: { kind: "NamedInstance", name: "isPositive" },
        },
      });
    });

    it("should convert subobject declaration with named objects and instruction condition to AST", () => {
      const testCase = `object PositiveNumber = select Number where "the number is positive"`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "PositiveNumber",
        object: {
          kind: "SubObject",
          base: { kind: "NamedObject", name: "Number" },
          constraint: { kind: "Instruction", text: "the number is positive" },
        },
      });
    });

    it("should convert subobject declaration with named objects and composition condition to AST", () => {
      const testCase = `object PositiveNumber = select Number where [
        let isPositive: Bool = "the number is positive",
        "return true if both \${isPositive} and odd"
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "PositiveNumber",
        object: {
          kind: "SubObject",
          base: { kind: "NamedObject", name: "Number" },
          constraint: {
            kind: "Composition",
            steps: [
              {
                kind: "InstanceDeclaration",
                name: "isPositive",
                type: { kind: "NamedObject", name: "Bool" },
                instance: {
                  kind: "Instruction",
                  text: "the number is positive",
                },
              },
              {
                kind: "Instruction",
                text: "return true if both ${isPositive} and odd",
              },
            ],
          },
        },
      });
    });

    it("should convert subobject declaration with product objects to AST", () => {
      const testCase = `object MySubobject = select (n: Number, s: String) where "\${n} is positive"`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MySubobject",
        object: {
          kind: "SubObject",
          base: {
            kind: "ProductObject",
            fields: {
              n: { kind: "NamedObject", name: "Number" },
              s: { kind: "NamedObject", name: "String" },
            },
          },
          constraint: { kind: "Instruction", text: "${n} is positive" },
        },
      });
    });

    it("should convert subobject declaration with exponential objects to AST", () => {
      const testCase = `object MySubobject = select (n: Number, s: String) -> Bool where "logs the given input"`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MySubobject",
        object: {
          kind: "SubObject",
          base: {
            kind: "ExponentialObject",
            exponent: {
              kind: "ProductObject",
              fields: {
                n: { kind: "NamedObject", name: "Number" },
                s: { kind: "NamedObject", name: "String" },
              },
            },
            base: { kind: "NamedObject", name: "Bool" },
          },
          constraint: { kind: "Instruction", text: "logs the given input" },
        },
      });
    });

    it("should convert subobject declaration with subobjects to AST", () => {
      const testCase = `object MySubobject = select select Number where "value is positive" where "value is odd"`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as ObjectDeclaration;
      expect(decl).toEqual({
        kind: "ObjectDeclaration",
        name: "MySubobject",
        object: {
          kind: "SubObject",
          base: {
            kind: "SubObject",
            base: { kind: "NamedObject", name: "Number" },
            constraint: { kind: "Instruction", text: "value is positive" },
          },
          constraint: { kind: "Instruction", text: "value is odd" },
        },
      });
    });
  });

  describe("instance declaration", () => {
    it("should convert literal declaration to AST", () => {
      const testCase = "let test: Number = 1";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: { kind: "NamedObject", name: "Number" },
        instance: { kind: "NumberLiteral", value: 1 },
      });
    });

    it("should convert eval expression declaration to AST", () => {
      const testCase = `let test: Number = eval "return 2"`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: { kind: "NamedObject", name: "Number" },
        instance: {
          kind: "EvalExpression",
          morphism: { kind: "Instruction", text: "return 2" },
        },
      });
    });

    it("should convert eval with given expression declaration to AST", () => {
      const testCase = `let test: Number = eval "return \${a}" given { a: 2 }`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: { kind: "NamedObject", name: "Number" },
        instance: {
          kind: "EvalExpression",
          morphism: {
            kind: "GivenExpression",
            morphism: { kind: "Instruction", text: "return ${a}" },
            instance: {
              kind: "ProductInstance",
              fields: {
                a: { kind: "NumberLiteral", value: 2 },
              },
            },
          },
        },
      });
    });

    it("should convert named object instance declaration to AST", () => {
      const testCase = "let test: Number = last";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: { kind: "NamedObject", name: "Number" },
        instance: { kind: "NamedInstance", name: "last" },
      });
    });

    it("should convert product object instance declaration to AST", () => {
      const testCase =
        "let test: (s: String, n: Number) = { s: 'hello', n: 1 }";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ProductObject",
          fields: {
            s: { kind: "NamedObject", name: "String" },
            n: { kind: "NamedObject", name: "Number" },
          },
        },
        instance: {
          kind: "ProductInstance",
          fields: {
            s: { kind: "StringLiteral", value: "hello" },
            n: { kind: "NumberLiteral", value: 1 },
          },
        },
      });
    });

    it("should convert product object instance declaration with trailing commas to AST", () => {
      const testCase =
        "let test: (s: String, n: Number) = { s: 'hello', n: 1, }";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ProductObject",
          fields: {
            s: { kind: "NamedObject", name: "String" },
            n: { kind: "NamedObject", name: "Number" },
          },
        },
        instance: {
          kind: "ProductInstance",
          fields: {
            s: { kind: "StringLiteral", value: "hello" },
            n: { kind: "NumberLiteral", value: 1 },
          },
        },
      });
    });

    it("should convert exponential object instance with named instance declaration to AST", () => {
      const testCase = `let test: String -> Number = countAs`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: { kind: "NamedInstance", name: "countAs" },
      });
    });

    it("should convert exponential object named instance declaration to AST", () => {
      const testCase = `let test: String -> Number = countAs given { mul: Number }`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "GivenExpression",
          morphism: { kind: "NamedInstance", name: "countAs" },
          instance: {
            kind: "ProductInstance",
            fields: {
              mul: { kind: "NamedInstance", name: "Number" },
            },
          },
        },
      });
    });

    it("should convert exponential object instance instruction declaration to AST", () => {
      const testCase = `let test: String -> Number = "count 'a's in the string"`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: { kind: "Instruction", text: "count 'a's in the string" },
      });
    });

    it("should convert exponential object instance composition declaration with single instruction to AST", () => {
      const testCase = `let test: String -> Number = [
        "count 'a's in the string and return it"
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "Instruction",
              text: "count 'a's in the string and return it",
            },
          ],
        },
      });
    });

    it("should convert exponential object instance composition declaration with multiple instruction to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "InstanceDeclaration",
              name: "count",
              type: { kind: "NamedObject", name: "Number" },
              instance: {
                kind: "EvalExpression",
                morphism: {
                  kind: "Instruction",
                  text: "count 'a's in the string",
                },
              },
            },
            { kind: "Instruction", text: "return ${count}*2" },
          ],
        },
      });
    });

    it("should convert exponential object instance composition declaration with named instances to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        doThis,
        doThat given { s: String },
        "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "InstanceDeclaration",
              name: "count",
              type: { kind: "NamedObject", name: "Number" },
              instance: {
                kind: "EvalExpression",
                morphism: {
                  kind: "Instruction",
                  text: "count 'a's in the string",
                },
              },
            },
            { kind: "NamedInstance", name: "doThis" },
            {
              kind: "GivenExpression",
              morphism: { kind: "NamedInstance", name: "doThat" },
              instance: {
                kind: "ProductInstance",
                fields: {
                  s: { kind: "NamedInstance", name: "String" },
                },
              },
            },
            { kind: "Instruction", text: "return ${count}*2" },
          ],
        },
      });
    });

    it("should convert exponential object instance composition declaration with trailing commas to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        "return \${count}*2",
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "InstanceDeclaration",
              name: "count",
              type: { kind: "NamedObject", name: "Number" },
              instance: {
                kind: "EvalExpression",
                morphism: {
                  kind: "Instruction",
                  text: "count 'a's in the string",
                },
              },
            },
            { kind: "Instruction", text: "return ${count}*2" },
          ],
        },
      });
    });

    it("should convert exponential object instance composition declaration with if expression to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "InstanceDeclaration",
              name: "count",
              type: { kind: "NamedObject", name: "Number" },
              instance: {
                kind: "EvalExpression",
                morphism: {
                  kind: "Instruction",
                  text: "count 'a's in the string",
                },
              },
            },
            {
              kind: "IfExpression",
              condition: { kind: "BoolLiteral", value: true },
              then: { kind: "Instruction", text: "return ${count}*2" },
              else: null,
            },
          ],
        },
      });
    });

    it("should convert exponential object instance composition declaration with if and eval expression to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if eval "return true" then "return \${count}*2"
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "InstanceDeclaration",
              name: "count",
              type: { kind: "NamedObject", name: "Number" },
              instance: {
                kind: "EvalExpression",
                morphism: {
                  kind: "Instruction",
                  text: "count 'a's in the string",
                },
              },
            },
            {
              kind: "IfExpression",
              condition: {
                kind: "EvalExpression",
                morphism: { kind: "Instruction", text: "return true" },
              },
              then: { kind: "Instruction", text: "return ${count}*2" },
              else: null,
            },
          ],
        },
      });
    });

    it("should convert exponential object instance composition declaration with if else expression to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then "return \${count}*2" else "return -1"
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "InstanceDeclaration",
              name: "count",
              type: { kind: "NamedObject", name: "Number" },
              instance: {
                kind: "EvalExpression",
                morphism: {
                  kind: "Instruction",
                  text: "count 'a's in the string",
                },
              },
            },
            {
              kind: "IfExpression",
              condition: { kind: "BoolLiteral", value: true },
              then: { kind: "Instruction", text: "return ${count}*2" },
              else: { kind: "Instruction", text: "return -1" },
            },
          ],
        },
      });
    });

    it("should convert exponential object instance nested composition declaration with if else expression to AST", () => {
      const testCase = `let test: String -> Number = [
        let count: Number = eval "count 'a's in the string",
        if true then [
          "do something",
          "return \${count}*2"
        ] else [
          "do something else",
          "return -1",
        ]
      ]`;
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: {
          kind: "ExponentialObject",
          exponent: { kind: "NamedObject", name: "String" },
          base: { kind: "NamedObject", name: "Number" },
        },
        instance: {
          kind: "Composition",
          steps: [
            {
              kind: "InstanceDeclaration",
              name: "count",
              type: { kind: "NamedObject", name: "Number" },
              instance: {
                kind: "EvalExpression",
                morphism: {
                  kind: "Instruction",
                  text: "count 'a's in the string",
                },
              },
            },
            {
              kind: "IfExpression",
              condition: { kind: "BoolLiteral", value: true },
              then: {
                kind: "Composition",
                steps: [
                  { kind: "Instruction", text: "do something" },
                  { kind: "Instruction", text: "return ${count}*2" },
                ],
              },
              else: {
                kind: "Composition",
                steps: [
                  { kind: "Instruction", text: "do something else" },
                  { kind: "Instruction", text: "return -1" },
                ],
              },
            },
          ],
        },
      });
    });
  });

  describe("property access", () => {
    it("should convert property access to AST", () => {
      const testCase = "let test: String = input.arg1";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl).toEqual({
        kind: "InstanceDeclaration",
        name: "test",
        type: { kind: "NamedObject", name: "String" },
        instance: {
          kind: "PropertyAccess",
          object: { kind: "NamedInstance", name: "input" },
          property: "arg1",
        },
      });
    });

    it("should convert nested property access to AST", () => {
      const testCase = "let test: String = foo.bar.baz";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "PropertyAccess",
        object: {
          kind: "PropertyAccess",
          object: { kind: "NamedInstance", name: "foo" },
          property: "bar",
        },
        property: "baz",
      });
    });

    it("should convert given with named instance to AST", () => {
      const testCase = "let test: String -> Number = countAs given db";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "countAs" },
        instance: { kind: "NamedInstance", name: "db" },
      });
    });

    it("should convert given with product instance to AST", () => {
      const testCase =
        "let test: String -> Number = countAs given { db: Database }";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "countAs" },
        instance: {
          kind: "ProductInstance",
          fields: {
            db: { kind: "NamedInstance", name: "Database" },
          },
        },
      });
    });

    it("should convert given with string literal to AST", () => {
      const testCase = 'let test: String -> Number = f given "the input"';
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "f" },
        instance: { kind: "Instruction", text: "the input" },
      });
    });

    it("should convert given with property access to AST", () => {
      const testCase = "let test: String -> Number = f given config.db";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "f" },
        instance: {
          kind: "PropertyAccess",
          object: { kind: "NamedInstance", name: "config" },
          property: "db",
        },
      });
    });

    it("should convert given with eval expression to AST", () => {
      const testCase = 'let test: String -> Number = f given eval "get value"';
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "f" },
        instance: {
          kind: "EvalExpression",
          morphism: { kind: "Instruction", text: "get value" },
        },
      });
    });

    it("should convert given with if expression to AST", () => {
      const testCase =
        "let test: String -> Number = f given if cond then a else b";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "f" },
        instance: {
          kind: "IfExpression",
          condition: { kind: "NamedInstance", name: "cond" },
          then: { kind: "NamedInstance", name: "a" },
          else: { kind: "NamedInstance", name: "b" },
        },
      });
    });

    it("should convert given with composition to AST", () => {
      const testCase =
        'let test: String -> Number = f given [ "step 1", "step 2" ]';
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "f" },
        instance: {
          kind: "Composition",
          steps: [
            { kind: "Instruction", text: "step 1" },
            { kind: "Instruction", text: "step 2" },
          ],
        },
      });
    });

    it("should convert chained given to AST", () => {
      const testCase = "let test: A -> D = f given g given h";
      const ast = parseToAst(testCase);
      const decl = ast.declarations[0] as InstanceDeclaration;
      expect(decl.instance).toEqual({
        kind: "GivenExpression",
        morphism: { kind: "NamedInstance", name: "f" },
        instance: {
          kind: "GivenExpression",
          morphism: { kind: "NamedInstance", name: "g" },
          instance: { kind: "NamedInstance", name: "h" },
        },
      });
    });
  });

  describe("end-to-end", () => {
    it("should parse todo.spex file", () => {
      const fs = require("fs");
      const path = require("path");
      const code = fs.readFileSync(
        path.join(__dirname, "props/todo.spex"),
        "utf-8",
      );
      const ast = parseToAst(code);
      expect(ast.kind).toBe("SpexFile");
      expect(ast.declarations.length).toBe(20);
    });
  });
});
