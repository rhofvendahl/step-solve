const formatTokens = (tokens: Token[]): string => {
  let formatted = tokens.map((token) => token.value.toString()).join(' ')
  formatted = formatted.split('neg (').join('-(')
  return formatted
}

export type TokenType = 'operator' | 'number';
export type TokenValue = string | number;
export type Token = {
  type: TokenType,
  value: TokenValue
};

export type Interval = {
  start: number,
  end: number
}

export type Step = {
  tokens: Token[],
  description: string,
  computed: Interval | null,
  computeNext: Interval | null
}

const tokenizeLiteral = (literal: string): Token => {
  if (!isNaN(Number(literal)) && literal !== '') {
    if (literal.split('.').length === 2) {
      return {type: 'number', value: parseFloat(literal)};
    } else {
      return {type: 'number', value: parseInt(literal)};
    }
  } else {
    throw new Error('User Error: Literal not recognized.');
  }
};

const tokenize = (text: string): Token[] => {
  let tokens: Token[] = [];
  for (let i=0; i < text.length; i++) {
    // Char at i is a number or ".".
    if (!isNaN(parseInt(text.charAt(i))) || text.charAt(i) === '.') {
      let j = i;
      while (j < text.length && (!isNaN(parseInt(text.charAt(j))) || text.charAt(j) === '.')) {
        j += 1;
      }
      const literal = text.slice(i, j);
      const token = tokenizeLiteral(literal);
      tokens.push(token);
      i = j-1;
    // Char at i is an operator.
    } else if ('()^*/+-'.includes(text.charAt(i))) {
      const token: Token = {type: 'operator', value: text.charAt(i)}
      tokens.push(token);
    } else if (text.charAt(i) !== ' ') {
      throw new Error('User Error: "' + text[i] + '" is not a valid character.');
    }
  }
  return tokens;
};

// NOT intended to handle errors.
const establishNegatives = (tokens: Token[]): Token[] => {
  let newTokens: Token[] = [];
  for (let i=0; i < tokens.length; i++) {
    // Is a candidate for conversion to "neg".
    if (tokens[i].value === '-') {
      let isNegative = true;
      // Minus is at the end.
      if (i+1 === tokens.length) {
        isNegative = false;
      // Minus is followed by an operator other than "(".
      } else if (tokens[i+1].type === 'operator' && tokens[i+1].value !== '(') {
        isNegative = false;
      // Minus follows a number.
      } else if (i > 0 && tokens[i-1].type === 'number') {
        isNegative = false;
      // Minus is followed by a number followed by an exponent sign (which operates before negative conversion).
      } else if (i+2 < tokens.length && tokens[i+2].value === '^') {
        isNegative = false
      }

      if (isNegative) {
        newTokens.push({type: 'operator', value: 'neg'})
      } else {
        newTokens.push({type: 'operator', value: '-'})
      }
    // Not a candidate for conversion to "neg".
    } else {
      newTokens.push({type: tokens[i].type, value: tokens[i].value})
    }
  }
  return newTokens;
};

// Only handles errors related to bad "neg"s.
const resolveNegatives = (tokens: Token[]): Token[] => {
  let newTokens: Token[] = [];
  for (let i=0; i<tokens.length; i++) {
    if (tokens[i].value === 'neg') {
      // Is at the end of expression (internal because it shouldn't have been converted if at end).
      if (i+1 >= tokens.length) {
        throw new Error('Internal Error: Expression cannot end with a "neg" operator.');
      } else {
        const nextToken = tokens[i+1];
        // Is followed by "(".
        if (nextToken.value === '(') {
          newTokens.push({type: 'operator', value: 'neg'});
        // Is followed by a number.
        } else if (typeof nextToken.value == 'number') {
          let newValue = -1 * nextToken.value;
          // DO NOT resolve "neg 0" to "-0".
          if (nextToken.value === 0) {
            newValue = 0;
          }
          newTokens.push({type: 'number', value: newValue});
          i += 1;
        // Is followed by something other than "(" or a number (internal because shouldn't have been converted if so).
        } else {
          throw new Error('Internal Error: "neg"s must be followed by "(" or a number.');
        }
      }
    } else {
      newTokens.push({type: tokens[i].type, value: tokens[i].value});
    }
  }
  return newTokens;
};

