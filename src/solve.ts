import Description from "./components/Description";

// Debugging utility.
const formatTokens = (tokens: Token[]): string => {
  let formatted = tokens.map((token) => token.value.toString()).join(' ')
  formatted = formatted.split('neg (').join('-(')
  return formatted
}

export type TokenType = 'operator' | 'number' | 'parentheses';
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
  computed: number | null,
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
    } else if ('^*/+-'.includes(text.charAt(i))) {
      tokens.push({type: 'operator', value: text.charAt(i)});
    } else if ('()'.includes(text.charAt(i))) {
      tokens.push({type: 'parentheses', value: text.charAt(i)});      
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
      // Minus is followed by an operator or ")" (i.e. if followed by "(" then isNegative would remain "true").
      } else if (tokens[i+1].type === 'operator' || tokens[i+1].value === ')') {
        isNegative = false;
      // Minus follows a number.
      } else if (i > 0 && tokens[i-1].type === 'number') {
        isNegative = false;
      }
      // // Minus is followed by a number followed by an exponent sign (which operates before negative conversion).
      // } else if (i+2 < tokens.length && tokens[i+2].value === '^') {
      //   isNegative = false
      // }

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
      // Handle bad "neg"s.
      if (i+1 >= tokens.length) {
        throw new Error('Internal Error: Expression cannot end with a "neg" operator.');
      } else if (tokens[i+1].type !== 'number' && tokens[i+1].value !== '(') {
        throw new Error('Internal Error: "neg"s must be followed by "(" or a number.');
      }
      const nextToken = tokens[i+1];
      // If "neg" followed by a number that's not followed by "^".
      if (typeof nextToken.value === 'number' && !(i+2 < tokens.length && tokens[i+2].value === '^')) {
        let newValue = -1 * nextToken.value;
        // Prevent "-0" values.
        if (newValue === -0) {
          newValue = 0;
        }
        newTokens.push({type: 'number', value: newValue});
        i += 1;
      } else {
        newTokens.push({type: 'operator', value: 'neg'});
      }
    } else {
      newTokens.push({type: tokens[i].type, value: tokens[i].value});
    }
  }
  return newTokens;
};

const formatOrdinal = (n: number): string => {
  const nString = n.toString();
  if (n % 1 !== 0) {
    return nString + 'th';
  }
  const lastDigit = parseInt(nString.charAt(nString.length-1));
  const truncated = n % 100;
  let suffix = 'th';
  if (lastDigit === 1 && truncated !== 11) {
    suffix = 'st';
  } else if (lastDigit === 2 && truncated !== 12) {
    suffix = 'nd';
  } else if (lastDigit === 3 && truncated !== 13) {
    suffix = 'rd';
  }
  return nString + suffix;
}

const formatFloat = (number: number, digits: number): string => {
  let formatted: number | string = number;
  // Using workaround to assess digits after decimal, as  "3.1 % 1" yields "0.1000000000000000001" (not what we want).
  if (formatted % 1 !== 0 && formatted.toString().split('.')[1].length > digits) {
    formatted = parseFloat(number.toFixed(digits)).toString() + '...';
  } else {
    formatted = number.toString();
  }
  return formatted;
}

