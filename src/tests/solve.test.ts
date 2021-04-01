import {
  tokenizeLiteral,
  tokenize,
  establishNegatives,
  resolveNegatives,
  performMathOperation,
  performOperation,
  // describeOperation,
  evaluate,
} from '../solve';
import type {
  Token,
  // Interval,
  // Step
} from '../solve';

const openParenToken: Token = { type: 'parentheses', value: '(' };
const closeParenToken: Token = { type: 'parentheses', value: ')' };
const exponentToken: Token = { type: 'operator', value: '^' };
const negativeToken: Token = { type: 'operator', value: 'neg' };
const multiplyToken: Token = { type: 'operator', value: '*' };
const divideToken: Token = { type: 'operator', value: '/' };
const plusToken: Token = { type: 'operator', value: '+' };
const minusToken: Token = { type: 'operator', value: '-' };

const negativeOneToken: Token = { type: 'number', value: -1 };
const zeroToken: Token = { type: 'number', value: 0 };
const pointFiveToken: Token = { type: 'number', value: .5 };
const oneToken: Token = { type: 'number', value: 1 };
const twoToken: Token = { type: 'number', value: 2 };
const threeToken: Token = { type: 'number', value: 3 };
const fourToken: Token = { type: 'number', value: 4 };

describe('Test "tokenizeLiteral" function.', () => {
  test('Float literals yield number tokens.', () => {
    expect(tokenizeLiteral('.1')).toStrictEqual({ type: 'number', value: 0.1 });
    expect(tokenizeLiteral('1.')).toStrictEqual({ type: 'number', value: 1.0 });
    expect(tokenizeLiteral('1.1')).toStrictEqual({ type: 'number', value: 1.1 });
  });
  test('Integer literals yield number tokens.', () => {
    expect(tokenizeLiteral('0')).toStrictEqual({ type: 'number', value: 0 });
    expect(tokenizeLiteral('1')).toStrictEqual({ type: 'number', value: 1 });
  });
  test('Empty strings throw an error.', () => {
    expect(() => tokenizeLiteral('')).toThrow(Error);
  });
  test('"." throws an error.', () => {
    expect(() => tokenizeLiteral('.')).toThrow(Error);
  });
  test('Literals with multiple "."s throw errors.', () => {
    expect(() => tokenizeLiteral('123.2.4')).toThrow(Error);
  });
  test('Literals with alphabetic chars throw errors.', () => {
    expect(() => tokenizeLiteral('cat')).toThrow(Error);
    expect(() => tokenizeLiteral('1cat')).toThrow(Error);
    expect(() => tokenizeLiteral('cat1')).toThrow(Error);
    expect(() => tokenizeLiteral('1.cat')).toThrow(Error);
  });
  test('Literals with non-alphanumeric chars throw errors.', () => {
    expect(() => tokenizeLiteral('/')).toThrow(Error);
    expect(() => tokenizeLiteral('1/')).toThrow(Error);
    expect(() => tokenizeLiteral('/1')).toThrow(Error);
  });
});

