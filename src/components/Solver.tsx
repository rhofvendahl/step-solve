import React from 'react';
import InputItem from './InputItem';
import StepItem from './StepItem';
import DescriptionItem from './DescriptionItem';
import ErrorItem from './ErrorItem';
import {
  // tokenizeLiteral,
  // tokenize,
  // establishNegatives,
  // resolveNegatives,
  // performMathOperation,
  // performOperation,
  evaluate,
  formatTokens
} from '../solve';
import type { Token } from '../solve';
import '../styles/Solver.css';

const Solver = () => {
  const [expression, setExpression] = React.useState("");
  const [steps, setSteps] = React.useState<Token[][] | null>(null)
  const [error, setError] = React.useState<Error | null>(null);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const text = event.target.value;
    setExpression(text);
    const evaluateResult = evaluate(text);
    if (evaluateResult instanceof Error) {
      console.log(evaluateResult.message);
      setSteps(null);
      setError(evaluateResult);
    } else {
      evaluateResult.forEach((evaluateResult) => {
        console.log(formatTokens(evaluateResult));
      });
      setSteps(evaluateResult);
      setError(null);
    };
  };

  const getDescriptions = () => {
    if (steps !== null && steps.length > 1) {
      return steps.slice(1).map((step, i) => (
        <DescriptionItem
          key={i}
          description={'[Description text.]'}
        />
      ));
    } else {
      return null;
    }
  }

  const getSteps = () => {
    if (steps !== null && steps.length === 0) {
      return null;
    } else if (steps !== null && steps.length > 0) {
      return (
        <>
          <StepItem
            initial={true}
            step={steps[0]}
          />
          {steps.slice(1).map((step, i) => (
            <StepItem
              key={i}
              step={step}
            />
          ))}
       </>
      );
    } else {
      if (error !== null) {
        return (
          <ErrorItem
            error={error}
          />
        );  
      } else {
        return (
          <ErrorItem
            error={new Error('Internal Error: Evaluation not available.')}
          />
        );
      }
    }
  }
  return (
    <div className='solver'>
      <div className = 'solver-left'>
        <InputItem
          value={expression}
          onChange={onInputChange}
        />
        {getDescriptions()}
      </div>
      <div className='solver-middle' />
      <div className = 'solver-right'>
        {getSteps()}
      </div>
    </div>
  );
};

export default Solver;