// Assumes no "neg"s or parentheses; handles most other input logic errors.
const performMathOperation = (tokens: Token[]): Token[] => {
  if (tokens.length === 1) {
    if (tokens[0].type === 'operator') {
      throw new Error('User Error: Expression cannot consist only of an operator.');
    } else {
      return [{type: 'number', value: tokens[0].value}]; 
    }
  }

  const tokenValues: TokenValue[] = tokens.map((token) => token.value);
  const operators = ['^', '*', '/', '+', '-'];
  let operatorIndex: number | undefined = -1;
  for (let i=0; i<operators.length; i++) {
    if (tokenValues.includes(operators[i])) {
      operatorIndex = tokenValues.indexOf(operators[i]);
      break;
    };
  };

  if (operatorIndex === undefined) {
    throw new Error('User Error: Multiple tokens in expression with no operator.');
  } else if (operatorIndex === 0) {
    throw new Error('User Error: Expression cannot start with an operator.');
 } else if (operatorIndex === tokens.length-1) {
   throw new Error('User Error: Expression cannot end with an operator.');
  }

  let newToken: Token | undefined = undefined;

  const leftOperand: Token = tokens[operatorIndex-1];
  const rightOperand: Token = tokens[operatorIndex+1];
  const operator: Token = tokens[operatorIndex];
  if (typeof leftOperand.value === 'number' && typeof rightOperand.value === 'number') {
    let newValue: number | undefined = undefined;
    if (operator.value === '^') {
      newValue = Math.pow(leftOperand.value, rightOperand.value);
    } else if (operator.value === '*') {
      newValue = leftOperand.value*rightOperand.value;
    } else if (operator.value === '/') {
      newValue = leftOperand.value/rightOperand.value;
    } else if (operator.value === '+') {
      newValue = leftOperand.value+rightOperand.value;
    } else if (operator.value === '-') {
      newValue = leftOperand.value-rightOperand.value;
    }
    if (newValue === undefined) {
      throw new Error('Internal Error: "' + operator.value + '" operator not recognized.');
    } else {
      newToken = {type: 'number', value: newValue};
    }
  } else {
    throw new Error('User Error: "' + operator.value + '" operator requires numeric operands.');
  }
  
  if (newToken === undefined) {
    throw new Error('Internal error: performSimpleOperation function failed.');
  } else {
    const leftTokens = tokens.slice(0, operatorIndex-1).map((token) => ({type: token.type, value: token.value}));
    const rightTokens = tokens.slice(operatorIndex+2).map((token) => ({type: token.type, value: token.value}));
    const newTokens = leftTokens.concat([newToken]).concat(rightTokens);      
    return newTokens;
  }
};

// Only handles errors to do with parentheses
// I'm thinking THIS should return a step...
const performOperation = (tokens: Token[]): Token[] => {
  let parenStart: number | undefined = undefined;
  let parenEnd: number | undefined = undefined;
  for (let i=0; i<tokens.length; i++) {
    if (tokens[i].value === '(') {
      parenStart = i;
    } else if (tokens[i].value === ')') {
      parenEnd = i;
      break;
    }
  }

  if ((parenStart === undefined) !== (parenEnd === undefined)) {
    throw new Error('User Error: Mismatched parentheses.');
  }

  let newTokens: Token[] | undefined = undefined;

  // We'll be working within parentheses.
  if (parenStart !== undefined && parenEnd !== undefined) {
    const contents: Token[] = tokens.slice(parenStart+1, parenEnd);
    if (contents.length === 0) {
      throw new Error('User Error: Parentheses cannot be empty.');
    }
    const contentsOperated = performMathOperation(contents);
    // Contents operated contains single number.
    if (contentsOperated.length === 1 && contentsOperated[0].type === 'number') {
      // Remove parentheses when concatenating.
      const leftTokens = tokens.slice(0, parenStart).map((token) => ({type: token.type, value: token.value}));
      const rightTokens = tokens.slice(parenEnd+1).map((token) => ({type: token.type, value: token.value}));
      newTokens = leftTokens.concat(contentsOperated).concat(rightTokens);
    // Contents operated contains multiple numbers (error cases handled within perform math operation).
    } else {
      const leftTokens = tokens.slice(0, parenStart+1).map((token) => ({type: token.type, value: token.value}));
      const rightTokens = tokens.slice(parenEnd).map((token) => ({type: token.type, value: token.value}));
      newTokens = leftTokens.concat(contentsOperated).concat(rightTokens);
    }
  // There are no parentheses remaining.
  } else {
    newTokens = performMathOperation(tokens);
  }

  if (newTokens !== undefined) {
    newTokens = resolveNegatives(newTokens);
    return newTokens;
  } else {
    throw new Error('Internal Error: "performOperation" function failed.');
  }
};

const getOrdinalString = (n: number): string => {
  const nString = n.toString();
  if (n % 1 !== 0) {
    return nString + 'th';
  }
  const lastDigit = parseInt(nString.charAt(nString.length-1));
  const truncated = n % 100;
  let suffix = 'th';
  if (lastDigit === 1 && truncated !== 11) {
    suffix = 'st';
  } else if (lastDigit === 2 && truncated != 12) {
    suffix = 'nd';
  } else if (lastDigit === 3 && truncated != 13) {
    suffix = 'rd';
  }
  return nString + suffix;
}