describe('Test "tokenize" function.', () => {
  test('Empty strings yield empty token arrays.', () => {
    expect(tokenize('')).toStrictEqual([]);
  });
  test('Single operators yield single operator tokens.', () => {
    expect(tokenize('^')).toStrictEqual([{ type: 'operator', value: '^' }]);
    expect(tokenize('*')).toStrictEqual([{ type: 'operator', value: '*' }]);
    expect(tokenize('/')).toStrictEqual([{ type: 'operator', value: '/' }]);
    expect(tokenize('+')).toStrictEqual([{ type: 'operator', value: '+' }]);
    expect(tokenize('-')).toStrictEqual([{ type: 'operator', value: '-' }]);
  });
  test('Single parentheses yield single operator tokens.', () => {
    expect(tokenize('(')).toStrictEqual([{ type: 'parentheses', value: '(' }]);
    expect(tokenize(')')).toStrictEqual([{ type: 'parentheses', value: ')' }]);
  });  
  test('Integers yield integer tokens.', () => {
    expect(tokenize('0')).toStrictEqual([{ type: 'number', value: 0 }]);
    expect(tokenize('1')).toStrictEqual([{ type: 'number', value: 1 }]);
    expect(tokenize('00')).toStrictEqual([{ type: 'number', value: 0 }]);
    expect(tokenize('01')).toStrictEqual([{ type: 'number', value: 1 }]);
    expect(tokenize('1234567890')).toStrictEqual([{ type: 'number', value: 1234567890 }]);
  });
  test('Floats yield float tokens.', () => {
    expect(tokenize('0.')).toStrictEqual([{ type: 'number', value: 0 }]);
    expect(tokenize('.0')).toStrictEqual([{ type: 'number', value: 0 }]);
    expect(tokenize('1.')).toStrictEqual([{ type: 'number', value: 1.0 }]);
    expect(tokenize('.1')).toStrictEqual([{ type: 'number', value: 0.1 }]);
    expect(tokenize('1234567890.1234567890')[0].value).toBeCloseTo(1234567890.1234567890);
  });
  test('Spaces don\'t yield tokens.', () => {
    expect(tokenize(' ')).toStrictEqual([]);
    expect(tokenize('     ')).toStrictEqual([]);
    expect(tokenize('  1  ')).toStrictEqual([{ type: 'number', value: 1 }]);
    expect(tokenize('1   2')).toStrictEqual([{ type: 'number', value: 1 }, { type: 'number', value: 2 }]);
  });
  // TODO: Test that integers don't yield float tokens, floats don't yield integer tokens.
  test('Input strings yield appropriate token arrays', () => {
    expect(tokenize('1 2 3')).toStrictEqual([{ type: 'number', value: 1 }, { type: 'number', value: 2 }, { type: 'number', value: 3 }]);
    expect(tokenize('(1)')).toStrictEqual([{ type: 'parentheses', value: '(' }, { type: 'number', value: 1 }, { type: 'parentheses', value: ')' }]);
    expect(tokenize('2^3')).toStrictEqual([{ type: 'number', value: 2 }, { type: 'operator', value: '^' }, { type: 'number', value: 3 }]);
  });
  test('Input strings with invalid characters throw errors.', () => {
    expect(() => tokenize('a')).toThrow(Error);
    expect(() => tokenize('1a')).toThrow(Error);
    expect(() => tokenize('a 1')).toThrow(Error);
    expect(() => tokenize('1 a')).toThrow(Error);
    expect(() => tokenize('?')).toThrow(Error);
    expect(() => tokenize('!')).toThrow(Error);
  });
});

describe('Test "establishNegatives" function.', () => {
  test('A minus at the end of a token array is not established as a negative.', () => {
    expect(establishNegatives([oneToken, minusToken])).toStrictEqual([oneToken, minusToken]);
  });
  test('A minus followed by an operator other than "( is not established as a negative.', () => {
    expect(establishNegatives([minusToken, multiplyToken])).toStrictEqual([minusToken, multiplyToken]);
  });
  test('A minus that follows a number is not established as a negative.', () => {
    expect(establishNegatives([oneToken, minusToken])).toStrictEqual([oneToken, minusToken]);
  });
  // test('A minus followed by a number followed by an exponent sign is not established as a negative.', () => {
  //   expect(establishNegatives([minusToken, oneToken, exponentToken])).toStrictEqual([minusToken, oneToken, exponentToken]);
  // });
  test('A minus not disqualified by the above cases is established as a negative.', () => {
    expect(establishNegatives([minusToken, oneToken])).toStrictEqual([negativeToken, oneToken]);
    expect(establishNegatives([minusToken, openParenToken])).toStrictEqual([negativeToken, openParenToken]);
    expect(establishNegatives([minusToken, oneToken, multiplyToken])).toStrictEqual([negativeToken, oneToken, multiplyToken]);
  });
});

describe('Test resolveNegatives function.', () => {
  test('A negative sign followed by an open paren remains a negative sign.', () => {
    expect(resolveNegatives([negativeToken, openParenToken])).toStrictEqual([negativeToken, openParenToken]);
  });
  test('A negative sign followed by a number NOT followed by "^" flips that number\'s sign.', () => {
    expect(resolveNegatives([negativeToken, oneToken])).toStrictEqual([negativeOneToken]);
    expect(resolveNegatives([negativeToken, negativeOneToken])).toStrictEqual([oneToken]);
  });
  test('A negative sign followed by a numbe followed by "^" is NOT resolved.', () => {
    expect(resolveNegatives([negativeToken, oneToken, exponentToken, oneToken])).toStrictEqual([negativeToken, oneToken, exponentToken, oneToken])
  });
  test('A negative sign followed by a zero resolves to a (non-negative) zero.', () => {
    expect(resolveNegatives([negativeToken, zeroToken])).toStrictEqual([zeroToken])
  });
  test('A negative sign at the end of array throws an error.', () => {
    expect(() => resolveNegatives([oneToken, negativeToken])).toThrow(Error);
  });
  test('A negative sign not followed by a "(" or a number throws an error.', () => {
    expect(() => resolveNegatives([negativeToken, multiplyToken])).toThrow(Error);
    expect(() => resolveNegatives([negativeToken, openParenToken])).not.toThrow(Error);
    expect(() => resolveNegatives([negativeToken, oneToken])).not.toThrow(Error);
  });
});

