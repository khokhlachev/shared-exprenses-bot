const OPERATOR_WEIGHT: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
}
const DIGIT: Record<string, number> = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
}

const OPENING_BRACKET = "("
const CLOSING_BRACKET = ")"

// Shunting yard parser
function covertToRpn(input: string): string[] {
  const operators: string[] = []
  const output: string[] = []

  let prevCharIsDigit = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (DIGIT[char]) {
      if (prevCharIsDigit) {
        output[output.length - 1] += char // concat with the last digit
      } else {
        output.push(char) // start new digit
        prevCharIsDigit = true
      }
    } else {
      prevCharIsDigit = false

      if (OPERATOR_WEIGHT[char]) {
        while (
          operators.length > 0 &&
          OPERATOR_WEIGHT[operators[operators.length - 1]] >
            OPERATOR_WEIGHT[char]
        ) {
          output.push(operators.pop() as string)
        }

        operators.push(char)
      } else if (char === OPENING_BRACKET) {
        operators.push(char)
      } else if (char === CLOSING_BRACKET) {
        while (operators[operators.length - 1] !== OPENING_BRACKET) {
          if (operators.length === 0) {
            throw new Error("brackets mismatch")
          }

          output.push(operators.pop() as string)
        }

        operators.pop() // discard opening bracket
      } else if (char === " ") {
        continue
      } else {
        throw new Error("unreconized character")
      }
    }
  }

  while (operators.length > 0) {
    const char = operators.pop()

    if (char === OPENING_BRACKET) {
      throw new Error("brackets mismatch")
    }

    output.push(char as string)
  }

  return output
}

// infix evaluation function
export function calc(input: string): number | undefined {
  try {
    const stack: number[] = []
    const rpn = covertToRpn(input)

    for (const char of rpn) {
      if (OPERATOR_WEIGHT[char]) {
        const b = stack.pop() as number
        const a = stack.pop() as number

        switch (char) {
          case "+":
            stack.push(a + b)
            break
          case "-":
            stack.push(a - b)
            break
          case "*":
            stack.push(a * b)
            break
          case "/":
            stack.push(a / b)
            break
          default:
            throw new Error("unrecognized operator")
        }
      } else {
        stack.push(parseInt(char, 10))
      }
    }

    return stack[0]
  } catch (err: any) {
    return undefined
  }
}