// Awkward, but easier & simpler than tracking and passing changes through all of the index-changing operations (math operations, resolving parentheses, resolving negatives).
// Assumes both sequences describe valid equations.
// ISSUE: Doesn't handle case where input and output start with same digit (eg. 1^1 -> 1)
const describeOperation = (prevTokens: Token[], newTokens: Token[]): { operationInput: Interval, operationOutput: Interval, operationDescription: string } => {
  // Find the index of the
  let i = 0;
  let j = 0;
  let hasMatch = true;
  while (hasMatch) {
    while (prevTokens[i].type !== 'operator') {
      i += 1;
    }
    while (newTokens[j].type !== 'operator') {
      j += 1;
    }
    hasMatch = prevTokens[i].value === newTokens[j].value;
  }

  // TODO: Handle edge cases, like one or both being empty.
  let inputStart = 0;
  let outputStart = 0;
  // Move forward along both sets of tokens to guage how much of the two sequences are the same.
  while (inputStart < prevTokens.length && outputStart < newTokens.length && prevTokens[inputStart].value === newTokens[outputStart].value) {
    inputStart += 1;
    outputStart += 1;
  }
  let inputEnd = prevTokens.length-1;
  let outputEnd = newTokens.length-1;
  // Move backward along both sets of tokens to guage how much of the two sequences are the same.
  while (inputEnd > 0 && outputEnd > 0 && prevTokens[inputEnd].value === newTokens[outputEnd].value) {
    inputEnd -= 1;
    outputEnd -= 1;
  }
  const inputTokens = prevTokens.slice(inputStart, inputEnd+1);
  let operatorIndex = 0;
  for ( ; operatorIndex < inputTokens.length; operatorIndex++) {
    if (inputTokens[operatorIndex].type === 'operator' && inputTokens[operatorIndex].value !== '(' && inputTokens[operatorIndex].value !== ')') {
      break;
    }
  }
  let description: string | undefined = undefined;
  console.log('DESCRIBE OPERATION')
  console.log('prevTokens', formatTokens(prevTokens))
  console.log('newTokens', formatTokens(newTokens))
  console.log('inputTokens', formatTokens(inputTokens))
  // Catch any index errors resulting from an operator at the start or end (which shouldn't happen);
  if (operatorIndex === 0 || operatorIndex === inputTokens.length-1) {
    throw new Error('Internal Error: "describeOperation" function recieved a misplaced operator.')
  }
  const leftOperand = inputTokens[operatorIndex-1].value;
  const rightOperand = inputTokens[operatorIndex+1].value;
  if (typeof leftOperand !== 'number' || typeof rightOperand !== 'number') {
    throw new Error('Internal Error: "describeOperation" function received invalid operands.');
  }
  if (inputTokens[operatorIndex].value === '^') {
    description = 'raise ' + inputTokens[operatorIndex-1].value.toString() + ' to the ' + getOrdinalString(rightOperand) + ' power';
  } else if (inputTokens[operatorIndex].value === '*') {
    description = 'multiply ' + inputTokens[operatorIndex-1].value.toString() + ' by ' + inputTokens[operatorIndex+1].value.toString();
  } else if (inputTokens[operatorIndex].value === '/') {
    description = 'divide ' + inputTokens[operatorIndex-1].value.toString() + ' by ' + inputTokens[operatorIndex+1].value.toString();
  } else if (inputTokens[operatorIndex].value === '+') {
    description = 'add ' + inputTokens[operatorIndex+1].value.toString() + ' to ' + inputTokens[operatorIndex-1].value.toString()
  } else if (inputTokens[operatorIndex].value === '-') {
    description = 'subtract ' + inputTokens[operatorIndex+1].value.toString() + ' from ' + inputTokens[operatorIndex-1].value.toString();
  }
  if (description === undefined) {
    throw new Error('Internal Error: function "describeOperation" failed.');
  }
  return {
    operationInput: {
      start: inputStart,
      end: inputEnd+1
    },
    operationOutput: {
      start: outputStart,
      end: outputEnd+1
    },
    operationDescription: description
  };
};

const evaluate = (text: string): Step[] | Error => {
  try {
    let tokens = tokenize(text);
    tokens = establishNegatives(tokens);
    tokens = resolveNegatives(tokens);
    if (tokens.length === 0) {
      return [];
    } else if (tokens.length === 1 && tokens[0].type === 'operator') {
      throw new Error('User Error: Expression cannot consist of a single operator.');
    }
    let prevStep: Step = {
      tokens: tokens,
      description: '[Initial description.]',
      computeNext: null,
      computed: null,
    };
    const steps: Step[] = [];
    while (prevStep.tokens.length > 1) {
      const tokens = performOperation(prevStep.tokens);
      const { operationInput, operationOutput, operationDescription } = describeOperation(prevStep.tokens, tokens);
      prevStep.computeNext = operationInput;
      steps.push(prevStep);
      prevStep = {
        computeNext: null,
        tokens: tokens,
        description: operationDescription,
        computed: operationOutput
      }
    }
    steps.push(prevStep);
    return steps;
  } catch (error) {
    return error;
  }
};

export {
  tokenizeLiteral,
  tokenize,
  establishNegatives,
  resolveNegatives,
  performMathOperation,
  performOperation,
  describeOperation,
  evaluate,
  formatTokens
};

// NOTE
  // Preference is to trust token.type, with typeof used when necessary for type narrowing.

// TODO
  // Returns and conditionals and exceptions all over the place are leaving things a mess (especially performMathOperation).
    // In theory having early returns makes it so there are guarantees down the line, but that gets messy fast.....
  // Ya, checks and exceptions are all over the place. resolve that.
  // Consider un-refactoring the '"number"' back to '"float" | "integer"', since apparently JS/TS is terrible at discerning floats/ints from numbers