describe('Test "performMathOperation" function.', () => {
  test('A single number token returns as-is.', () => {
    expect(performMathOperation([oneToken])).toStrictEqual([oneToken]);
  });
  test('All operations work as expected.', () => {
    expect(performMathOperation([twoToken, exponentToken, twoToken])).toStrictEqual([fourToken]);
    expect(performMathOperation([oneToken, multiplyToken, twoToken])).toStrictEqual([twoToken]);
    expect(performMathOperation([fourToken, divideToken, twoToken])).toStrictEqual([twoToken]);
    expect(performMathOperation([oneToken, plusToken, twoToken])).toStrictEqual([threeToken]);
    expect(performMathOperation([threeToken, minusToken, oneToken])).toStrictEqual([twoToken]);
  });
  test('All operations are performed in order.', () => {
    // Exponentiation before multiplication & division: 2^2*2 should be 4*2
    expect(performMathOperation([twoToken, exponentToken, twoToken, multiplyToken, twoToken])).toStrictEqual([fourToken, multiplyToken, twoToken]);
    // Multiplication and division right to left: 2/2*2 should be 1*2
    expect(performMathOperation([twoToken, divideToken, twoToken, multiplyToken, twoToken])).toStrictEqual([oneToken, multiplyToken, twoToken]);
    // Multiplication and division before addition & subtraction: 2/2+2 should be 1+2
    expect(performMathOperation([twoToken, divideToken, twoToken, plusToken, twoToken])).toStrictEqual([oneToken, plusToken, twoToken]);
    // Addition & subtraction right to left: 2-2+2 should be 0+2
    expect(performMathOperation([twoToken, minusToken, twoToken, plusToken, twoToken])).toStrictEqual([zeroToken, plusToken, twoToken]);
  });
  test('A single operator token throws an error.', () => {
    expect(() => performMathOperation([plusToken])).toThrow(Error);
  });
  test('Multiple number tokens without an operator throw an error.', () => {
    expect(() => performMathOperation([oneToken, twoToken])).toThrow(Error);
  });
  test('Starting with an operator throws an error.', () => {
    expect(() => performMathOperation([plusToken, oneToken])).toThrow(Error);
    // Negatives should already be resolved by this point.
    expect(() => performMathOperation([minusToken, oneToken])).toThrow(Error);
  });
  test('Ending with an operator throws an error.', () => {
    expect(() => performMathOperation([oneToken, plusToken])).toThrow(Error);
  });
  test('An operator with non-numeric operands throws an error.', () => {
    expect(() => performMathOperation([oneToken, plusToken, multiplyToken])).toThrow(Error);
    expect(() => performMathOperation([multiplyToken, plusToken, oneToken])).toThrow(Error);
  });
});

describe('Test "performOperation" function.', () => {
  test('A single number inside a set of parentheses evaluates to that number.', () => {
    expect(performOperation([openParenToken, oneToken, closeParenToken])).toStrictEqual([oneToken]);
  });
  test('An operation is performed within a set of parentheses.', () => {
    expect(performOperation([openParenToken, oneToken, plusToken, oneToken, multiplyToken, twoToken, closeParenToken])).toStrictEqual([openParenToken, oneToken, plusToken, twoToken, closeParenToken]);
  });
  test('An operation within parentheses which return a single number resolves those parentheses.', () => {
    expect(performOperation([openParenToken, oneToken, plusToken, oneToken, closeParenToken])).toStrictEqual([twoToken])
  });
  test('A negative sign in front of a number within parentheses is resolved when those parentheses are resolved.', () => {
    expect(performOperation([negativeToken, openParenToken, oneToken, closeParenToken])).toStrictEqual([negativeOneToken]);
  });
  // Only throws an error if first innermost parentheses are mismatched
  // (eg. "((1) doesn't throw an error, because it stops at "(1)"").
  test('A sequence with (first innermost) mismatched parentheses throws an error.', () => {
    expect(() => performOperation([openParenToken, oneToken])).toThrow(Error);
    expect(() => performOperation([oneToken, closeParenToken])).toThrow(Error);
    expect(() => performOperation([closeParenToken, oneToken, closeParenToken])).toThrow(Error);
    expect(() => performOperation([openParenToken, oneToken, closeParenToken])).not.toThrow(Error);
  });
  test('A sequence with (first innermost) empty parentheses throws an error.', () => {
    expect(() => performOperation([openParenToken, closeParenToken])).toThrow(Error);
  });
});