// Assumes no "neg"s or parentheses; handles most other input logic errors.
const performMathOperation = (tokens: Token[]): { tokens: Token[], computed: number, prevComputeNext: Interval, description: string } => {
  if (tokens.length === 1) {
    if (tokens[0].type === 'operator') {
      throw new Error('User Error: Expression cannot consist only of an operator.');
    } else {
      return { tokens: [{type: 'number', value: tokens[0].value}], computed: 0, prevComputeNext: { start: 0, end: 1 }, description: 'resolve parentheses' }; 
    }
  }

  let operatorIndex: number | undefined = undefined;
  // Exponents are right-associative, so are applied right to left.
  for (let i=tokens.length-1; i >= 0; i--) {
    if (tokens[i].value === '^') {
      operatorIndex = i;
      break;
    }
  }
  // Search for "*"s or "/"s, left to right.
  if (operatorIndex === undefined) {
    for (let i=0; i < tokens.length; i++) {
      if (tokens[i].value === '*' || tokens[i].value === '/') {
        operatorIndex = i;
        break;
      }
    }
  }
  // Search for "+"s or "-"s, left to right.
  if (operatorIndex === undefined) {
    for (let i=0; i < tokens.length; i++) {
      if (tokens[i].value === '+' || tokens[i].value === '-') {
        operatorIndex = i;
        break;
      }
    }
  }

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
  let description = '';
  if (typeof leftOperand.value === 'number' && typeof rightOperand.value === 'number') {
    let newValue: number | undefined = undefined;
    if (operator.value === '^') {
      if (leftOperand.value < 0 && rightOperand.value % 1 !== 0) {
        throw new Error('User Error: ' + leftOperand.value.toString() + '^' + rightOperand.value.toString() + ' results in an imaginary number, which is not supported.')
      }
      newValue = Math.pow(leftOperand.value, rightOperand.value);
      description = 'raise ' + formatFloat(leftOperand.value, 3) + ' to the ' + formatOrdinal(rightOperand.value) + ' power';
    } else if (operator.value === '*') {
      newValue = leftOperand.value*rightOperand.value;
      description = 'multiply ' + formatFloat(leftOperand.value, 3) + ' by ' + formatFloat(rightOperand.value, 3);
    } else if (operator.value === '/') {
      newValue = leftOperand.value/rightOperand.value;
      description = 'divide ' + formatFloat(leftOperand.value, 3) + ' by ' + formatFloat(rightOperand.value, 3);
    } else if (operator.value === '+') {
      newValue = leftOperand.value+rightOperand.value;
      description = 'add ' + formatFloat(rightOperand.value, 3) + ' to ' + formatFloat(leftOperand.value, 3);
    } else if (operator.value === '-') {
      newValue = leftOperand.value-rightOperand.value;
      description = 'subtract ' + formatFloat(rightOperand.value, 3) + ' from ' + formatFloat(leftOperand.value, 3);
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
    throw new Error('Internal Error: performSimpleOperation function failed.');
  } else {
    const leftTokens = tokens.slice(0, operatorIndex-1).map((token) => ({type: token.type, value: token.value}));
    const rightTokens = tokens.slice(operatorIndex+2).map((token) => ({type: token.type, value: token.value}));
    const newTokens = leftTokens.concat([newToken]).concat(rightTokens);      
    return {
      tokens: newTokens,
      computed: operatorIndex-1,
      prevComputeNext: { start: operatorIndex-1, end: operatorIndex+2 },
      description: description
    }
  }
};

// Only handles errors to do with parentheses.
const performOperation = (tokens: Token[]): { tokens: Token[], computed: number, description: string, prevComputeNext: Interval } => {
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
  let computed: number | undefined = undefined;
  let description: string | undefined = undefined;
  let prevComputeNext: Interval | undefined = undefined;
  // We'll be working within parentheses.
  if (parenStart !== undefined && parenEnd !== undefined) {
    const contents: Token[] = tokens.slice(parenStart+1, parenEnd);
    if (contents.length === 0) {
      throw new Error('User Error: Parentheses cannot be empty.');
    }
    const { tokens: contentsOperated, computed: contentsComputed, prevComputeNext: contentsPrevComputeNext, description: contentsDescription } = performMathOperation(contents);
    description = contentsDescription;
    // Contents operated contains single (hopefully) number.
    if (contentsOperated.length === 1) {
      // Remove parentheses when concatenating.
      const leftTokens = tokens.slice(0, parenStart).map((token) => ({type: token.type, value: token.value}));
      const rightTokens = tokens.slice(parenEnd+1).map((token) => ({type: token.type, value: token.value}));
      newTokens = leftTokens.concat(contentsOperated).concat(rightTokens);
      computed = contentsComputed + leftTokens.length;
      prevComputeNext = { start: contentsPrevComputeNext.start + leftTokens.length, end: contentsPrevComputeNext.end + leftTokens.length+2 };
    // Contents operated contains multiple numbers (error cases handled within perform math operation).
    } else {
      const leftTokens = tokens.slice(0, parenStart+1).map((token) => ({type: token.type, value: token.value}));
      const rightTokens = tokens.slice(parenEnd).map((token) => ({type: token.type, value: token.value}));
      newTokens = leftTokens.concat(contentsOperated).concat(rightTokens);
      computed = contentsComputed + leftTokens.length;
      prevComputeNext = { start: contentsPrevComputeNext.start + leftTokens.length, end: contentsPrevComputeNext.end + leftTokens.length };
    }
  // There are no parentheses remaining.
  } else {
    const { tokens: tokensTemp, computed: computedTemp, prevComputeNext: prevComputeNextTemp, description: descriptionTemp } = performMathOperation(tokens);
    newTokens = tokensTemp;
    computed = computedTemp;
    description = descriptionTemp;
    prevComputeNext = prevComputeNextTemp;
  }
  const newTokensResolved = resolveNegatives(newTokens);
  // NOTE pretty sure we can assume that negatives were only resolved on the left hand side of "computed".
  const nResolvedNegatives = newTokens.length - newTokensResolved.length;
  const computedResolved = computed - nResolvedNegatives;
  return {
    tokens: newTokensResolved,
    computed: computedResolved,
    description: description,
    prevComputeNext: prevComputeNext
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
      const { tokens, computed, prevComputeNext, description } = performOperation(prevStep.tokens);
      prevStep.computeNext = prevComputeNext;
      steps.push(prevStep);
      prevStep = {
        computeNext: null,
        tokens: tokens,
        description: description,
        computed: computed
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
  // describeOperation,
  evaluate,
  formatTokens,
  formatFloat
};