// NOTE: This won't be going into math and order of operations much, as those are covered above.
describe('Test "evaluate" function.', () => {
  test('An empty string returns an empty steps array.', () => {
    expect(evaluate('')).toStrictEqual([]);
  });
  test('An single number returns a single step with appropriate tokens.', () => {
    const steps = evaluate('1');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps[0]).toHaveProperty('tokens', [oneToken]);
    }
  });
  test('An single operator returns an error.', () => {
    expect(evaluate('+')).toBeInstanceOf(Error);
  });
  test('A simple equation returns steps with appropriate tokens.', () => {
    const steps = evaluate('1+2');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps.map((step) => step.tokens)).toStrictEqual([
        [oneToken, plusToken, twoToken],
        [threeToken]
      ]);
    }
  });
  test('An equation with parentheses returns steps with appropriate tokens.', () => {
    const steps = evaluate('(1+1)*2');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps.map((step) => step.tokens)).toStrictEqual([
        [openParenToken, oneToken, plusToken, oneToken, closeParenToken, multiplyToken, twoToken],
        [twoToken, multiplyToken, twoToken],
        [fourToken]
      ]);
    }
  });
});

// And now, the moment of truth...
describe('TEST TAKE HOME DOCUMENT EXAMPLES.', () => {
  test('Example 1 evaluates correctly.', () => {
    const steps = evaluate('1 + 2');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps.map((step) => step.tokens)).toStrictEqual([
        [oneToken, plusToken, twoToken],
        [threeToken]
      ]);
    }
  });
  test('Example 2 evaluates correctly.', () => {
    const steps = evaluate('4*5/2');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps.map((step) => step.tokens)).toStrictEqual([
        [fourToken, multiplyToken, { type: 'number', value: 5 }, divideToken, twoToken],
        [{ type: 'number', value: 20 }, divideToken, twoToken],
        [{ type: 'number', value: 10 }]
      ]);
    }
  });
  test('Example 3 evaluates correctly.', () => {
    const steps = evaluate('-5+-8--11*2');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps.map((step) => step.tokens)).toStrictEqual([
        [
          { type: 'number', value: -5 },
          plusToken,
          { type: 'number', value: -8 },
          minusToken,
          { type: 'number', value: -11 },
          multiplyToken,
          twoToken
        ], [{ type: 'number', value: -5 }, plusToken, { type: 'number', value: -8 }, minusToken, { type: 'number', value: -22 }],
        [{ type: 'number', value: -13 }, minusToken, { type: 'number', value: -22 }],
        [{ type: 'number', value: 9 }]
      ]);
    }
  });
  test('Example 4 evaluates correctly.', () => {
    const steps = evaluate('-.32       /.5');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps.map((step) => step.tokens)).toStrictEqual([
        [{ type: 'number', value: -.32 }, divideToken, pointFiveToken],
        [{ type: 'number', value: -.64 }],
      ]);
    }
  });
  test('Example 5 evaluates correctly.', () => {
    const steps = evaluate('(4-2)*3.5');
    if (steps instanceof Error) {
      throw steps;
    } else {
      expect(steps.map((step) => step.tokens)).toStrictEqual([
        [openParenToken, fourToken, minusToken, twoToken, closeParenToken, multiplyToken, { type: 'number', value: 3.5 }],
        [twoToken, multiplyToken, { type: 'number', value: 3.5 }],
        [{ type: 'number', value: 7.0 }]
      ]);
    }
  });
  test('Example 6 evaluates correctly.', () => {
    expect(evaluate('2+-+-4')).toBeInstanceOf(Error);
  });
  test('Example 7 evaluates correctly..', () => {
    expect(evaluate('19 + cinnamon')).toBeInstanceOf(Error);
  });
});

// TODO
  // Test that token arrays are being replaced and not changed.
  // Test "describeOperation".
  // Test non-token properties of "evaluate".